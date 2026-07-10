import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { OrderManagementService } from '../services/orderManagement.service';

const orderController = new OrderController(new OrderManagementService());
const routes = Router();

routes
  .route('/')
  .get(orderController.getAllOrders.bind(orderController))
  .post(orderController.createOrder.bind(orderController));

routes
  .route('/:id')
  .get(orderController.getOrder.bind(orderController))
  .put(orderController.updateOrder.bind(orderController))
  .delete(orderController.deleteOrder.bind(orderController));
export default routes;
