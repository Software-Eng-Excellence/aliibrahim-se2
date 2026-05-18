import { CSVCakeMapper } from './mappers/Cake.mapper';
import { CSVOrderMapper } from './mappers/Order.mapper';
import { readCSVFile } from './parsers/csvParser';
import logger from './util/logger';
async function main() {
  const data = await readCSVFile('src/data/cake orders.csv');
  const cakemapper = new CSVCakeMapper();
  const ordermapper = new CSVOrderMapper(cakemapper);
  const orders = data.map(ordermapper.map.bind(ordermapper));
  logger.info('List of orders: \n %o', orders);
}
main();
