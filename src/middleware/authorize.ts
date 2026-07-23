import { NextFunction, Request, Response } from 'express';
import { Permission, ROLE, rolePermission } from '../config/roles';
import { AuthenticationFailedException } from '../util/exceptions/http/AuthenticationException';
import { AuthenticatedRequest } from '../config/types';
import {
  InsufficientPermissionsException,
  InvalidRoleException,
} from '../util/exceptions/http/AuthorizationException';
import logger from '../util/logger';

export function hasPermission(permission: Permission) {
  return (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      throw new AuthenticationFailedException();
    }
    const userRole = authReq.user.role as ROLE;

    if (!rolePermission[userRole]) {
      logger.error(
        `User with role ${userRole} does not have any permissions defined`,
      );
      throw new InvalidRoleException(userRole);
    }
    const permissions = rolePermission[userRole];
    if (!permissions.includes(permission)) {
      logger.error(
        `User with role ${userRole} does not have permission ${permission}`,
      );
      throw new InsufficientPermissionsException();
    }
    next();
  };
}
export function hasRole(allowedroles: ROLE[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      throw new AuthenticationFailedException();
    }
    if (!allowedroles.includes(authReq.user.role)) {
      logger.error(
        `User with role ${authReq.user.role} does not have required role ${allowedroles.join(', ')}`,
      );
      throw new InsufficientPermissionsException();
    }
    next();
  };
}
