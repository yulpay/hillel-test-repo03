export type User = {
  name: string;
  lastName: string;
  email: string;
  password: string;
  repeatPassword: string;
};

/** Every user created by auto-tests must have an email starting with this prefix. */
export const EMAIL_PREFIX = 'aqa-';

export const VALID_PASSWORD = 'Qwerty12';

export const uniqueEmail = (): string =>
  `${EMAIL_PREFIX}${Date.now()}-${Math.floor(Math.random() * 1e6)}@test.com`;

/** A valid user with a unique email. Pass overrides to break one field. */
export const validUser = (overrides: Partial<User> = {}): User => ({
  name: 'John',
  lastName: 'Smith',
  email: uniqueEmail(),
  password: VALID_PASSWORD,
  repeatPassword: VALID_PASSWORD,
  ...overrides,
});
