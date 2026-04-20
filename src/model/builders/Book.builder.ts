import { Book } from '../Book.model';
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
  private price!: number;
  private quantity!: number;
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
  setPrice(price: number): BookBuilder {
    this.price = price;
    return this;
  }
  setQuantity(quantity: number): BookBuilder {
    this.quantity = quantity;
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
      price: this.price,
      quantity: this.quantity,
    };
    BookValidator.validate(fields);
    return new Book(fields);
  }
}
