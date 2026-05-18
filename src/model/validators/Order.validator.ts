import { ValidationUtils } from './ValidationUtils';
export class OrderValidator {
  static validate(order: any): void {
    ValidationUtils.requireNonEmptyString(order.id, 'id');
    ValidationUtils.requirePositiveNumber(order.price, 'price');
    ValidationUtils.requirePositiveNumber(order.quantity, 'quantity');
    if (!order.item) {
      throw new Error('Item is required');
    }
  }
}
