import logger from '../../util/logger';
import { IdentifiableToy, Toy } from '../Toy.model';
import { ToyValidator } from '../validators/Toy.validator';

export class ToyBuilder {
  private toyType!: string;
  private ageGroup!: string;
  private brand!: string;
  private material!: string;
  private batteryRequired!: boolean;
  private educational!: boolean;
  public static newBuilder(): ToyBuilder {
    return new ToyBuilder();
  }
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
  build(): Toy {
    const fields = {
      toyType: this.toyType,
      ageGroup: this.ageGroup,
      brand: this.brand,
      material: this.material,
      batteryRequired: this.batteryRequired,
      educational: this.educational,
    };
    ToyValidator.validate(fields);
    return new Toy(fields);
  }
}
export class IdentifiableToyBuilder extends ToyBuilder {
  private id?: string;
  private toy!: Toy;
  static newBuilder(): IdentifiableToyBuilder {
    return new IdentifiableToyBuilder();
  }
  public setId(id: string): IdentifiableToyBuilder {
    this.id = id;
    return this;
  }
  setToy(toy: Toy): IdentifiableToyBuilder {
    this.toy = toy;
    return this;
  }
  build(): IdentifiableToy {
    if (!this.toy) {
      logger.error('Toy must be set before building IdentifiableToy');
      throw new Error('Toy must be set before building IdentifiableToy');
    }
    const finalId = this.id || this.generateRandomAlphanumericId();
    return new IdentifiableToy(finalId, {
      toyType: this.toy.getToyType(),
      ageGroup: this.toy.getAgeGroup(),
      brand: this.toy.getBrand(),
      material: this.toy.getMaterial(),
      batteryRequired: this.toy.isBatteryRequired(),
      educational: this.toy.isEducational(),
    });
  }
  private generateRandomAlphanumericId() {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }
}
