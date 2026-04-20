import { BookBuilder } from '../src/model/builders/Book.builder';

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
      .setPrice(0)
      .setQuantity(1)
      .build();

    expect(book).toBeDefined();
    expect(book.getTitle()).toBe('The Great Novel');
    expect(book.getAuthor()).toBe('Jane Doe');
    expect(book.getPrice()).toBe(0);
    expect(book.getCategory()).toBe(1); // ItemCategory.BOOK
    expect(book.getGenre()).toBe('Fiction');
    expect(book.getFormat()).toBe('Hardcover');
    expect(book.getLanguage()).toBe('English');
    expect(book.getPublisher()).toBe('Acme Publishing');
    expect(book.getSpecialEdition()).toBe('Collector');
    expect(book.getPackaging()).toBe('Boxed');
    expect(book.getQuantity()).toBe(1);
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
        .setPrice(49.99)
        .setQuantity(1)
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
        .setPrice(49.99)
        .setQuantity(1)
        .build(),
    ).toThrow('Field must be a non-empty string: title');
  });

  it('should fail when quantity is NaN (demonstrates bug )', () => {
    const builder = new BookBuilder();

    expect(() =>
      builder
        .setTitle('The Great Novel')
        .setAuthor('Jane Doe')
        .setGenre('Fiction')
        .setFormat('Hardcover')
        .setLanguage('English')
        .setPublisher('Acme Publishing')
        .setSpecialEdition('Collector')
        .setPackaging('Boxed')
        .setPrice(49.99)
        .setQuantity(Number('abc')) // NaN
        .build(),
    ).toThrow();
  });

  it('should fail when price is negative', () => {
    const builder = new BookBuilder();

    expect(() =>
      builder
        .setTitle('The Great Novel')
        .setAuthor('Jane Doe')
        .setGenre('Fiction')
        .setFormat('Hardcover')
        .setLanguage('English')
        .setPublisher('Acme Publishing')
        .setSpecialEdition('Collector')
        .setPackaging('Boxed')
        .setPrice(-10)
        .setQuantity(1)
        .build(),
    ).toThrow('Field must be a non-negative number: price');
  });
});
