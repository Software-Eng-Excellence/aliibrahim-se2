import { UserController } from '../../src/controllers/user.controller';
import { UserService } from '../../src/services/user.service';
import { Request, Response } from 'express';
import { UserBuilder } from '../../src/model/builders/User.builder';
import { BadRequestException } from '../../src/util/exceptions/http/BadRequestException';

describe('UserController', () => {
  let controller: UserController;
  let mockService: jest.Mocked<UserService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  const buildUser = (id = 'USR-1') =>
    UserBuilder.newBuilder()
      .setId(id)
      .setName('Jane Doe')
      .setEmail('jane.doe@example.com')
      .setPassword('hashed-password')
      .build();

  beforeEach(() => {
    mockService = {
      createUser: jest.fn(),
      getUser: jest.fn(),
      getAllUsers: jest.fn(),
      updateUser: jest.fn(),
      deleteUser: jest.fn(),
    } as unknown as jest.Mocked<UserService>;

    controller = new UserController(mockService);

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };
    mockRequest = {};
  });

  it('creates a user and never leaks the password in the response', async () => {
    const created = buildUser();
    mockService.createUser.mockResolvedValue(created);
    mockRequest.body = {
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
      password: 'correct-horse-battery-staple',
    };

    await controller.createUser(
      mockRequest as Request,
      mockResponse as Response,
    );

    expect(mockService.createUser).toHaveBeenCalledTimes(1);
    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith({
      id: 'USR-1',
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
    });
  });

  it('gets a user by id', async () => {
    mockService.getUser.mockResolvedValue(buildUser());
    mockRequest.params = { id: 'USR-1' };

    await controller.getUser(
      mockRequest as Request<{ id: string }>,
      mockResponse as Response,
    );

    expect(mockService.getUser).toHaveBeenCalledWith('USR-1');
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      id: 'USR-1',
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
    });
  });

  it('throws BadRequestException when the id param is missing on getUser', async () => {
    mockRequest.params = { id: '' };

    await expect(
      controller.getUser(
        mockRequest as Request<{ id: string }>,
        mockResponse as Response,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('lists all users without leaking passwords', async () => {
    mockService.getAllUsers.mockResolvedValue([
      buildUser('USR-1'),
      buildUser('USR-2'),
    ]);

    await controller.getAllUsers(
      mockRequest as Request,
      mockResponse as Response,
    );

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith([
      { id: 'USR-1', name: 'Jane Doe', email: 'jane.doe@example.com' },
      { id: 'USR-2', name: 'Jane Doe', email: 'jane.doe@example.com' },
    ]);
  });

  it('updates a user when the body id matches the path id', async () => {
    const updated = buildUser();
    mockService.updateUser.mockResolvedValue(updated);
    mockRequest.params = { id: 'USR-1' };
    mockRequest.body = {
      id: 'USR-1',
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
      password: 'correct-horse-battery-staple',
    };

    await controller.updateUser(
      mockRequest as Request<{ id: string }>,
      mockResponse as Response,
    );

    expect(mockService.updateUser).toHaveBeenCalledTimes(1);
    expect(mockResponse.status).toHaveBeenCalledWith(200);
  });

  it('throws BadRequestException when the body id does not match the path id', async () => {
    mockRequest.params = { id: 'USR-1' };
    mockRequest.body = {
      id: 'USR-2',
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
      password: 'correct-horse-battery-staple',
    };

    await expect(
      controller.updateUser(
        mockRequest as Request<{ id: string }>,
        mockResponse as Response,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(mockService.updateUser).not.toHaveBeenCalled();
  });

  it('deletes a user by id', async () => {
    mockRequest.params = { id: 'USR-1' };

    await controller.deleteUser(
      mockRequest as Request<{ id: string }>,
      mockResponse as Response,
    );

    expect(mockService.deleteUser).toHaveBeenCalledWith('USR-1');
    expect(mockResponse.status).toHaveBeenCalledWith(204);
    expect(mockResponse.send).toHaveBeenCalled();
  });
});
