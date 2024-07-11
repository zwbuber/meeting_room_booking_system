import { Global, Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';

@Global()
@Module({
  controllers: [EmailController],
  providers: [EmailService],
  exports: [EmailService], // 导出EmailService，其他模块可以直接使用
})
export class EmailModule {}
