import { Router } from 'express';
import { OrderAnalyticsController } from '../controllers/order.analytics.controller';
import { asyncHandler } from '../middleware/asyncHandler';
import { OrderAnalyticsService } from '../services/orderAnalytics.service';

const orderAnalyticsController = new OrderAnalyticsController(
  new OrderAnalyticsService(),
);
const routes = Router();

routes
  .route('/total-order-count')
  .get(
    asyncHandler(
      orderAnalyticsController.getTotalOrderCount.bind(
        orderAnalyticsController,
      ),
    ),
  );

routes
  .route('/order-count-by-category')
  .get(
    asyncHandler(
      orderAnalyticsController.getOrderCountByCategory.bind(
        orderAnalyticsController,
      ),
    ),
  );
routes
  .route('/total-revenue')
  .get(
    asyncHandler(
      orderAnalyticsController.getTotalRevenue.bind(orderAnalyticsController),
    ),
  );
routes
  .route('/revenue-by-category')
  .get(
    asyncHandler(
      orderAnalyticsController.getRevenueByCategory.bind(
        orderAnalyticsController,
      ),
    ),
  );
export default routes;
