import { Item, ItemCategory } from './Item.model';

export class Toy implements Item {
  private toyType: string;
  private ageGroup: string;
  private brand: string;
  private material: string;
  private batteryRequired: boolean;
  private educational: boolean;

  constructor(data: {
    toyType: string;
    ageGroup: string;
    brand: string;
    material: string;
    batteryRequired: boolean;
    educational: boolean;
<<<<<<< HEAD
=======
    price: number;
    quantity: number;
>>>>>>> ca5850c (Added the toy builder along with its validation and unit tests.)
  }) {
    this.toyType = data.toyType;
    this.ageGroup = data.ageGroup;
    this.brand = data.brand;
    this.material = data.material;
    this.batteryRequired = data.batteryRequired;
    this.educational = data.educational;
<<<<<<< HEAD
=======
    this.price = data.price;
    this.quantity = data.quantity;
>>>>>>> ca5850c (Added the toy builder along with its validation and unit tests.)
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
