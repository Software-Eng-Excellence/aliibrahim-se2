// this test file is for checking if the mapper correctly maps toy model own fields
import {
  CSVToyMapper,
  JSONToyMapper,
  XMLToyMapper,
} from '../../src/mappers/Toy.mapper';

describe('ToyMapper happy path', () => {
  it('maps CSV toy data correctly', () => {
    const row = [
      'Action Figure',
      '6+',
      'Hasbro',
      'Plastic',
      'true',
      'false',
      '29.99',
      '10',
    ];

    const toy = new CSVToyMapper().map(row);

    expect(toy.getType()).toBe('Action Figure');
    expect(toy.getAgeGroup()).toBe('6+');
    expect(toy.getBrand()).toBe('Hasbro');
    expect(toy.getMaterial()).toBe('Plastic');
    expect(toy.isBatteryRequired()).toBe(true);
    expect(toy.isEducational()).toBe(false);
    expect(toy.getPrice()).toBe(29.99);
    expect(toy.getQuantity()).toBe(10);
  });

  it('maps JSON toy data correctly', () => {
    const data = {
      toyType: 'Action Figure',
      ageGroup: '6+',
      brand: 'Hasbro',
      material: 'Plastic',
      batteryRequired: true,
      educational: false,
      price: 29.99,
      quantity: 10,
    };

    const toy = new JSONToyMapper().map(data);

    expect(toy.getType()).toBe('Action Figure');
    expect(toy.getAgeGroup()).toBe('6+');
    expect(toy.getBrand()).toBe('Hasbro');
    expect(toy.getMaterial()).toBe('Plastic');
    expect(toy.isBatteryRequired()).toBe(true);
    expect(toy.isEducational()).toBe(false);
    expect(toy.getPrice()).toBe(29.99);
    expect(toy.getQuantity()).toBe(10);
  });

  it('maps XML toy data correctly', () => {
    const data = {
      toyType: 'Action Figure',
      ageGroup: '6+',
      brand: 'Hasbro',
      material: 'Plastic',
      batteryRequired: 'true',
      educational: 'false',
      price: 29.99,
      quantity: 10,
    };
    console.log('XML Toy Data:', data);
    const toy = new XMLToyMapper().map(data);

    expect(toy.getType()).toBe('Action Figure');
    expect(toy.getAgeGroup()).toBe('6+');
    expect(toy.getBrand()).toBe('Hasbro');
    expect(toy.getMaterial()).toBe('Plastic');
    expect(toy.isBatteryRequired()).toBe(true);
    expect(toy.isEducational()).toBe(false);
    expect(toy.getPrice()).toBe(29.99);
    expect(toy.getQuantity()).toBe(10);
  });
});
