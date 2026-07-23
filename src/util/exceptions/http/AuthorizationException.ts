import { HttpException } from './HttpException';

export class AuthorizationException extends HttpException {
  constructor(message: string) {
    super(403, message);
    this.name = 'AuthorizationException';
  }
}
export class InvalidRoleException extends AuthorizationException {
  constructor(role: string) {
    super(`User does not have the required role: ${role}`);
    this.name = 'InvalidRoleException';
  }
}
export class InsufficientPermissionsException extends AuthorizationException {
  constructor() {
    super('User does not have the required permissions');
    this.name = 'InsufficientPermissionsException';
  }
}
