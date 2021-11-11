import { SettingsDto } from './settings.dto';
import { WalletDto } from './wallet.dto';

export class UserDto {
  constructor(object: any) {
    this.name = object.name;
    this.surname = object.surname;
    this.nickname = object.nickname;
    this.email = object.email;
    this.phone = object.phone;
    this.birthdaydate = object.birthdaydate;
    this.settings = new SettingsDto(object.settings);
    this.wallet = object.wallet;
  };
  readonly name: string;
  readonly surname: string;
  readonly nickname: string;
  readonly email: string;
  readonly phone: string;
  readonly birthdaydate: Date;
  settings: SettingsDto;
  wallet: WalletDto;
}
