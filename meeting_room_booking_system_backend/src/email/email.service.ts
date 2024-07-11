import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  transporter: Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = createTransport({
      host: this.configService.get('nodemailer_host'), //  smtp 服务的域名
      port: this.configService.get('nodemailer_port'), // 端口
      secure: true, // 启用 SSL
      auth: {
        user: this.configService.get('nodemailer_auth_user'), // 邮箱地址
        pass: this.configService.get('nodemailer_auth_pass'), // 授权码
      },
    });
  }

  async sendMail({ to, subject, html }) {
    await this.transporter.sendMail({
      from: {
        name: '会议室预定系统',
        address: this.configService.get('nodemailer_auth_user'),
      },
      to,
      subject,
      html,
    });
  }
}
