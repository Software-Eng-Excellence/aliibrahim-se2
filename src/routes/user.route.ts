import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { UserService } from '../services/user.service';
import { asyncHandler } from '../middleware/asyncHandler';

const userController = new UserController(new UserService());
const routes = Router();

routes
  .route('/')
  .get(asyncHandler(userController.getAllUsers.bind(userController)))
  .post(asyncHandler(userController.createUser.bind(userController)));

routes
  .route('/:id')
  .get(asyncHandler(userController.getUser.bind(userController)))
  .put(asyncHandler(userController.updateUser.bind(userController)))
  .delete(asyncHandler(userController.deleteUser.bind(userController)));
export default routes;
