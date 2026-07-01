import logger from '../../util/logger';
import { Book, IdentifiableBook } from '../Book.model';
import { BookValidator } from '../validators/Book.validator';
export class BookBuilder {
  private title!: string;
  private author!: string;
  private genre!: string;
  private format!: string;
  private language!: string;
  private publisher!: string;
  private specialEdition!: string;
  private packaging!: string;

  public static newBuilder(): BookBuilder {
    return new BookBuilder();
  }
  setTitle(title: string): BookBuilder {
    this.title = title;
    return this;
  }
  setAuthor(author: string): BookBuilder {
    this.author = author;
    return this;
  }
  setGenre(genre: string): BookBuilder {
    this.genre = genre;
    return this;
  }
  setFormat(format: string): BookBuilder {
    this.format = format;
    return this;
  }
  setLanguage(language: string): BookBuilder {
    this.language = language;
    return this;
  }
  setPublisher(publisher: string): BookBuilder {
    this.publisher = publisher;
    return this;
  }
  setSpecialEdition(specialEdition: string): BookBuilder {
    this.specialEdition = specialEdition;
    return this;
  }
  setPackaging(packaging: string): BookBuilder {
    this.packaging = packaging;
    return this;
  }

  build(): Book {
    const fields = {
      title: this.title,
      author: this.author,
      genre: this.genre,
      format: this.format,
      language: this.language,
      publisher: this.publisher,
      specialEdition: this.specialEdition,
      packaging: this.packaging,
    };
    BookValidator.validate(fields);
    return new Book(fields);
  }
}
export class IdentifiableBookBuilder extends BookBuilder {
  private id?: string;
  private book!: Book;
  static newBuilder(): IdentifiableBookBuilder {
    return new IdentifiableBookBuilder();
  }
  public setId(id: string): IdentifiableBookBuilder {
    this.id = id;
    return this;
  }
  setBook(book: Book): IdentifiableBookBuilder {
    this.book = book;
    return this;
  }
  build(): IdentifiableBook {
    if (!this.book) {
      logger.error('Book must be set before building IdentifiableBook');
      throw new Error('Book must be set before building IdentifiableBook');
    }
    const finalId = this.id || this.generateRandomAlphanumericId();
    return new IdentifiableBook(finalId, {
      title: this.book.getTitle(),
      author: this.book.getAuthor(),
      genre: this.book.getGenre(),
      format: this.book.getFormat(),
      language: this.book.getLanguage(),
      publisher: this.book.getPublisher(),
      specialEdition: this.book.getSpecialEdition(),
      packaging: this.book.getPackaging(),
    });
  }
  private generateRandomAlphanumericId(): string {
    // Returns something like: "7X2A9B84" or "K8N3M2QX"
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  }
}
