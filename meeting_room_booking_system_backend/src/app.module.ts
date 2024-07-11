import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { User } from './user/entities/user.entity';
import { Role } from './user/entities/role.entity';
import { Permission } from './user/entities/permission.entity';
import { MeetingRoom } from './meeting-room/entities/meeting-room.entity';
import { RedisModule } from './redis/redis.module';
import { EmailModule } from './email/email.module';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { LoginGuard } from './login.guard';
import { PermissionGuard } from './permission.guard';
import { MeetingRoomModule } from './meeting-room/meeting-room.module';
import { BookingModule } from './booking/booking.module';
import { Booking } from './booking/entities/booking.entity';
import { StatisticService } from './statistic/statistic.service';
import { StatisticController } from './statistic/statistic.controller';
import { AuthModule } from './auth/auth.module';
import { MinioModule } from './minio/minio.module';
import * as path from 'path';
import {
  utilities,
  WINSTON_MODULE_NEST_PROVIDER,
  WinstonLogger,
  WinstonModule,
} from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { CustomTypeOrmLogger } from './CustomTypeOrmLogger';

@Module({
  imports: [
    // ConfigModule.forRoot 加载环境变量
    ConfigModule.forRoot({
      isGlobal: true, // 将环境变量在全部文件模块中导入
      envFilePath: [
        path.join(__dirname, '.env'),
        path.join(__dirname, '.env.dev'),
      ], // 设置读取的环境变量文件
    }),
    // 使用TypeORM配置数据库连接信息
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService, WINSTON_MODULE_NEST_PROVIDER],
      useFactory: (configService: ConfigService, logger: WinstonLogger) => ({
        type: 'mysql',
        host: configService.get('mysql_server_host'), // 数据库IP地址
        port: configService.get('mysql_server_port'), // 端口号
        username: configService.get('mysql_server_username'), // 用户名
        password: configService.get('mysql_server_password'), // 密码
        database: configService.get('mysql_server_database'), // 数据库名
        synchronize: configService.get('mysql_server_sync'), // 是否将实体同步到数据库（仅用于开发环境，线上环境一定要关掉）
        logging: false, // 是否开启日志
        logger: new CustomTypeOrmLogger(logger),
        entities: [User, Role, Permission, MeetingRoom, Booking], // 实体文件
        poolSize: 10, // 连接池大小
        connectorPackage: 'mysql2',
        extra: {
          authPlugin: 'sha256_password',
        },
        timezone: '+08:00', // 时区
      }),
    }),
    // jwt 生成token
    JwtModule.registerAsync({
      global: true,
      useFactory(configService: ConfigService) {
        return {
          secret: configService.get('jwt_secret'),
          signOptions: {
            expiresIn: '30m', // 默认 30 分钟
          },
        };
      },
      inject: [ConfigService],
    }),
    WinstonModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        level: 'debug',
        transports: [
          new winston.transports.DailyRotateFile({
            level: configService.get('winston_log_level'),
            dirname: configService.get('winston_log_dirname'),
            filename: configService.get('winston_log_filename'),
            datePattern: configService.get('winston_log_date_pattern'),
            maxSize: configService.get('winston_log_max_size'),
          }),
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.timestamp(),
              utilities.format.nestLike(),
            ),
          }),
        ],
      }),
      inject: [ConfigService],
    }),
    UserModule,
    RedisModule,
    EmailModule,
    MeetingRoomModule,
    BookingModule,
    AuthModule,
    MinioModule,
  ],
  controllers: [AppController, StatisticController],
  providers: [
    AppService,
    {
      // 注册为全局守卫-登录控制装饰器
      provide: APP_GUARD,
      useClass: LoginGuard,
    },
    {
      // 注册为全局守卫-登录权限控制装饰器
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
    StatisticService,
  ],
})
export class AppModule {}
