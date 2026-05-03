import { IMapper } from './IMapper';
import { Toy } from '../model/Toy.model';
import { ToyBuilder } from '../model/builders/Toy.builder';

export class CSVToyMapper implements IMapper<string[], Toy> {
  map(data: string[]): Toy {
    return buildToy({
      toyType: data[0],
      ageGroup: data[1],
      brand: data[2],
      material: data[3],
      batteryRequired: data[4] === 'true',
      educational: data[5] === 'true',
      price: parseFloat(data[6]),
      quantity: parseInt(data[7]),
    });
  }
}
export class JSONToyMapper implements IMapper<any, Toy> {
  map(data: any): Toy {
    return buildToy(data);
  }
}
export class XMLToyMapper implements IMapper<any, Toy> {
  map(data: any): Toy {
    return buildToy({
      ...data,
      batteryRequired: data.batteryRequired === 'true',
      educational: data.educational === 'true',
      price: parseFloat(data.price),
      quantity: parseInt(data.quantity),
    });
  }
}
function buildToy(data: any): Toy {
  return ToyBuilder.newBuilder()
    .setToyType(data.toyType)
    .setAgeGroup(data.ageGroup)
    .setBrand(data.brand)
    .setMaterial(data.material)
    .setBatteryRequired(data.batteryRequired)
    .setEducational(data.educational)
    .setPrice(data.price)
    .setQuantity(data.quantity)
    .build();
}
