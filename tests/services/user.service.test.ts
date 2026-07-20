import { UserService } from '../../src/services/user.service';
import { UserRepository } from '../../src/repository/postgresql/User.repository';
import { UserBuilder } from '../../src/model/builders/User.builder';
import { NotFoundException } from '../../src/util/exceptions/http/NotFoundException';
import { ConflictException } from '../../src/util/exceptions/http/ConflictException';
import {
  DuplicateItemException,
  ItemNotFoundException,
} from '../../src/util/exceptions/repostiroyException';

jest.mock('../../src/repository/postgresql/User.repository');

describe('UserService', () => {
  let service: UserService;
  let mockRepo: jest.Mocked<UserRepository>;

  const buildUser = (overrides?: Partial<{ id: string; password: string }>) =>
    UserBuilder.newBuilder()
      .setId(overrides?.id ?? 'USR-1')
      .setName('Jane Doe')
      .setEmail('jane.doe@example.com')
      .setPassword(overrides?.password ?? 'correct-horse-battery-staple')
      .build();

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UserService();
    mockRepo = (UserRepository as jest.Mock).mock
      .instances[0] as jest.Mocked<UserRepository>;
    mockRepo.init.mockResolvedValue(undefined);
  });

  it('hashes the password before persisting a new user', async () => {
    mockRepo.create.mockResolvedValue('USR-1');

    const created = await service.createUser(buildUser());

    expect(mockRepo.init).toHaveBeenCalled();
    expect(mockRepo.create).toHaveBeenCalledTimes(1);
    const persisted = mockRepo.create.mock.calls[0][0];
    expect(persisted.getPassword()).not.toBe('correct-horse-battery-staple');
    expect(created.getPassword()).toBe(persisted.getPassword());
  });

  it('translates a duplicate email into a ConflictException on create', async () => {
    mockRepo.create.mockRejectedValue(
      new DuplicateItemException('User with email x already exists'),
    );

    await expect(service.createUser(buildUser())).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('returns the user for a known id', async () => {
    const user = buildUser();
    mockRepo.get.mockResolvedValue(user);

    await expect(service.getUser('USR-1')).resolves.toBe(user);
  });

  it('translates a missing user into a NotFoundException on get', async () => {
    mockRepo.get.mockRejectedValue(new ItemNotFoundException('not found'));

    await expect(service.getUser('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('returns all users', async () => {
    const users = [buildUser({ id: 'USR-1' }), buildUser({ id: 'USR-2' })];
    mockRepo.getAll.mockResolvedValue(users);

    await expect(service.getAllUsers()).resolves.toBe(users);
  });

  it('hashes the password before persisting an update', async () => {
    mockRepo.update.mockResolvedValue(undefined);

    const updated = await service.updateUser(buildUser());

    const persisted = mockRepo.update.mock.calls[0][0];
    expect(persisted.getPassword()).not.toBe('correct-horse-battery-staple');
    expect(updated.getPassword()).toBe(persisted.getPassword());
  });

  it('translates a missing user into a NotFoundException on update', async () => {
    mockRepo.update.mockRejectedValue(new ItemNotFoundException('not found'));

    await expect(service.updateUser(buildUser())).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('translates a duplicate email into a ConflictException on update', async () => {
    mockRepo.update.mockRejectedValue(
      new DuplicateItemException('User with email x already exists'),
    );

    await expect(service.updateUser(buildUser())).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('deletes a user by id', async () => {
    mockRepo.delete.mockResolvedValue(undefined);

    await service.deleteUser('USR-1');

    expect(mockRepo.delete).toHaveBeenCalledWith('USR-1');
  });

  it('translates a missing user into a NotFoundException on delete', async () => {
    mockRepo.delete.mockRejectedValue(new ItemNotFoundException('not found'));

    await expect(service.deleteUser('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
