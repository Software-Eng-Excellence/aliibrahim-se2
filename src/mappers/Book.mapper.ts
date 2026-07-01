import { IMapper } from './IMapper';
import { Book, IdentifiableBook } from '../model/Book.model';
import {
  BookBuilder,
  IdentifiableBookBuilder,
} from '../model/builders/Book.builder';
export class CSVBookMapper implements IMapper<string[], Book> {
  map(data: string[]): Book {
    return buildBook({
      title: data[0],
      author: data[1],
      genre: data[2],
      format: data[3],
      language: data[4],
      publisher: data[5],
      specialEdition: data[6],
      packaging: data[7],
    });
  }
  reverse(data: Book): string[] {
    return reverseBook(data);
  }
}
export class JSONBookMapper implements IMapper<any, Book> {
  map(data: any): Book {
    return buildBook(data);
  }
  reverse(data: Book): any {
    return reverseBook(data);
  }
}
export class XMLBookMapper implements IMapper<any, Book> {
  map(data: any): Book {
    return buildBook({
      ...data,
    });
  }
  reverse(data: Book): any {
    return reverseBook(data);
  }
}
function buildBook(data: any): Book {
  return BookBuilder.newBuilder()
    .setTitle(data.title)
    .setAuthor(data.author)
    .setGenre(data.genre)
    .setFormat(data.format)
    .setLanguage(data.language)
    .setPublisher(data.publisher)
    .setSpecialEdition(data.specialEdition)
    .setPackaging(data.packaging)
    .build();
}
function reverseBook(data: Book): any {
  return {
    title: data.getTitle(),
    author: data.getAuthor(),
    genre: data.getGenre(),
    format: data.getFormat(),
    language: data.getLanguage(),
    publisher: data.getPublisher(),
    specialEdition: data.getSpecialEdition(),
    packaging: data.getPackaging(),
  };
}
export interface PostgresBook {
  id: string;
  title: string;
  author: string;
  genre: string;
  format: string;
  language: string;
  publisher: string;
  specialedition: string;
  packaging: string;
}
export class PostgresBookMapper implements IMapper<
  PostgresBook,
  IdentifiableBook
> {
  map(data: PostgresBook): IdentifiableBook {
    return IdentifiableBookBuilder.newBuilder()
      .setBook(
        BookBuilder.newBuilder()
          .setTitle(data.title)
          .setAuthor(data.author)
          .setGenre(data.genre)
          .setFormat(data.format)
          .setLanguage(data.language)
          .setPublisher(data.publisher)
          .setSpecialEdition(data.specialedition)
          .setPackaging(data.packaging)
          .build(),
      )
      .setId(data.id)
      .build();
  }
  reverse(data: IdentifiableBook): PostgresBook {
    return {
      id: data.getId(),
      title: data.getTitle(),
      author: data.getAuthor(),
      genre: data.getGenre(),
      format: data.getFormat(),
      language: data.getLanguage(),
      publisher: data.getPublisher(),
      specialedition: data.getSpecialEdition(),
      packaging: data.getPackaging(),
    };
  }
}
