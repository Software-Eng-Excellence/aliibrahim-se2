import { Request } from 'express';

export enum DBMode {
  SQLITE,
  FILE,
  POSTGRES,
}

export interface TokenPayload {
  userId: string;
  iat: number; // Issued at timestamp
  exp: number; // Expiration timestamp
}
export interface AuthenticatedRequest extends Request {
  userId: string;
}
