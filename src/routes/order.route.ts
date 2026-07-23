import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { OrderManagementService } from '../services/orderManagement.service';
import { asyncHandler } from '../middleware/asyncHandler';
import { hasPermission } from '../middleware/authorize';
import { Permission } from '../config/roles';

const orderController = new OrderController(new OrderManagementService());
const routes = Router();

routes
  .route('/')
  .get(
    hasPermission(Permission.READ_ORDER),
    asyncHandler(orderController.getAllOrders.bind(orderController)),
  )
  .post(
    hasPermission(Permission.WRITE_ORDER),
    asyncHandler(orderController.createOrder.bind(orderController)),
  );

routes
  .route('/:id')
  .get(
    hasPermission(Permission.READ_ORDER),
    asyncHandler(orderController.getOrder.bind(orderController)),
  )
  .put(
    hasPermission(Permission.UPDATE_ORDER),
    asyncHandler(orderController.updateOrder.bind(orderController)),
  )
  .delete(
    hasPermission(Permission.DELETE_ORDER),
    asyncHandler(orderController.deleteOrder.bind(orderController)),
  );
export default routes;
