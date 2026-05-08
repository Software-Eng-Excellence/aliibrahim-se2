import { CakeBuilder } from '../src/model/builders/Cake.builder';
describe('Cake Builder', () => {
  it('should build a cake with all properties set with free price', () => {
    const cake = new CakeBuilder()
      .setType('Birthday')
      .setFlavor('Chocolate')
      .setAllergies('None')
      .setFilling('Vanilla')
      .setSize(8)
      .setLayers(3)
      .setFrostingType('Buttercream')
      .setFrostingFlavor('Vanilla')
      .setDecorationType('Sprinkles')
      .setDecorationColor('Red')
      .setCustomMessage('Happy Birthday')
      .setShape('Round')
      .setSpecialIngredients('None')
      .setPackagingType('Box')
      .build();

    expect(cake).toBeDefined();
    expect(cake.getType()).toBe('Birthday');
    expect(cake.getFlavor()).toBe('Chocolate');
    expect(cake.getCategory()).toBe(0); // ItemCategory.CAKE
    expect(cake.getAllergies()).toBe('None');
    expect(cake.getFilling()).toBe('Vanilla');
    expect(cake.getSize()).toBe(8);
    expect(cake.getLayers()).toBe(3);
    expect(cake.getFrostingType()).toBe('Buttercream');
    expect(cake.getFrostingFlavor()).toBe('Vanilla');
    expect(cake.getDecorationType()).toBe('Sprinkles');
    expect(cake.getDecorationColor()).toBe('Red');
    expect(cake.getCustomMessage()).toBe('Happy Birthday');
    expect(cake.getShape()).toBe('Round');
    expect(cake.getSpecialIngredients()).toBe('None');
    expect(cake.getPackagingType()).toBe('Box');
  });
  it('should throw if type is missing', () => {
    const builder = new CakeBuilder();

    expect(() =>
      builder
        .setFlavor('Chocolate')
        .setAllergies('None')
        .setFilling('Vanilla')
        .setSize(8)
        .setLayers(3)
        .setFrostingType('Buttercream')
        .setFrostingFlavor('Vanilla')
        .setDecorationType('Sprinkles')
        .setDecorationColor('Red')
        .setCustomMessage('Happy Birthday')
        .setShape('Round')
        .setSpecialIngredients('None')
        .setPackagingType('Box')
        .build(),
    ).toThrow('Missing required field: type');
  });
  it('should throw an error if empty string is provided', () => {
    const cakeBuilder = new CakeBuilder();

    expect(() =>
      cakeBuilder
        .setType('')
        .setFlavor('Chocolate')
        .setAllergies('None')
        .setFilling('Vanilla')
        .setSize(8)
        .setLayers(3)
        .setFrostingType('Buttercream')
        .setFrostingFlavor('Vanilla')
        .setDecorationType('Sprinkles')
        .setDecorationColor('Red')
        .setCustomMessage('Happy Birthday')
        .setShape('Round')
        .setSpecialIngredients('None')
        .setPackagingType('Box')
        .build(),
    ).toThrow('Field must be a non-empty string: type');
  });
  it('should fail when size is NaN (demonstrates bug)', () => {
    const builder = new CakeBuilder();

    expect(() =>
      builder
        .setType('Birthday')
        .setFlavor('Chocolate')
        .setAllergies('None')
        .setFilling('Vanilla')
        .setSize(Number('abc')) // ← this is NaN
        .setLayers(3)
        .setFrostingType('Buttercream')
        .setFrostingFlavor('Vanilla')
        .setDecorationType('Sprinkles')
        .setDecorationColor('Red')
        .setCustomMessage('Happy Birthday')
        .setShape('Round')
        .setSpecialIngredients('None')
        .setPackagingType('Box')
        .build(),
    ).toThrow();
  });
});
