import { createParamDecorator } from '@nestjs/common';

export const Wallet = createParamDecorator((data, req) => {
  return req.user.wallet;
});
