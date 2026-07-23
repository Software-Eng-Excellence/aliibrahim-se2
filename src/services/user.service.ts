import { UserRepository } from '../repository/postgresql/User.repository';
import { User } from '../model/User.model';
import { UserBuilder } from '../model/builders/User.builder';
import { NotFoundException } from '../util/exceptions/http/NotFoundException';
import { ConflictException } from '../util/exceptions/http/ConflictException';
import { InvalidCredentialsException } from '../util/exceptions/http/AuthenticationException';
import {
  DuplicateItemException,
  ItemNotFoundException,
} from '../util/exceptions/repostiroyException';
import { hashPassword, verifyPassword } from '../util/password';
import { id } from '../repository/IRepository';

export class UserService {
  private readonly repo = new UserRepository();

  private async getRepo(): Promise<UserRepository> {
    await this.repo.init();
    return this.repo;
  }

  public async createUser(user: User): Promise<User> {
    const repo = await this.getRepo();
    const userToPersist = UserBuilder.newBuilder()
      .setId(user.getId())
      .setName(user.getName())
      .setEmail(user.getEmail())
      .setPassword(hashPassword(user.getPassword()))
      .setRole(user.getRole())
      .build();
    try {
      await repo.create(userToPersist);
    } catch (error) {
      if (error instanceof DuplicateItemException) {
        throw new ConflictException(error.message);
      }
      throw error;
    }
    return userToPersist;
  }

  public async getUser(id: string): Promise<User> {
    const repo = await this.getRepo();
    try {
      return await repo.get(id);
    } catch (error) {
      if (error instanceof ItemNotFoundException) {
        throw new NotFoundException(`User with id ${id} not found`);
      }
      throw error;
    }
  }

  public async getAllUsers(): Promise<User[]> {
    const repo = await this.getRepo();
    return repo.getAll();
  }

  public async updateUser(user: User): Promise<User> {
    const repo = await this.getRepo();
    const userToPersist = UserBuilder.newBuilder()
      .setId(user.getId())
      .setName(user.getName())
      .setEmail(user.getEmail())
      .setPassword(hashPassword(user.getPassword()))
      .setRole(user.getRole())
      .build();
    try {
      await repo.update(userToPersist);
    } catch (error) {
      if (error instanceof ItemNotFoundException) {
        throw new NotFoundException(`User with id ${user.getId()} not found`);
      }
      if (error instanceof DuplicateItemException) {
        throw new ConflictException(error.message);
      }
      throw error;
    }
    return userToPersist;
  }

  public async deleteUser(id: string): Promise<void> {
    const repo = await this.getRepo();
    try {
      await repo.delete(id);
    } catch (error) {
      if (error instanceof ItemNotFoundException) {
        throw new NotFoundException(`User with id ${id} not found`);
      }
      throw error;
    }
  }

  async validateUser(email: string, password: string): Promise<User> {
    const repo = await this.getRepo();
    let user: User;
    try {
      user = await repo.getByEmail(email);
    } catch (error) {
      if (error instanceof ItemNotFoundException) {
        throw new InvalidCredentialsException();
      }
      throw error;
    }
    if (!verifyPassword(password, user.getPassword())) {
      throw new InvalidCredentialsException();
    }
    return user;
  }
}
