import { IMapper } from './IMapper';
import { Book } from '../model/Book.model';
import { BookBuilder } from '../model/builders/Book.builder';
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
}
export class JSONBookMapper implements IMapper<any, Book> {
  map(data: any): Book {
    return buildBook(data);
  }
}
export class XMLBookMapper implements IMapper<any, Book> {
  map(data: any): Book {
    return buildBook({
      ...data,
    });
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
