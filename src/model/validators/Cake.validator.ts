import { ValidationUtils } from './ValidationUtils';
export class CakeValidator {
  static validate(cake: any): void {
    ValidationUtils.requireNonEmptyString(cake.type, 'type');
    ValidationUtils.requireNonEmptyString(cake.flavor, 'flavor');
    ValidationUtils.requireNonEmptyString(cake.filling, 'filling');
    ValidationUtils.requirePositiveNumber(cake.size, 'size');
    ValidationUtils.requirePositiveNumber(cake.layers, 'layers');
    ValidationUtils.requireNonEmptyString(cake.frostingType, 'frostingType');
    ValidationUtils.requireNonEmptyString(
      cake.frostingFlavor,
      'frostingFlavor',
    );
    ValidationUtils.requireNonEmptyString(
      cake.decorationType,
      'decorationType',
    );
    ValidationUtils.requireNonEmptyString(
      cake.decorationColor,
      'decorationColor',
    );
    ValidationUtils.requireNonEmptyString(cake.customMessage, 'customMessage');
    ValidationUtils.requireNonEmptyString(cake.shape, 'shape');
    ValidationUtils.requireNonEmptyString(cake.allergies, 'allergies');
    ValidationUtils.requireNonEmptyString(
      cake.specialIngredients,
      'specialIngredients',
    );
    ValidationUtils.requireNonEmptyString(cake.packagingType, 'packagingType');
    ValidationUtils.requireNonNegativeNumber(cake.price, 'price');
    ValidationUtils.requirePositiveNumber(cake.quantity, 'quantity');
  }
}
