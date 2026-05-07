import { Item, ItemCategory } from './Item.model';

export class Cake implements Item {
  private type: string;
  private flavor: string;
  private filling: string;
  private size: number;
  private layers: number;
  private frostingType: string;
  private frostingFlavor: string;
  private decorationType: string;
  private decorationColor: string;
  private customMessage: string;
  private shape: string;
  private allergies: string;
  private specialIngredients: string;
  private packagingType: string;

  constructor(data: {
    type: string;
    flavor: string;
    filling: string;
    size: number;
    layers: number;
    frostingType: string;
    frostingFlavor: string;
    decorationType: string;
    decorationColor: string;
    customMessage: string;
    shape: string;
    allergies: string;
    specialIngredients: string;
    packagingType: string;
    price: number;
    quantity: number;
  }) {
    this.type = data.type;
    this.flavor = data.flavor;
    this.filling = data.filling;
    this.size = data.size;
    this.layers = data.layers;
    this.frostingType = data.frostingType;
    this.frostingFlavor = data.frostingFlavor;
    this.decorationType = data.decorationType;
    this.decorationColor = data.decorationColor;
    this.customMessage = data.customMessage;
    this.shape = data.shape;
    this.allergies = data.allergies;
    this.specialIngredients = data.specialIngredients;
    this.packagingType = data.packagingType;
  }
  getCategory(): ItemCategory {
    return ItemCategory.CAKE;
  }
  getType(): string {
    return this.type;
  }

  getFlavor(): string {
    return this.flavor;
  }

  getFilling(): string {
    return this.filling;
  }

  getSize(): number {
    return this.size;
  }

  getLayers(): number {
    return this.layers;
  }

  getFrostingType(): string {
    return this.frostingType;
  }

  getFrostingFlavor(): string {
    return this.frostingFlavor;
  }

  getDecorationType(): string {
    return this.decorationType;
  }

  getDecorationColor(): string {
    return this.decorationColor;
  }

  getCustomMessage(): string {
    return this.customMessage;
  }

  getShape(): string {
    return this.shape;
  }

  getAllergies(): string {
    return this.allergies;
  }

  getSpecialIngredients(): string {
    return this.specialIngredients;
  }

  getPackagingType(): string {
    return this.packagingType;
  }
}
