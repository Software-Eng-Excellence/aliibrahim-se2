import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { OrderManagementService } from '../services/orderManagement.service';
import { asyncHandler } from '../middleware/asyncHandler';

const orderController = new OrderController(new OrderManagementService());
const routes = Router();

routes
  .route('/')
  .get(asyncHandler(orderController.getAllOrders.bind(orderController)))
  .post(asyncHandler(orderController.createOrder.bind(orderController)));

routes
  .route('/:id')
  .get(asyncHandler(orderController.getOrder.bind(orderController)))
  .put(asyncHandler(orderController.updateOrder.bind(orderController)))
  .delete(asyncHandler(orderController.deleteOrder.bind(orderController)));
export default routes;
