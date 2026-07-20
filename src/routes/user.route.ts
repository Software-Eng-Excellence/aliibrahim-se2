import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { UserService } from '../services/user.service';
import { asyncHandler } from '../middleware/asyncHandler';
import { authenticate } from '../middleware/auth';

const userController = new UserController(new UserService());
const routes = Router();

routes
  .route('/')
  .get(
    authenticate,
    asyncHandler(userController.getAllUsers.bind(userController)),
  )
  .post(asyncHandler(userController.createUser.bind(userController)));

routes
  .route('/:id')
  .get(authenticate, asyncHandler(userController.getUser.bind(userController)))
  .put(
    authenticate,
    asyncHandler(userController.updateUser.bind(userController)),
  )
  .delete(
    authenticate,
    asyncHandler(userController.deleteUser.bind(userController)),
  );
export default routes;
