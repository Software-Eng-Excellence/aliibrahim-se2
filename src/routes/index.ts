import { Router } from 'express';
import OrderRoutes from './order.route';
import AnalyticsRoutes from './order.analytics.route';
import UserRoutes from './user.route';
import AuthRoutes from './auth.route';
import { authenticate } from '../middleware/auth';
const routes = Router();

routes.get('/', (req, res) => {
  // Pass a JavaScript object into res.json()
  res.json({ message: 'Hello, World!' });
});
routes.use('/orders', authenticate, OrderRoutes);
routes.use('/orders/analytics', authenticate, AnalyticsRoutes);
routes.use('/users', UserRoutes);
routes.use('/auth', AuthRoutes);
export default routes;
