import { Item, ItemCategory } from './Item.model';

export class Toy implements Item {
  private toyType: string;
  private ageGroup: string;
  private brand: string;
  private material: string;
  private batteryRequired: boolean;
  private educational: boolean;

  constructor(
    toyType: string,
    ageGroup: string,
    brand: string,
    material: string,
    batteryRequired: boolean,
    educational: boolean,
  ) {
    this.toyType = toyType;
    this.ageGroup = ageGroup;
    this.brand = brand;
    this.material = material;
    this.batteryRequired = batteryRequired;
    this.educational = educational;
  }

  public getType(): string {
    return this.toyType;
  }

  public getAgeGroup(): string {
    return this.ageGroup;
  }

  public getBrand(): string {
    return this.brand;
  }

  public getMaterial(): string {
    return this.material;
  }

  public isBatteryRequired(): boolean {
    return this.batteryRequired;
  }

  public isEducational(): boolean {
    return this.educational;
  }

  public getCategory(): ItemCategory {
    return ItemCategory.TOY;
  }
}
