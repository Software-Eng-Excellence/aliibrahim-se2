import { UserBuilder } from '../src/model/builders/User.builder';

describe('User Builder', () => {
  it('should build a user with all properties set, generating an id when none is given', () => {
    const user = UserBuilder.newBuilder()
      .setName('Jane Doe')
      .setEmail('jane.doe@example.com')
      .setPassword('correct-horse-battery-staple')
      .build();

    expect(user).toBeDefined();
    expect(user.getId()).toBeTruthy();
    expect(user.getName()).toBe('Jane Doe');
    expect(user.getEmail()).toBe('jane.doe@example.com');
    expect(user.getPassword()).toBe('correct-horse-battery-staple');
  });

  it('should use the provided id when one is set', () => {
    const user = UserBuilder.newBuilder()
      .setId('USR-1')
      .setName('Jane Doe')
      .setEmail('jane.doe@example.com')
      .setPassword('correct-horse-battery-staple')
      .build();

    expect(user.getId()).toBe('USR-1');
  });

  it('should throw if name is missing', () => {
    expect(() =>
      UserBuilder.newBuilder()
        .setEmail('jane.doe@example.com')
        .setPassword('correct-horse-battery-staple')
        .build(),
    ).toThrow('Missing required field: name');
  });

  it('should throw if email is empty', () => {
    expect(() =>
      UserBuilder.newBuilder()
        .setName('Jane Doe')
        .setEmail('')
        .setPassword('correct-horse-battery-staple')
        .build(),
    ).toThrow('Field must be a non-empty string: email');
  });

  it('should throw if email is not a valid email address', () => {
    expect(() =>
      UserBuilder.newBuilder()
        .setName('Jane Doe')
        .setEmail('not-an-email')
        .setPassword('correct-horse-battery-staple')
        .build(),
    ).toThrow('Field must be a valid email: email');
  });

  it('should throw if password is missing', () => {
    expect(() =>
      UserBuilder.newBuilder()
        .setName('Jane Doe')
        .setEmail('jane.doe@example.com')
        .build(),
    ).toThrow('Missing required field: password');
  });
});
