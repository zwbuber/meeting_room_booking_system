import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  HttpStatus,
  Inject,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
  UnauthorizedException,
  BadRequestException,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { EmailService } from 'src/email/email.service';
import { RedisService } from 'src/redis/redis.service';
import { RequireLogin, UserInfo } from 'src/custom.decorator';
import { generateParseIntPipe } from 'src/utils';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { UpdateUserDto } from './dto/udpate-user.dto';
import { UserDetailVo } from './vo/user-info.vo';
import { LoginUserVo } from './vo/login-user.vo';
import { RefreshTokenVo } from './vo/refresh-token.vo';
import { FileInterceptor } from '@nestjs/platform-express';
import * as path from 'path';
import { storage } from 'src/my-file-storage';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';

@ApiTags('用户管理模块')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Inject(ConfigService)
  private configService: ConfigService; // 配置文件

  @Inject(JwtService)
  private jwtService: JwtService; // jwt

  @Inject(EmailService)
  private emailService: EmailService; // 邮件服务

  @Inject(RedisService)
  private redisService: RedisService; // 缓存服务

  @ApiResponse({
    status: HttpStatus.OK,
    description: '发送成功',
    type: String,
  })
  @Get('register-captcha')
  async captcha(@Query('address') address: string) {
    const code = Math.random().toString().slice(2, 8);

    await this.redisService.set(`captcha_${address}`, code, 5 * 60);

    await this.emailService.sendMail({
      to: address,
      subject: '注册验证码',
      html: `<p>你的注册验证码是 ${code}</p>`,
    });
    return '发送成功';
  }

  @ApiBody({ type: RegisterUserDto })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '验证码已失效/验证码不正确/用户已存在',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '注册成功/失败',
    type: String,
  })
  @Post('register')
  async register(@Body() registerUser: RegisterUserDto) {
    return await this.userService.register(registerUser);
  }

  @Get('init-data')
  async initData() {
    await this.userService.initData();
    return 'done';
  }

  @ApiBody({
    type: LoginUserDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '用户不存在/密码错误',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '用户信息和 token',
    type: LoginUserVo,
  })
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async userLogin(@UserInfo() vo: LoginUserVo) {
    vo.accessToken = this.jwtService.sign(
      {
        userId: vo.userInfo.id,
        username: vo.userInfo.username,
        email: vo.userInfo.email,
        roles: vo.userInfo.roles,
        permissions: vo.userInfo.permissions,
      },
      {
        expiresIn:
          this.configService.get('jwt_access_token_expires_time') || '30m',
      },
    );

    vo.refreshToken = this.jwtService.sign(
      {
        userId: vo.userInfo.id,
      },
      {
        expiresIn:
          this.configService.get('jwt_refresh_token_expres_time') || '7d',
      },
    );

    return vo;
  }

  @ApiBody({
    type: LoginUserDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '用户不存在/密码错误',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '用户信息和 token',
    type: LoginUserVo,
  })
  @Post('admin/login')
  async adminLogin(@Body() loginUser: LoginUserDto) {
    const vo = await this.userService.login(loginUser, true);

    vo.accessToken = this.jwtService.sign(
      {
        userId: vo.userInfo.id,
        username: vo.userInfo.username,
        email: vo.userInfo.email,
        roles: vo.userInfo.roles,
        permissions: vo.userInfo.permissions,
      },
      {
        expiresIn:
          this.configService.get('jwt_access_token_expires_time') || '30m',
      },
    );

    vo.refreshToken = this.jwtService.sign(
      {
        userId: vo.userInfo.id,
      },
      {
        expiresIn:
          this.configService.get('jwt_refresh_token_expres_time') || '7d',
      },
    );

    return vo;
  }

  @ApiQuery({
    name: 'refreshToken',
    type: String,
    description: '刷新 token',
    required: true,
    example: 'xxxxxxxxyyyyyyyyzzzzz',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'token 已失效，请重新登录',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '刷新成功',
    type: RefreshTokenVo,
  })
  @Get('refresh')
  async refresh(@Query('refreshToken') refreshToken: string) {
    try {
      const data = this.jwtService.verify(refreshToken);

      const user = await this.userService.findUserById(data.userId, false);

      const access_token = this.jwtService.sign(
        {
          userId: user.id,
          username: user.username,
          email: user.email,
          roles: user.roles,
          permissions: user.permissions,
        },
        {
          expiresIn:
            this.configService.get('jwt_access_token_expires_time') || '30m',
        },
      );

      const refresh_token = this.jwtService.sign(
        {
          userId: user.id,
        },
        {
          expiresIn:
            this.configService.get('jwt_refresh_token_expres_time') || '7d',
        },
      );

      const vo = new RefreshTokenVo();

      vo.access_token = access_token;
      vo.refresh_token = refresh_token;

      return vo;
    } catch (e) {
      throw new UnauthorizedException('token 已失效，请重新登录');
    }
  }

  @ApiQuery({
    name: 'refreshToken',
    type: String,
    description: '刷新 token',
    required: true,
    example: 'xxxxxxxxyyyyyyyyzzzzz',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'token 已失效，请重新登录',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '刷新成功',
    type: RefreshTokenVo,
  })
  @Get('admin/refresh')
  async adminRefresh(@Query('refreshToken') refreshToken: string) {
    try {
      const data = this.jwtService.verify(refreshToken);

      const user = await this.userService.findUserById(data.userId, true);

      const access_token = this.jwtService.sign(
        {
          userId: user.id,
          username: user.username,
          email: user.email,
          roles: user.roles,
          permissions: user.permissions,
        },
        {
          expiresIn:
            this.configService.get('jwt_access_token_expires_time') || '30m',
        },
      );

      const refresh_token = this.jwtService.sign(
        {
          userId: user.id,
        },
        {
          expiresIn:
            this.configService.get('jwt_refresh_token_expres_time') || '7d',
        },
      );

      return {
        access_token,
        refresh_token,
      };
    } catch (e) {
      throw new UnauthorizedException('token 已失效，请重新登录');
    }
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('callback/google')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    if (!req.user) {
      throw new BadRequestException('google 登录失败');
    }

    const foundUser = await this.userService.findUserByEmail(req.user.email);

    if (foundUser) {
      const vo = new LoginUserVo();
      vo.userInfo = {
        id: foundUser.id,
        username: foundUser.username,
        nickName: foundUser.nickName,
        email: foundUser.email,
        phoneNumber: foundUser.phoneNumber,
        headPic: foundUser.headPic,
        createTime: foundUser.createTime.getTime(),
        isFrozen: foundUser.isFrozen,
        isAdmin: foundUser.isAdmin,
        roles: foundUser.roles.map((item) => item.name),
        permissions: foundUser.roles.reduce((arr, item) => {
          item.permissions.forEach((permission) => {
            if (arr.indexOf(permission) === -1) {
              arr.push(permission);
            }
          });
          return arr;
        }, []),
      };
      vo.accessToken = this.jwtService.sign(
        {
          userId: vo.userInfo.id,
          username: vo.userInfo.username,
          email: vo.userInfo.email,
          roles: vo.userInfo.roles,
          permissions: vo.userInfo.permissions,
        },
        {
          expiresIn:
            this.configService.get('jwt_access_token_expires_time') || '30m',
        },
      );

      vo.refreshToken = this.jwtService.sign(
        {
          userId: vo.userInfo.id,
        },
        {
          expiresIn:
            this.configService.get('jwt_refresh_token_expres_time') || '7d',
        },
      );
      res.cookie('userInfo', JSON.stringify(vo.userInfo));
      res.cookie('accessToken', vo.accessToken);
      res.cookie('refreshToken', vo.refreshToken);
    } else {
      const user = await this.userService.registerByGoogleInfo(
        req.user.email,
        req.user.firstName + ' ' + req.user.lastName,
        req.user.picture,
      );

      const vo = new LoginUserVo();
      vo.userInfo = {
        id: user.id,
        username: user.username,
        nickName: user.nickName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        headPic: user.headPic,
        createTime: user.createTime.getTime(),
        isFrozen: user.isFrozen,
        isAdmin: user.isAdmin,
        roles: [],
        permissions: [],
      };

      vo.accessToken = this.jwtService.sign(
        {
          userId: vo.userInfo.id,
          username: vo.userInfo.username,
          email: vo.userInfo.email,
          roles: vo.userInfo.roles,
          permissions: vo.userInfo.permissions,
        },
        {
          expiresIn:
            this.configService.get('jwt_access_token_expires_time') || '30m',
        },
      );

      vo.refreshToken = this.jwtService.sign(
        {
          userId: vo.userInfo.id,
        },
        {
          expiresIn:
            this.configService.get('jwt_refresh_token_expres_time') || '7d',
        },
      );

      res.cookie('userInfo', JSON.stringify(vo.userInfo));
      res.cookie('accessToken', vo.accessToken);
      res.cookie('refreshToken', vo.refreshToken);
    }
    res.redirect('http://localhost:3001/');
  }

  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'success',
    type: UserDetailVo,
  })
  @Get('info')
  @RequireLogin()
  async info(@UserInfo('userId') userId: number) {
    const user = await this.userService.findUserDetailById(userId);
    const vo = new UserDetailVo();
    vo.id = user.id;
    vo.email = user.email;
    vo.username = user.username;
    vo.headPic = user.headPic;
    vo.phoneNumber = user.phoneNumber;
    vo.nickName = user.nickName;
    vo.createTime = user.createTime;
    vo.isFrozen = user.isFrozen;

    return vo;
  }

  @ApiQuery({
    name: 'address',
    description: '邮箱地址',
    type: String,
  })
  @ApiResponse({
    type: String,
    description: '发送成功',
  })
  @Get('update_password/captcha')
  async updatePasswordCaptcha(@Query('address') address: string) {
    const code = Math.random().toString().slice(2, 8);

    await this.redisService.set(
      `update_password_captcha_${address}`,
      code,
      10 * 60,
    );

    await this.emailService.sendMail({
      to: address,
      subject: '更改密码验证码',
      html: `<p>你的更改密码验证码是 ${code}</p>`,
    });
    return '发送成功';
  }

  @ApiBearerAuth()
  @ApiResponse({
    type: String,
    description: '发送成功',
  })
  @RequireLogin()
  @Get('update/captcha')
  async updateCaptcha(@UserInfo('email') address: string) {
    console.log(address);
    const code = Math.random().toString().slice(2, 8);

    await this.redisService.set(
      `update_user_captcha_${address}`,
      code,
      10 * 60,
    );

    await this.emailService.sendMail({
      to: address,
      subject: '更改用户信息验证码',
      html: `<p>你的验证码是 ${code}</p>`,
    });
    return '发送成功';
  }

  @ApiBody({
    type: UpdateUserPasswordDto,
  })
  @ApiResponse({
    type: String,
    description: '验证码已失效/不正确',
  })
  @Post(['update_password', 'admin/update_password'])
  async updatePassword(@Body() passwordDto: UpdateUserPasswordDto) {
    const res = await this.userService.updatePassword(passwordDto);
    this.redisService.del(`update_user_captcha_${passwordDto.email}`);
    return res;
  }

  @ApiBearerAuth()
  @ApiBody({
    type: UpdateUserDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '验证码已失效/不正确',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '更新成功',
    type: String,
  })
  @Post(['update', 'admin/update'])
  @RequireLogin()
  async update(
    @UserInfo('userId') userId: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const res = await this.userService.update(userId, updateUserDto);
    this.redisService.del(`update_user_captcha_${updateUserDto.email}`);
    return res;
  }

  @ApiBearerAuth()
  @ApiQuery({
    name: 'id',
    description: 'userId',
    type: Number,
  })
  @ApiResponse({
    type: String,
    description: 'success',
  })
  @RequireLogin()
  @Get('freeze')
  async freeze(@Query('id') userId: number) {
    await this.userService.freezeUserById(userId);
    return 'success';
  }

  @ApiBearerAuth()
  @ApiQuery({
    name: 'pageNo',
    description: '第几页',
    type: Number,
  })
  @ApiQuery({
    name: 'pageSize',
    description: '每页多少条',
    type: Number,
  })
  @ApiQuery({
    name: 'username',
    description: '用户名',
    type: Number,
  })
  @ApiQuery({
    name: 'nickName',
    description: '昵称',
    type: Number,
  })
  @ApiQuery({
    name: 'email',
    description: '邮箱地址',
    type: Number,
  })
  @ApiResponse({
    type: String,
    description: '用户列表',
  })
  @RequireLogin()
  @Get('list')
  async list(
    @Query('pageNo', new DefaultValuePipe(1), generateParseIntPipe('pageNo'))
    pageNo: number,
    @Query(
      'pageSize',
      new DefaultValuePipe(2),
      generateParseIntPipe('pageSize'),
    )
    pageSize: number,
    @Query('username') username: string,
    @Query('nickName') nickName: string,
    @Query('email') email: string,
  ) {
    return await this.userService.findUsers(
      username,
      nickName,
      email,
      pageNo,
      pageSize,
    );
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      dest: 'uploads',
      storage: storage,
      limits: {
        fileSize: 1024 * 1024 * 3,
      },
      fileFilter(req, file, callback) {
        const extname = path.extname(file.originalname);
        if (['.png', '.jpg', '.gif'].includes(extname)) {
          callback(null, true);
        } else {
          callback(new BadRequestException('只能上传图片'), false);
        }
      },
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    console.log('file', file);
    return file.path;
  }
}
