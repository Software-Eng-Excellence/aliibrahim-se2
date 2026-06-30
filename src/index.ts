import config from './config';
import {
  CakeBuilder,
  IdentifiableCakeBuilder,
} from './model/builders/Cake.builder';
import {
  IdentifiableOrderItemBuilder,
  OrderBuilder,
} from './model/builders/Order.builder';
import { CakeOrderRepository } from './repository/file/Cake.order.repository';
import { CakeRepository } from './repository/sqlite/Cake.order.repository';
import { OrderRepository } from './repository/sqlite/Order.repository';

import logger from './util/logger';

async function main() {
  // const path = config.storagePath.csv.cakes;
  // const repository = new CakeOrderRepository(path);
  // const orders = await repository.get('1');
  // logger.info('List of orders: \n %o', orders);
}
async function DBSandBox() {
  const dbOrder = new OrderRepository(new CakeRepository());
  await dbOrder.init();

  const cake = CakeBuilder.newBuilder()
    .setType('Birthday')
    .setFlavor('Chocolate')
    .setFilling('Cream')
    .setSize(10)
    .setLayers(2)
    .setFrostingType('Buttercream')
    .setFrostingFlavor('Vanilla')
    .setDecorationType('Sprinkles')
    .setDecorationColor('Red')
    .setCustomMessage('Happy Birthday!')
    .setShape('Round')
    .setAllergies('None')
    .setSpecialIngredients('None')
    .setPackagingType('Box')
    .build();
  const idCake = IdentifiableCakeBuilder.newBuilder()
    .setCake(cake)
    .setId('1')
    .build();
  const order = OrderBuilder.newBuilder()
    .setId('1')
    .setItem(cake)
    .setPrice(100)
    .setQuantity(1)
    .build();
  const idOrder = IdentifiableOrderItemBuilder.newBuilder()
    .setOrder(order)
    .setItem(idCake)
    .build();
  // use idOrder as needed here
  await dbOrder.create(idOrder);
  console.log((await dbOrder.getAll()).length);
}
// main();

DBSandBox().catch((error) => {
  logger.error('Error in DBSandBox: %o', error as Error);
});
