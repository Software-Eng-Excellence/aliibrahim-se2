import jwt from 'jsonwebtoken';
import config from '../config';
import { TokenPayload, UserPayload } from '../config/types';
import {
  InvalidTokenException,
  TokenExpiredException,
} from '../util/exceptions/http/AuthenticationException';
import { ServiceException } from '../util/exceptions/ServiceException';
import logger from '../util/logger';
import { Response } from 'express';
import ms from 'ms';

export class AuthenticationService {
  constructor(
    private readonly jwtSecret = config.auth.secretKey,
    private tokenExpiry = config.auth.tokenExpiry,
    private refreshTokenExpiry = config.auth.refreshTokenExpiry,
  ) {}

  generateToken(payload: UserPayload): string {
    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.tokenExpiry,
    });
  }
  generateRefreshToken(payload: UserPayload): string {
    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.refreshTokenExpiry,
    });
  }

  verify(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as UserPayload;
      return decoded;
    } catch (error) {
      logger.error('Token verification failed', error);
      if (error instanceof jwt.TokenExpiredError) {
        throw new TokenExpiredException();
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new InvalidTokenException();
      }
      throw new ServiceException('An error occurred while verifying the token');
    }
  }
  refreshToken(refreshToken: string): string {
    const payload = this.verify(refreshToken);
    if (!payload) {
      throw new InvalidTokenException();
    }
    return this.generateToken({ userId: payload.userId, role: payload.role });
  }
  setTokenIntoCookie(res: Response, token: string): void {
    res.cookie('token', token, {
      httpOnly: true,
      secure: config.isProd,
      maxAge: ms(this.tokenExpiry),
    });
  }
  setRefreshTokenIntoCookie(res: Response, refreshToken: string): void {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.isProd,
      maxAge: ms(this.refreshTokenExpiry),
    });
  }
  clearTokens(res: Response): void {
    res.clearCookie('token');
    res.clearCookie('refreshToken');
  }
  persistAuthentication(res: Response, payload: UserPayload): void {
    const token = this.generateToken(payload);
    const refreshToken = this.generateRefreshToken(payload);
    this.setTokenIntoCookie(res, token);
    this.setRefreshTokenIntoCookie(res, refreshToken);
  }

  private static instance: AuthenticationService;

  public static getInstance(): AuthenticationService {
    if (!AuthenticationService.instance) {
      AuthenticationService.instance = new AuthenticationService();
    }
    return AuthenticationService.instance;
  }
}
