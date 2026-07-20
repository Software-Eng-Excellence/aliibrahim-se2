import { ValidationUtils } from './ValidationUtils';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class UserValidator {
  static validate(user: any): void {
    ValidationUtils.requireNonEmptyString(user.name, 'name');
    ValidationUtils.requireNonEmptyString(user.email, 'email');
    ValidationUtils.requireNonEmptyString(user.password, 'password');
    if (!EMAIL_PATTERN.test(user.email)) {
      throw new Error('Field must be a valid email: email');
    }
  }
}
