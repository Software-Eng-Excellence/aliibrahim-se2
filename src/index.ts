import { Cake } from './model/Cake.model';
import { CakeBuilder } from './model/builders/Cake.builder';
async function main() {
  const cakeBuilder = new CakeBuilder();
  const cake = cakeBuilder
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
    .setPrice(45.99)
    .setQuantity(1)
    .build();
  console.log(cake);
}
main();
