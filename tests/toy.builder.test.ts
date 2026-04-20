import { ToyBuilder } from '../src/model/builders/Toy.builder';

describe('Toy Builder', () => {
  it('should build a toy with all properties set with free price', () => {
    const toy = new ToyBuilder()
      .setToyType('Action Figure')
      .setAgeGroup('8+')
      .setBrand('FunToys')
      .setMaterial('Plastic')
      .setBatteryRequired(false)
      .setEducational(true)
      .build();

    expect(toy).toBeDefined();
    expect(toy.getCategory()).toBe(2); // ItemCategory.TOY
    expect(toy.getType()).toBe('Action Figure');
    expect(toy.getAgeGroup()).toBe('8+');
    expect(toy.getBrand()).toBe('FunToys');
    expect(toy.getMaterial()).toBe('Plastic');
    expect(toy.isBatteryRequired()).toBe(false);
    expect(toy.isEducational()).toBe(true);
  });

  it('should throw if toyType is missing', () => {
    const builder = new ToyBuilder();

    expect(() =>
      builder
        .setAgeGroup('8+')
        .setBrand('FunToys')
        .setMaterial('Plastic')
        .setBatteryRequired(false)
        .setEducational(true)
        .build(),
    ).toThrow('Missing required field: toyType');
  });

  it('should throw an error if empty string is provided', () => {
    const builder = new ToyBuilder();

    expect(() =>
      builder
        .setToyType('')
        .setAgeGroup('8+')
        .setBrand('FunToys')
        .setMaterial('Plastic')
        .setBatteryRequired(false)
        .setEducational(true)
        .build(),
    ).toThrow('Field must be a non-empty string: toyType');
  });

  it('should fail when batteryRequired is not a boolean', () => {
    const builder = new ToyBuilder();

    expect(() =>
      builder
        .setToyType('Action Figure')
        .setAgeGroup('8+')
        .setBrand('FunToys')
        .setMaterial('Plastic')
        .setBatteryRequired('yes' as unknown as boolean)
        .setEducational(true)
        .build(),
    ).toThrow('Field must be a boolean: batteryRequired');
  });
});
