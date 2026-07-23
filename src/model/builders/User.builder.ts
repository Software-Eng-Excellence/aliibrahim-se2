import { id } from '../../repository/IRepository';
import { User } from '../User.model';
import { UserValidator } from '../validators/User.validator';

export class UserBuilder {
  private id?: id;
  private name!: string;
  private email!: string;
  private password!: string;
  private role!: string;
  public static newBuilder(): UserBuilder {
    return new UserBuilder();
  }

  setId(id: id): UserBuilder {
    this.id = id;
    return this;
  }

  setName(name: string): UserBuilder {
    this.name = name;
    return this;
  }

  setEmail(email: string): UserBuilder {
    this.email = email;
    return this;
  }

  setPassword(password: string): UserBuilder {
    this.password = password;
    return this;
  }
  setRole(role: string): UserBuilder {
    this.role = role;
    return this;
  }

  build(): User {
    const fields = {
      name: this.name,
      email: this.email,
      password: this.password,
      role: this.role || 'user',
    };
    UserValidator.validate(fields);
    const finalId = this.id || this.generateRandomAlphanumericId();
    return new User(
      finalId,
      fields.name,
      fields.email,
      fields.password,
      fields.role,
    );
  }

  private generateRandomAlphanumericId(): string {
    // Returns something like: "7X2A9B84" or "K8N3M2QX"
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  }
}
