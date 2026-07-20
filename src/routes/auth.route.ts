import { Router } from 'express';

import { asyncHandler } from '../middleware/asyncHandler';
import { AuthenticationService } from '../services/Authentication.service';
import { UserService } from '../services/user.service';
import { AuthenticationController } from '../controllers/auth.controller';

const routes = Router();
const authService = AuthenticationService.getInstance();
const userService = new UserService();

const authController = new AuthenticationController(authService, userService);

routes
  .route('/login')
  .post(asyncHandler(authController.login.bind(authController)));

routes
  .route('/logout')
  .get(asyncHandler(authController.logout.bind(authController)));
export default routes;
