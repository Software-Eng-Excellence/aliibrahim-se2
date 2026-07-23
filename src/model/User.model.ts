import { ROLE } from '../config/roles';
import { id, ID } from '../repository/IRepository';

export class User implements ID {
  constructor(
    private id: id,
    private name: string,
    private email: string,
    private password: string,
    private role: ROLE,
  ) {}

  getId(): id {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getEmail(): string {
    return this.email;
  }

  getPassword(): string {
    return this.password;
  }
  getRole(): ROLE {
    return this.role;
  }
}
