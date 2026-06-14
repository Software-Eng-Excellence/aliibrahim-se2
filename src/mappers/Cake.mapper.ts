import { IMapper } from './IMapper';
import { Cake } from '../model/Cake.model';
import { CakeBuilder } from '../model/builders/Cake.builder';
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
}

export class JSONCakeMapper implements IMapper<any, Cake> {
  map(data: any): Cake {
    return buildCake(data);
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
