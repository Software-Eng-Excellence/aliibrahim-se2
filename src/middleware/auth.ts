import { Request, Response, NextFunction } from 'express';
import { AuthenticationFailedException } from '../util/exceptions/http/AuthenticationException';
import { AuthenticationService } from '../services/Authentication.service';
import { AuthenticatedRequest } from '../config/types';

// TO DO add a singleton to handle the auth service instance across the app
const authService = AuthenticationService.getInstance();

export function authenticate(req: Request, res: Response, next: NextFunction) {
  // get token from header
  let token = req.cookies.token;
  const refreshToken = req.cookies.refreshToken;
  //  if no token throw auth error
  if (!token) {
    if (!refreshToken) {
      throw new AuthenticationFailedException();
    }
    const newToken = authService.refreshToken(refreshToken);
    authService.setTokenIntoCookie(res, newToken);
    token = newToken;
  }
  //verify token if not valid throw auth error
  const payload = authService.verify(token);

  (req as AuthenticatedRequest).user = payload;
  next();
}
