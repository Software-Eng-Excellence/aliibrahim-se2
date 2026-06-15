import config from './config';
import { CakeOrderRepository } from './repository/file/Cake.order.repository';
import logger from './util/logger';
async function main() {
  const path = config.storagePath.csv.cakes;
  const repository = new CakeOrderRepository(path);
  const orders = await repository.get('1');
  logger.info('List of orders: \n %o', orders);
}
main();
