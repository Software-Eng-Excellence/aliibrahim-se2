import {
  FinancialCalculator,
  OrderManagement,
  PriceValidator,
  MaxPriceValidator,
  ItemValidator,
  Validator,
} from './app';
import logger from './util/logger';

const orders = [
  { id: 1, item: 'Sponge', price: 15 },
  { id: 2, item: 'Chocolate', price: 20 },
  { id: 3, item: 'Fruit', price: 18 },
  { id: 4, item: 'Red Velvet', price: 25 },
  { id: 5, item: 'Coffee', price: 8 },
];

const orderManager = new OrderManagement(
  new Validator(),
  new FinancialCalculator(),
);

for (const order of orders) {
  orderManager.addOrder(order.item, order.price);
}

// Adding a new order directly
const newItem = 'Marble';
const newPrice = 22;

orderManager.addOrder(newItem, newPrice);

logger.info('Orders after adding a new order: %o', orderManager.getOrders());

// Calculate Total Revenue directly
logger.info('Total Revenue: %s', orderManager.getTotalRevenue().toFixed(2));

// Calculate Average Buy Power directly
logger.info(
  'Average Buy Power: %s',
  orderManager.getAverageBuyPower().toFixed(2),
);

// Fetching an order directly
const fetchId = 2;
const fetchedOrder = orderManager.getOrder(fetchId);
logger.info('Order with ID 2: %o', fetchedOrder);

// Attempt to fetch a non-existent order
const nonExistentId = 10;
const nonExistentOrder = orderManager.getOrder(nonExistentId);
logger.info('Order with ID 10 (non-existent): %o', nonExistentOrder);
