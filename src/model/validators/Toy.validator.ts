import { ValidationUtils } from './ValidationUtils';
export class ToyValidator {
  static validate(toy: any): void {
    ValidationUtils.requireNonEmptyString(toy.material, 'material');
    ValidationUtils.requireNonEmptyString(toy.toyType, 'toyType');
    ValidationUtils.requireNonEmptyString(toy.ageGroup, 'ageGroup');
    ValidationUtils.requireNonEmptyString(toy.brand, 'brand');
    ValidationUtils.requireBoolean(toy.batteryRequired, 'batteryRequired');
    ValidationUtils.requireBoolean(toy.educational, 'educational');
  }
}
