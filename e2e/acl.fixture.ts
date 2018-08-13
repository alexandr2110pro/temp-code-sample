import { FixtureDefinition } from '../../testing/e2e-utils';

export const USER_PASSWORD = 'UserPassword123$';
export const USERS_FIXTURE: FixtureDefinition[] = [
  {
    email: 'userA@mail.com',
    password: USER_PASSWORD,
    confirmPassword: USER_PASSWORD,
  },
  {
    email: 'userB@mail.com',
    password: USER_PASSWORD,
    confirmPassword: USER_PASSWORD,
  },
  {
    email: 'userC@mail.com',
    password: USER_PASSWORD,
    confirmPassword: USER_PASSWORD,
  },
];

export const ROLES_FIXTURE: FixtureDefinition[] = [
  {
    roleName: 'ADMIN',
  },
  {
    roleName: 'MANAGER',
  },
  {
    roleName: 'CUSTOMER',
  },
];
