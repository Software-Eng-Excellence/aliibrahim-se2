// this test file is for checking if the mapper correctly maps book model own fields

import {
  CSVBookMapper,
  JSONBookMapper,
  XMLBookMapper,
} from '../../src/mappers/Book.mapper';

describe('BookMapper', () => {
  it('maps CSV book data correctly', () => {
    const data = [
      'The Hobbit',
      'J.R.R. Tolkien',
      'Fantasy',
      'Hardcover',
      'English',
      'Allen & Unwin',
      "Collector's Edition",
      'Box',
      '19.99',
      '5',
    ];

    const book = new CSVBookMapper().map(data);

    expect(book.getTitle()).toBe('The Hobbit');
    expect(book.getAuthor()).toBe('J.R.R. Tolkien');
    expect(book.getPrice()).toBe(19.99);
    expect(book.getQuantity()).toBe(5);
  });

  it('maps JSON book data correctly', () => {
    const data = {
      title: 'The Hobbit',
      author: 'J.R.R. Tolkien',
      genre: 'Fantasy',
      format: 'Hardcover',
      language: 'English',
      publisher: 'Allen & Unwin',
      specialEdition: "Collector's Edition",
      packaging: 'Box',
      price: 19.99,
      quantity: 5,
    };

    const book = new JSONBookMapper().map(data);

    expect(book.getTitle()).toBe('The Hobbit');
    expect(book.getAuthor()).toBe('J.R.R. Tolkien');
    expect(book.getPrice()).toBe(19.99);
    expect(book.getQuantity()).toBe(5);
  });

  it('maps XML book data correctly', () => {
    const data = {
      title: 'The Hobbit',
      author: 'J.R.R. Tolkien',
      genre: 'Fantasy',
      format: 'Hardcover',
      language: 'English',
      publisher: 'Allen & Unwin',
      specialEdition: "Collector's Edition",
      packaging: 'Box',
      price: '19.99',
      quantity: '5',
    };
    const book = new XMLBookMapper().map(data);

    expect(book.getTitle()).toBe('The Hobbit');
    expect(book.getAuthor()).toBe('J.R.R. Tolkien');
    expect(book.getPrice()).toBe(19.99);
    expect(book.getQuantity()).toBe(5);
  });
});
