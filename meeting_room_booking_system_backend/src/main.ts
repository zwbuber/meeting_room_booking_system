import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { FormatResponseInterceptor } from './format-response.interceptor';
import { InvokeRecordInterceptor } from './invoke-record.interceptor';
import { CustomExceptionFilter } from './custom-exception.filter';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 静态资源托管
  app.useStaticAssets('uploads', {
    prefix: '/uploads',
  });

  // 全局使用验证管道
  app.useGlobalPipes(new ValidationPipe());
  // 全局拦截器-成功响应体格式化
  app.useGlobalInterceptors(new FormatResponseInterceptor());
  // 全局拦截器-记录请求日志
  app.useGlobalInterceptors(new InvokeRecordInterceptor());
  // 全局过滤器-自定义异常过滤器
  app.useGlobalFilters(new CustomExceptionFilter());
  // 允许跨域
  app.enableCors();
  // 解析cookie
  app.use(cookieParser());

  const config = new DocumentBuilder()
    .setTitle('会议室预订系统')
    .setDescription('api 接口文档')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      description: '基于 jwt 的认证',
    })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-doc', app, document);

  const configService = app.get(ConfigService);

  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  await app.listen(configService.get('nest_server_port'));

  console.log(
    `服务启动成功`,
    '服务地址:',
    `http://localhost:${configService.get('nest_server_port')}`,
  );
}
bootstrap();
