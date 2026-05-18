import { ValidationUtils } from './ValidationUtils';
export class BookValidator {
  static validate(book: any): void {
    ValidationUtils.requireNonEmptyString(book.title, 'title');
    ValidationUtils.requireNonEmptyString(book.author, 'author');
    ValidationUtils.requireNonEmptyString(book.genre, 'genre');
    ValidationUtils.requireNonEmptyString(book.format, 'format');
    ValidationUtils.requireNonEmptyString(book.language, 'language');
    ValidationUtils.requireNonEmptyString(book.publisher, 'publisher');
    ValidationUtils.requireNonEmptyString(
      book.specialEdition,
      'specialEdition',
    );
    ValidationUtils.requireNonEmptyString(book.packaging, 'packaging');
  }
}
