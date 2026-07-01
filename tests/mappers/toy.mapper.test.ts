// this test file is for checking if the mapper correctly maps toy model own fields
import {
  CSVToyMapper,
  JSONToyMapper,
  XMLToyMapper,
} from '../../src/mappers/Toy.mapper';

describe('ToyMapper happy path', () => {
  it('maps CSV toy data correctly', () => {
    const row = ['Action Figure', '6+', 'Hasbro', 'Plastic', 'true', 'false'];

    const toy = new CSVToyMapper().map(row);

    expect(toy.getToyType()).toBe('Action Figure');
    expect(toy.getAgeGroup()).toBe('6+');
    expect(toy.getBrand()).toBe('Hasbro');
    expect(toy.getMaterial()).toBe('Plastic');
    expect(toy.isBatteryRequired()).toBe(true);
    expect(toy.isEducational()).toBe(false);
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

    expect(toy.getToyType()).toBe('Action Figure');
    expect(toy.getAgeGroup()).toBe('6+');
    expect(toy.getBrand()).toBe('Hasbro');
    expect(toy.getMaterial()).toBe('Plastic');
    expect(toy.isBatteryRequired()).toBe(true);
    expect(toy.isEducational()).toBe(false);
  });

  it('maps XML toy data correctly', () => {
    const data = {
      toyType: 'Action Figure',
      ageGroup: '6+',
      brand: 'Hasbro',
      material: 'Plastic',
      batteryRequired: 'true',
      educational: 'false',
    };
    console.log('XML Toy Data:', data);
    const toy = new XMLToyMapper().map(data);

    expect(toy.getToyType()).toBe('Action Figure');
    expect(toy.getAgeGroup()).toBe('6+');
    expect(toy.getBrand()).toBe('Hasbro');
    expect(toy.getMaterial()).toBe('Plastic');
    expect(toy.isBatteryRequired()).toBe(true);
    expect(toy.isEducational()).toBe(false);
  });
});
