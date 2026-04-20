export class ValidationUtils {
  // use it for all required fields
  static requireDefined(value: unknown, fieldName: string): void {
    if (value === undefined || value === null) {
      throw new Error(`Missing required field: ${fieldName}`);
    }
  }
  // use it for string fields
  static requireNonEmptyString(value: unknown, fieldName: string): void {
    this.requireDefined(value, fieldName);
    if (typeof value !== 'string' || value.trim() === '') {
      throw new Error(`Field must be a non-empty string: ${fieldName}`);
    }
  }
  // use it for number fields
  static requirePositiveNumber(value: unknown, fieldName: string): void {
    this.requireDefined(value, fieldName);
    if (typeof value !== 'number' || isNaN(value) || value <= 0) {
      throw new Error(`Field must be a positive number: ${fieldName}`);
    }
  }
  // use it for price validation there may be free items
  static requireNonNegativeNumber(value: unknown, fieldName: string): void {
    this.requireDefined(value, fieldName);
    if (typeof value !== 'number' || isNaN(value) || value < 0) {
      throw new Error(`Field must be a non-negative number: ${fieldName}`);
    }
  }
  // use it for boolean fields
  static requireBoolean(value: unknown, fieldName: string): void {
    this.requireDefined(value, fieldName);
    if (typeof value !== 'boolean') {
      throw new Error(`Field must be a boolean: ${fieldName}`);
    }
  }
}
