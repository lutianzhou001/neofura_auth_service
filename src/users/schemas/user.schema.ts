import * as mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema({
  id: String,
  date: { type: Date, default: Date.now },
  name: String,
  surname: String,
  nickname: String,
  email: String,
  phone: String,
  password: String,
  birthdaydate: Date,
  roles: Array<String>(),
  accountstatus: String,
  auth: {
    email: {
      valid: { type: Boolean, default: false },
    },
    totp: {
      valid: { type: Boolean, default: false },
    },
    phone: {
      valid: { type: Boolean, default: false }
    },
    facebook: {
      userid: String,
    },
    gmail: {
      userid: String,
    },
  },
  settings: {
    trading: {
      password: String,
    },
  },
  wallet: {
    user: { type: Number },
    assets: {
      btc: { type: String },
      eth: { type: String },
      bch: { type: String },
      eos: { type: String },
      krwt: { type: String },
      cnt: { type: String },
      sdc: { type: String },
      fsc: { type: String },
      ht: { type: String },
    },
  },
  kyc: {
    realname: String,
    IDNumber: String,
    IDType: String,
    nation: String,
    status: String,
    frontIDCard: String,
    handHeldIDCard: String,
    reason: String,
  },
});
