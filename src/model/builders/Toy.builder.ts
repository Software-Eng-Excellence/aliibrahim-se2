import { Toy } from '../Toy.model';
import { ToyValidator } from '../validators/Toy.validator';

export class ToyBuilder {
  private toyType!: string;
  private ageGroup!: string;
  private brand!: string;
  private material!: string;
  private batteryRequired!: boolean;
  private educational!: boolean;

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
