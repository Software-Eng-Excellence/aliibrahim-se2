export enum ROLE {
  admin = 'admin',
  user = 'user',
  guest = 'guest',
  manager = 'manager',
}
export enum Permission {
  READ_ORDER = 'READ_ORDER',
  WRITE_ORDER = 'WRITE_ORDER',
  UPDATE_ORDER = 'UPDATE_ORDER',
  DELETE_ORDER = 'DELETE_ORDER',
  READ_USER = 'READ_USER',
  WRITE_USER = 'WRITE_USER',
  UPDATE_USER = 'UPDATE_USER',
  DELETE_USER = 'DELETE_USER',
  AUTH_LOGIN = 'AUTH_LOGIN',
  AUTH_LOGOUT = 'AUTH_LOGOUT',
}

type RolePermission = {
  [key in ROLE]: Permission[];
};

export function toRole(value: string): ROLE {
  if (!Object.values(ROLE).includes(value as ROLE)) {
    throw new Error(`Invalid role: ${value}`);
  }
  return value as ROLE;
}

export const rolePermission: RolePermission = {
  [ROLE.admin]: [...Object.values(Permission)],
  [ROLE.user]: [
    Permission.WRITE_ORDER,
    Permission.UPDATE_ORDER,
    Permission.READ_USER,
    Permission.UPDATE_USER,
    Permission.DELETE_USER,
    Permission.AUTH_LOGOUT,
  ],
  [ROLE.guest]: [Permission.READ_ORDER, Permission.AUTH_LOGIN],
  [ROLE.manager]: [
    Permission.READ_ORDER,
    Permission.WRITE_ORDER,
    Permission.UPDATE_ORDER,
    Permission.DELETE_ORDER,
    Permission.READ_USER,
  ],
};
