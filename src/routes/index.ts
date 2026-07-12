import { Router } from 'express';
import OrderRoutes from './order.route';
import AnalyticsRoutes from './order.analytics.route';
const routes = Router();

routes.get('/', (req, res) => {
  // Pass a JavaScript object into res.json()
  res.json({ message: 'Hello, World!' });
});
routes.use('/orders', OrderRoutes);
routes.use('/orders/analytics', AnalyticsRoutes);
export default routes;
