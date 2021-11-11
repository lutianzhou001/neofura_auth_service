import { Document } from 'mongoose';

export interface User extends Document {
  accountstatus: string;
  date: Date;
  name: string;
  surname: string;
  nickname: string;
  email: string;
  phone: string;
  birthdaydate: Date;
  password: string;
  roles: string[];
  auth: {
    email: {
      valid: boolean,
    },
    phone: {
      valid: boolean,
    }
    totp: {
      valid: boolean,
    }
    facebook: {
      userid: string,
    },
    gmail: {
      userid: string,
    },
  };
  settings: {
    trading: {
      password: string,
    },
  };
  wallet: {
    user: number,
    assets: {
      btc: string,
      eth: string,
      bch: string,
      eos: string,
      // 以下都是ERC20地址，同ETH地址
      // { usdt: string },
      // { krwt: string },
      // { ht: string },
      // { sdc: string },
      // { cnt: string },
      // { fsc: string },
    },
  };
  kyc: {
    realname: string,
    IDNumber: string,
    IDType: string,
    nation: string,
    status: string,
    frontIDCard: string,
    handHeldIDCard: string,
    reason: string,
  };
}
