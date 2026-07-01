import { IMapper } from './IMapper';
import { Cake, IdentifiableCake } from '../model/Cake.model';
import {
  CakeBuilder,
  IdentifiableCakeBuilder,
} from '../model/builders/Cake.builder';
export class CSVCakeMapper implements IMapper<string[], Cake> {
  map(data: string[]): Cake {
    return CakeBuilder.newBuilder()
      .setType(data[1])
      .setFlavor(data[2])
      .setFilling(data[3])
      .setSize(parseInt(data[4]))
      .setLayers(parseInt(data[5]))
      .setFrostingType(data[6])
      .setFrostingFlavor(data[7])
      .setDecorationType(data[8])
      .setDecorationColor(data[9])
      .setCustomMessage(data[10])
      .setShape(data[11])
      .setAllergies(data[12])
      .setSpecialIngredients(data[13])
      .setPackagingType(data[14])
      .build();
  }
  reverse(data: Cake): string[] {
    return reverseCake(data);
  }
}

export class JSONCakeMapper implements IMapper<any, Cake> {
  map(data: any): Cake {
    return buildCake(data);
  }
  reverse(data: Cake): any {
    return reverseCake(data);
  }
}

export class XMLCakeMapper implements IMapper<any, Cake> {
  map(data: any): Cake {
    return buildCake({
      ...data,
      size: parseInt(data.size),
      layers: parseInt(data.layers),
    });
  }
  reverse(data: Cake): any {
    return reverseCake(data);
  }
}
function buildCake(data: any): Cake {
  return CakeBuilder.newBuilder()
    .setType(data.type)
    .setFlavor(data.flavor)
    .setFilling(data.filling)
    .setSize(data.size)
    .setLayers(data.layers)
    .setFrostingType(data.frostingType)
    .setFrostingFlavor(data.frostingFlavor)
    .setDecorationType(data.decorationType)
    .setDecorationColor(data.decorationColor)
    .setCustomMessage(data.customMessage)
    .setShape(data.shape)
    .setAllergies(data.allergies)
    .setSpecialIngredients(data.specialIngredients)
    .setPackagingType(data.packagingType)
    .build();
}
function reverseCake(cake: Cake): any {
  return {
    type: cake.getType(),
    flavor: cake.getFlavor(),
    filling: cake.getFilling(),
    size: cake.getSize(),
    layers: cake.getLayers(),
    frostingType: cake.getFrostingType(),
    frostingFlavor: cake.getFrostingFlavor(),
    decorationType: cake.getDecorationType(),
    decorationColor: cake.getDecorationColor(),
    customMessage: cake.getCustomMessage(),
    shape: cake.getShape(),
    allergies: cake.getAllergies(),
    specialIngredients: cake.getSpecialIngredients(),
    packagingType: cake.getPackagingType(),
  };
}
export interface SQLiteCake {
  id: string;
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
}

export class SQLiteCakeMapper implements IMapper<SQLiteCake, IdentifiableCake> {
  map(data: SQLiteCake): IdentifiableCake {
    return IdentifiableCakeBuilder.newBuilder()
      .setCake(
        CakeBuilder.newBuilder()
          .setType(data.type)
          .setFlavor(data.flavor)
          .setFilling(data.filling)
          .setSize(data.size)
          .setLayers(data.layers)
          .setFrostingType(data.frostingType)
          .setFrostingFlavor(data.frostingFlavor)
          .setDecorationType(data.decorationType)
          .setDecorationColor(data.decorationColor)
          .setCustomMessage(data.customMessage)
          .setShape(data.shape)
          .setAllergies(data.allergies)
          .setSpecialIngredients(data.specialIngredients)
          .setPackagingType(data.packagingType)
          .build(),
      )
      .setId(data.id)
      .build();
  }
  reverse(data: IdentifiableCake): SQLiteCake {
    return {
      id: data.getId(),
      type: data.getType(),
      flavor: data.getFlavor(),
      filling: data.getFilling(),
      size: data.getSize(),
      layers: data.getLayers(),
      frostingType: data.getFrostingType(),
      frostingFlavor: data.getFrostingFlavor(),
      decorationType: data.getDecorationType(),
      decorationColor: data.getDecorationColor(),
      customMessage: data.getCustomMessage(),
      shape: data.getShape(),
      allergies: data.getAllergies(),
      specialIngredients: data.getSpecialIngredients(),
      packagingType: data.getPackagingType(),
    };
  }
}
// camal case instead of doing the AS in queries
export interface PostgresCake {
  id: string;
  type: string;
  flavor: string;
  filling: string;
  size: number;
  layers: number;
  frostingtype: string;
  frostingflavor: string;
  decorationtype: string;
  decorationcolor: string;
  custommessage: string;
  shape: string;
  allergies: string;
  specialingredients: string;
  packagingtype: string;
}
export class PostgresCakeMapper implements IMapper<
  PostgresCake,
  IdentifiableCake
> {
  map(data: PostgresCake): IdentifiableCake {
    return IdentifiableCakeBuilder.newBuilder()
      .setCake(
        CakeBuilder.newBuilder()
          .setType(data.type)
          .setFlavor(data.flavor)
          .setFilling(data.filling)
          .setSize(data.size)
          .setLayers(data.layers)
          // Map the lowercase database keys directly into your camelCase builders!
          .setFrostingType(data.frostingtype)
          .setFrostingFlavor(data.frostingflavor)
          .setDecorationType(data.decorationtype)
          .setDecorationColor(data.decorationcolor)
          .setCustomMessage(data.custommessage)
          .setShape(data.shape)
          .setAllergies(data.allergies)
          .setSpecialIngredients(data.specialingredients)
          .setPackagingType(data.packagingtype)
          .build(),
      )
      .setId(data.id)
      .build();
  }

  reverse(data: IdentifiableCake): PostgresCake {
    return {
      id: data.getId(),
      type: data.getType(),
      flavor: data.getFlavor(),
      filling: data.getFilling(),
      size: data.getSize(),
      layers: data.getLayers(),
      frostingtype: data.getFrostingType(),
      frostingflavor: data.getFrostingFlavor(),
      decorationtype: data.getDecorationType(),
      decorationcolor: data.getDecorationColor(),
      custommessage: data.getCustomMessage(),
      shape: data.getShape(),
      allergies: data.getAllergies(),
      specialingredients: data.getSpecialIngredients(),
      packagingtype: data.getPackagingType(),
    };
  }
}
