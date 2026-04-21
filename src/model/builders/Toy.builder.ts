import { Toy } from '../Toy.model';
import { ToyValidator } from '../validators/Toy.validator';

export class ToyBuilder {
  private toyType!: string;
  private ageGroup!: string;
  private brand!: string;
  private material!: string;
  private batteryRequired!: boolean;
  private educational!: boolean;
<<<<<<< HEAD

=======
  private price!: number;
  private quantity!: number;
<<<<<<< HEAD
>>>>>>> ca5850c (Added the toy builder along with its validation and unit tests.)
=======

  public static newBuilder(): ToyBuilder {
    return new ToyBuilder();
  }
>>>>>>> 0882664 (set up the CSV mapper)
  setToyType(toyType: string): ToyBuilder {
    this.toyType = toyType;
    return this;
  }
  setAgeGroup(ageGroup: string): ToyBuilder {
    this.ageGroup = ageGroup;
    return this;
  }
  setBrand(brand: string): ToyBuilder {
    this.brand = brand;
    return this;
  }
  setMaterial(material: string): ToyBuilder {
    this.material = material;
    return this;
  }
  setBatteryRequired(batteryRequired: boolean): ToyBuilder {
    this.batteryRequired = batteryRequired;
    return this;
  }
  setEducational(educational: boolean): ToyBuilder {
    this.educational = educational;
    return this;
  }
<<<<<<< HEAD

=======
  setPrice(price: number): ToyBuilder {
    this.price = price;
    return this;
  }
  setQuantity(quantity: number): ToyBuilder {
    this.quantity = quantity;
    return this;
  }
>>>>>>> ca5850c (Added the toy builder along with its validation and unit tests.)
  build(): Toy {
    const fields = {
      toyType: this.toyType,
      ageGroup: this.ageGroup,
      brand: this.brand,
      material: this.material,
      batteryRequired: this.batteryRequired,
      educational: this.educational,
<<<<<<< HEAD
=======
      price: this.price,
      quantity: this.quantity,
>>>>>>> ca5850c (Added the toy builder along with its validation and unit tests.)
    };
    ToyValidator.validate(fields);
    return new Toy(fields);
  }
}
