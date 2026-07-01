import logger from '../../util/logger';
import { Cake, IdentifiableCake } from '../Cake.model';
import { CakeValidator } from '../validators/Cake.validator';

export class CakeBuilder {
  private type!: string;
  private flavor!: string;
  private filling!: string;
  private size!: number;
  private layers!: number;
  private frostingType!: string;
  private frostingFlavor!: string;
  private decorationType!: string;
  private decorationColor!: string;
  private customMessage!: string;
  private shape!: string;
  private allergies!: string;
  private specialIngredients!: string;
  private packagingType!: string;

  public static newBuilder(): CakeBuilder {
    return new CakeBuilder();
  }
  setType(type: string): CakeBuilder {
    this.type = type;
    return this;
  }

  setFlavor(flavor: string): CakeBuilder {
    this.flavor = flavor;
    return this;
  }

  setFilling(filling: string): CakeBuilder {
    this.filling = filling;
    return this;
  }

  setSize(size: number): CakeBuilder {
    this.size = size;
    return this;
  }

  setLayers(layers: number): CakeBuilder {
    this.layers = layers;
    return this;
  }

  setFrostingType(frostingType: string): CakeBuilder {
    this.frostingType = frostingType;
    return this;
  }

  setFrostingFlavor(frostingFlavor: string): CakeBuilder {
    this.frostingFlavor = frostingFlavor;
    return this;
  }

  setDecorationType(decorationType: string): CakeBuilder {
    this.decorationType = decorationType;
    return this;
  }

  setDecorationColor(decorationColor: string): CakeBuilder {
    this.decorationColor = decorationColor;
    return this;
  }

  setCustomMessage(customMessage: string): CakeBuilder {
    this.customMessage = customMessage;
    return this;
  }

  setShape(shape: string): CakeBuilder {
    this.shape = shape;
    return this;
  }

  setAllergies(allergies: string): CakeBuilder {
    this.allergies = allergies;
    return this;
  }

  setSpecialIngredients(specialIngredients: string): CakeBuilder {
    this.specialIngredients = specialIngredients;
    return this;
  }

  setPackagingType(packagingType: string): CakeBuilder {
    this.packagingType = packagingType;
    return this;
  }

  build(): Cake {
    const fields = {
      type: this.type,
      flavor: this.flavor,
      filling: this.filling,
      size: this.size,
      layers: this.layers,
      frostingType: this.frostingType,
      frostingFlavor: this.frostingFlavor,
      decorationType: this.decorationType,
      decorationColor: this.decorationColor,
      customMessage: this.customMessage,
      shape: this.shape,
      allergies: this.allergies,
      specialIngredients: this.specialIngredients,
      packagingType: this.packagingType,
    };
    CakeValidator.validate(fields);
    return new Cake(fields);
  }
}

export class IdentifiableCakeBuilder extends CakeBuilder {
  private id?: string;
  private cake!: Cake;
  static newBuilder(): IdentifiableCakeBuilder {
    return new IdentifiableCakeBuilder();
  }

  public setId(id: string): IdentifiableCakeBuilder {
    this.id = id;
    return this;
  }
  setCake(cake: Cake): IdentifiableCakeBuilder {
    this.cake = cake;
    return this;
  }
  build(): IdentifiableCake {
    if (!this.cake) {
      logger.error('Cake must be set before building IdentifiableCake');
      throw new Error('Cake must be set before building IdentifiableCake');
    }
    const finalId = this.id || this.generateRandomAlphanumericId();
    return new IdentifiableCake(finalId, {
      type: this.cake.getType(),
      flavor: this.cake.getFlavor(),
      filling: this.cake.getFilling(),
      size: this.cake.getSize(),
      layers: this.cake.getLayers(),
      frostingType: this.cake.getFrostingType(),
      frostingFlavor: this.cake.getFrostingFlavor(),
      decorationType: this.cake.getDecorationType(),
      decorationColor: this.cake.getDecorationColor(),
      customMessage: this.cake.getCustomMessage(),
      shape: this.cake.getShape(),
      allergies: this.cake.getAllergies(),
      specialIngredients: this.cake.getSpecialIngredients(),
      packagingType: this.cake.getPackagingType(),
    });
  }
  private generateRandomAlphanumericId(): string {
    // Returns something like: "7X2A9B84" or "K8N3M2QX"
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  }
}
