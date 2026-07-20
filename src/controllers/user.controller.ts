import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { JsonUserMapper } from '../mappers/User.mapper';
import { BadRequestException } from '../util/exceptions/http/BadRequestException';

export class UserController {
  constructor(private readonly userService: UserService) { }

  //create a user
  public async createUser(req: Request, res: Response) {
    if (!req.body) {
      throw new BadRequestException('User data is required', {
        userNotDefined: true,
      });
    }
    const user = new JsonUserMapper().map(req.body);
    const createdUser = await this.userService.createUser(user);
    res.status(201).json(new JsonUserMapper().toSafeResponse(createdUser));
  }

  //Get user
  public async getUser(req: Request<{ id: string }>, res: Response) {
    const id = req.params.id;
    if (!id) {
      throw new BadRequestException('User ID is required', {
        userIdNotDefined: true,
      });
    }
    const user = await this.userService.getUser(id);
    res.status(200).json(new JsonUserMapper().toSafeResponse(user));
  }

  //Get all users
  public async getAllUsers(req: Request, res: Response) {
    const users = await this.userService.getAllUsers();
    res
      .status(200)
      .json(users.map((user) => new JsonUserMapper().toSafeResponse(user)));
  }

  //Update user
  public async updateUser(req: Request<{ id: string }>, res: Response) {
    const id = req.params.id;
    if (!id) {
      throw new BadRequestException('User ID is required', {
        userIdNotDefined: true,
      });
    }
    const user = new JsonUserMapper().map(req.body);
    if (user.getId() !== id) {
      throw new BadRequestException('User ID mismatch', {
        userIdMismatch: true,
      });
    }
    const updatedUser = await this.userService.updateUser(user);
    res.status(200).json(new JsonUserMapper().toSafeResponse(updatedUser));
  }

  //Delete user
  public async deleteUser(req: Request<{ id: string }>, res: Response) {
    const id = req.params.id;
    if (!id) {
      throw new BadRequestException('User ID is required', {
        userIdNotDefined: true,
      });
    }
    await this.userService.deleteUser(id);
    res.status(204).send();
  }
}
