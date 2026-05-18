import { Item, ItemCategory } from './Item.model';

export class Book implements Item {
  private title: string;
  private author: string;
  private genre: string;
  private format: string;
  private language: string;
  private publisher: string;
  private specialEdition: string;
  private packaging: string;

  constructor(data: {
    title: string;
    author: string;
    genre: string;
    format: string;
    language: string;
    publisher: string;
    specialEdition: string;
    packaging: string;
  }) {
    this.title = data.title;
    this.author = data.author;
    this.genre = data.genre;
    this.format = data.format;
    this.language = data.language;
    this.publisher = data.publisher;
    this.specialEdition = data.specialEdition;
    this.packaging = data.packaging;
  }
  getCategory(): ItemCategory {
    return ItemCategory.BOOK;
  }
  getTitle(): string {
    return this.title;
  }

  getAuthor(): string {
    return this.author;
  }

  getGenre(): string {
    return this.genre;
  }

  getFormat(): string {
    return this.format;
  }

  getLanguage(): string {
    return this.language;
  }

  getPublisher(): string {
    return this.publisher;
  }

  getSpecialEdition(): string {
    return this.specialEdition;
  }

  getPackaging(): string {
    return this.packaging;
  }
}
