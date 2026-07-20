import {
  JsonUserMapper,
  PostgresUserMapper,
} from '../../src/mappers/User.mapper';

describe('JsonUserMapper', () => {
  it('maps a request body into a User, generating an id when absent', () => {
    const user = new JsonUserMapper().map({
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
      password: 'correct-horse-battery-staple',
    });

    expect(user.getId()).toBeTruthy();
    expect(user.getName()).toBe('Jane Doe');
    expect(user.getEmail()).toBe('jane.doe@example.com');
    expect(user.getPassword()).toBe('correct-horse-battery-staple');
  });

  it('never includes the password in the safe response', () => {
    const user = new JsonUserMapper().map({
      id: 'USR-1',
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
      password: 'correct-horse-battery-staple',
    });

    const response = new JsonUserMapper().toSafeResponse(user);

    expect(response).toEqual({
      id: 'USR-1',
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
    });
    expect(response).not.toHaveProperty('password');
  });

  it('throws for invalid request data', () => {
    expect(() =>
      new JsonUserMapper().map({ name: 'Jane Doe' } as any),
    ).toThrow();
  });
});

describe('PostgresUserMapper', () => {
  it('maps a postgres row into a User and back', () => {
    const row = {
      id: 'USR-1',
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
      password: 'hashed-password',
    };

    const mapper = new PostgresUserMapper();
    const user = mapper.map(row);

    expect(user.getId()).toBe('USR-1');
    expect(user.getName()).toBe('Jane Doe');
    expect(user.getEmail()).toBe('jane.doe@example.com');
    expect(user.getPassword()).toBe('hashed-password');
    expect(mapper.reverse(user)).toEqual(row);
  });
});
