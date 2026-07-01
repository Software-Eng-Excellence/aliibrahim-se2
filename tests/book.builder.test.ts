import { BookBuilder } from '../src/model/builders/Book.builder';
import { ItemCategory } from '../src/model/IItem';

describe('Book Builder', () => {
  it('should build a book with all properties set with free price', () => {
    const book = new BookBuilder()
      .setTitle('The Great Novel')
      .setAuthor('Jane Doe')
      .setGenre('Fiction')
      .setFormat('Hardcover')
      .setLanguage('English')
      .setPublisher('Acme Publishing')
      .setSpecialEdition('Collector')
      .setPackaging('Boxed')

      .build();

    expect(book).toBeDefined();
    expect(book.getTitle()).toBe('The Great Novel');
    expect(book.getAuthor()).toBe('Jane Doe');
    expect(book.getCategory()).toBe(ItemCategory.BOOK);
    expect(book.getGenre()).toBe('Fiction');
    expect(book.getFormat()).toBe('Hardcover');
    expect(book.getLanguage()).toBe('English');
    expect(book.getPublisher()).toBe('Acme Publishing');
    expect(book.getSpecialEdition()).toBe('Collector');
    expect(book.getPackaging()).toBe('Boxed');
  });

  it('should throw if title is missing', () => {
    const builder = new BookBuilder();

    expect(() =>
      builder
        .setAuthor('Jane Doe')
        .setGenre('Fiction')
        .setFormat('Hardcover')
        .setLanguage('English')
        .setPublisher('Acme Publishing')
        .setSpecialEdition('Collector')
        .setPackaging('Boxed')
        .build(),
    ).toThrow('Missing required field: title');
  });

  it('should throw an error if empty string is provided', () => {
    const builder = new BookBuilder();

    expect(() =>
      builder
        .setTitle('')
        .setAuthor('Jane Doe')
        .setGenre('Fiction')
        .setFormat('Hardcover')
        .setLanguage('English')
        .setPublisher('Acme Publishing')
        .setSpecialEdition('Collector')
        .setPackaging('Boxed')
        .build(),
    ).toThrow('Field must be a non-empty string: title');
  });
});
