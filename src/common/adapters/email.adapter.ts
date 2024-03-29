import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';
import { IEmailInfoModel } from '../types';

@Injectable()
export class EmailAdapter {
  async sendEmail(messageInfo: IEmailInfoModel): Promise<void> {
    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.TEST_DEV_EMAIL,
        pass: process.env.TEST_DEV_EMAIL_PASS,
      },
    });

    try {
      await transport.sendMail(messageInfo);
    } catch (e) {
      console.log(e);
      throw new Error(`Email server error! : ${e}`);
    }
  }
}
