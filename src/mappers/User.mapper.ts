import { IMapper } from './IMapper';
import { User } from '../model/User.model';
import { UserBuilder } from '../model/builders/User.builder';

export interface PostgresUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
}

export class PostgresUserMapper implements IMapper<PostgresUser, User> {
  map(data: PostgresUser): User {
    return UserBuilder.newBuilder()
      .setId(data.id)
      .setName(data.name)
      .setEmail(data.email)
      .setPassword(data.password)
      .setRole(data.role)
      .build();
  }
  reverse(data: User): PostgresUser {
    return {
      id: data.getId(),
      name: data.getName(),
      email: data.getEmail(),
      password: data.getPassword(),
      role: data.getRole(),
    };
  }
}

export interface JsonRequestUser {
  id?: string;
  name: string;
  email: string;
  password: string;
}

export interface JsonUserResponse {
  id: string;
  name: string;
  email: string;
  role: string;
}

// Deliberately not an IMapper: reverse() must never round-trip the password
// back into a client response, so map() and the response transform are asymmetric.
export class JsonUserMapper {
  map(data: JsonRequestUser): User {
    return UserBuilder.newBuilder()
      .setId(data.id as string)
      .setName(data.name)
      .setEmail(data.email)
      .setPassword(data.password)
      .build();
  }
  toSafeResponse(data: User): JsonUserResponse {
    return {
      id: data.getId(),
      name: data.getName(),
      email: data.getEmail(),
      role: data.getRole(),
    };
  }
}
