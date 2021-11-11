'use strict';

export class ProfileListResDto {
    email: string;
    createTime: Date;
    phone: string;
    nickname: string;
    kyc: {
        status: string;
    };
}