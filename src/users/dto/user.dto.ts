export class UserDto {
  constructor(object: any) {
    this.auth = object.auth;
    this.email = object.email;
    this.status = object.status;
    this.password = object.password;
    this.level = object.level;
    this.roles = object.roles;
  }
  readonly roles: string;
  readonly level: number;
  readonly auth: boolean;
  readonly password: string;
  readonly status: string;
  readonly email: string;
}
