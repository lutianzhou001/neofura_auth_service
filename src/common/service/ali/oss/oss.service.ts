import { default as config } from '../../../../config';
import { Injectable } from '@nestjs/common';
import * as OSS from 'ali-oss';

@Injectable()
export class OssService {
  private accessKeyId: string;
  private accessKeySecret: string;
  private arn: string;
  private expires: number;
  private session: string;
  private bucket: string;
  private sts: any;

  constructor() {
    this.accessKeyId = config.oss.accessKeyId;
    this.accessKeySecret = config.oss.accessKeySecret;
    this.arn = config.oss.arn;
    this.expires = config.oss.expires;
    this.session = config.oss.session;
    this.bucket = config.oss.bucket;
  }

  async applyKYCToken(): Promise<any> {
   return true;
  }

  async applypicsToken(): Promise<any> {
    return true;
  }
}
