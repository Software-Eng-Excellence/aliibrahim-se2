import { Request } from 'express';
import { ROLE } from './roles';
import { JwtPayload } from 'jsonwebtoken';

export enum DBMode {
  SQLITE,
  FILE,
  POSTGRES,
}

export interface UserPayload {
  userId: string;
  role: ROLE;
}

export interface TokenPayload extends UserPayload, JwtPayload {}

export interface AuthenticatedRequest extends Request {
  user: UserPayload;
}
