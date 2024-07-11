import { ApiProperty } from '@nestjs/swagger';
import { RegisterUserDto } from './register-user.dto';
import { PickType } from '@nestjs/mapped-types';

export class UpdateUserDto extends PickType(RegisterUserDto, [
  'email',
  'captcha',
]) {
  @ApiProperty()
  headPic: string;

  @ApiProperty()
  nickName: string;
}
