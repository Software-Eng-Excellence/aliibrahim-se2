import { ValidationUtils } from './ValidationUtils';
export class ToyValidator {
  static validate(toy: any): void {
    ValidationUtils.requireNonEmptyString(toy.material, 'material');
    ValidationUtils.requireNonEmptyString(toy.toyType, 'toyType');
    ValidationUtils.requireNonEmptyString(toy.ageGroup, 'ageGroup');
    ValidationUtils.requireNonEmptyString(toy.brand, 'brand');
    ValidationUtils.requireBoolean(toy.batteryRequired, 'batteryRequired');
    ValidationUtils.requireBoolean(toy.educational, 'educational');
<<<<<<< HEAD
=======
    ValidationUtils.requireNonNegativeNumber(toy.price, 'price');
    ValidationUtils.requirePositiveNumber(toy.quantity, 'quantity');
>>>>>>> ca5850c (Added the toy builder along with its validation and unit tests.)
  }
}
