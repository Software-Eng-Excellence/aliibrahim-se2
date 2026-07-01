import { IMapper } from './IMapper';
import { IdentifiableToy, Toy } from '../model/Toy.model';
import {
  IdentifiableToyBuilder,
  ToyBuilder,
} from '../model/builders/Toy.builder';

export class CSVToyMapper implements IMapper<string[], Toy> {
  map(data: string[]): Toy {
    return buildToy({
      toyType: data[0],
      ageGroup: data[1],
      brand: data[2],
      material: data[3],
      batteryRequired: data[4] === 'true',
      educational: data[5] === 'true',
    });
  }
  reverse(data: Toy): string[] {
    return reverseToy(data);
  }
}
export class JSONToyMapper implements IMapper<any, Toy> {
  map(data: any): Toy {
    return buildToy(data);
  }
  reverse(data: Toy): any {
    return reverseToy(data);
  }
}
export class XMLToyMapper implements IMapper<any, Toy> {
  map(data: any): Toy {
    return buildToy({
      ...data,
      batteryRequired: data.batteryRequired === 'true',
      educational: data.educational === 'true',
    });
  }
  reverse(data: Toy): any {
    return reverseToy(data);
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
    .build();
}
function reverseToy(data: Toy): any {
  return {
    toyType: data.getToyType(),
    ageGroup: data.getAgeGroup(),
    brand: data.getBrand(),
    material: data.getMaterial(),
    batteryRequired: data.isBatteryRequired(),
    educational: data.isEducational(),
  };
}
export interface PostgresToy {
  id: string;
  toytype: string;
  agegroup: string;
  brand: string;
  material: string;
  batteryrequired: boolean;
  educational: boolean;
}
export class PostgresToyMapper implements IMapper<
  PostgresToy,
  IdentifiableToy
> {
  map(data: PostgresToy): IdentifiableToy {
    return IdentifiableToyBuilder.newBuilder()
      .setToy(
        new ToyBuilder()
          .setToyType(data.toytype)
          .setAgeGroup(data.agegroup)
          .setBrand(data.brand)
          .setMaterial(data.material)
          .setBatteryRequired(data.batteryrequired)
          .setEducational(data.educational)
          .build(),
      )
      .setId(data.id)
      .build();
  }
  reverse(data: IdentifiableToy): PostgresToy {
    return {
      id: data.getId(),
      toytype: data.getToyType(),
      agegroup: data.getAgeGroup(),
      brand: data.getBrand(),
      material: data.getMaterial(),
      batteryrequired: data.isBatteryRequired(),
      educational: data.isEducational(),
    };
  }
}
