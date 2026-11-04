import type { RegistrationField } from '../pages/RegistrationForm';

export const RED_BORDER = 'rgb(220, 53, 69)';

export const ERRORS = {
  nameInvalid: 'Name is invalid',
  nameLength: 'Name has to be from 2 to 20 characters long',
  lastNameInvalid: 'Last name is invalid',
  lastNameLength: 'Last name has to be from 2 to 20 characters long',
  emailRequired: 'Email required',
  emailIncorrect: 'Email is incorrect',
  passwordRequired: 'Password required',
  password:
    'Password has to be from 8 to 15 characters long and contain at least one integer, one capital, and one small letter',
  repeatPasswordRequired: 'Re-enter password required',
  passwordsMismatch: 'Passwords do not match',
} as const;

export type FieldCase = { title: string; field: RegistrationField; value: string };
export type NegativeCase = FieldCase & { error: string };

export const BOUNDARY_CASES: FieldCase[] = [
  { title: 'Name with 2 chars', field: 'name', value: 'Jo' },
  { title: 'Name with 20 chars', field: 'name', value: 'A'.repeat(20) },
  { title: 'Last name with 2 chars', field: 'lastName', value: 'Li' },
  { title: 'Last name with 20 chars', field: 'lastName', value: 'B'.repeat(20) },
];

export const BOUNDARY_PASSWORDS = ['Qwerty12', 'Qwerty123456789'];

export const NEGATIVE_CASES: NegativeCase[] = [
  { title: 'Name: invalid (digits)', field: 'name', value: 'Ivan1', error: ERRORS.nameInvalid },
  { title: 'Name: invalid (non-English)', field: 'name', value: 'Іван', error: ERRORS.nameInvalid },
  { title: 'Name: too short', field: 'name', value: 'J', error: ERRORS.nameLength },
  { title: 'Name: too long', field: 'name', value: 'A'.repeat(21), error: ERRORS.nameLength },

  { title: 'Last name: invalid (digits)', field: 'lastName', value: 'Smith1', error: ERRORS.lastNameInvalid },
  { title: 'Last name: invalid (non-English)', field: 'lastName', value: 'Петров', error: ERRORS.lastNameInvalid },
  { title: 'Last name: too short', field: 'lastName', value: 'S', error: ERRORS.lastNameLength },
  { title: 'Last name: too long', field: 'lastName', value: 'B'.repeat(21), error: ERRORS.lastNameLength },

  { title: 'Email: empty', field: 'email', value: '', error: ERRORS.emailRequired },
  { title: 'Email: no @', field: 'email', value: 'aqa-test', error: ERRORS.emailIncorrect },
  { title: 'Email: no domain', field: 'email', value: 'aqa@', error: ERRORS.emailIncorrect },
  { title: 'Email: no TLD', field: 'email', value: 'aqa@test', error: ERRORS.emailIncorrect },

  { title: 'Password: empty', field: 'password', value: '', error: ERRORS.passwordRequired },
  { title: 'Password: 7 chars', field: 'password', value: 'Qwerty1', error: ERRORS.password },
  { title: 'Password: 16 chars', field: 'password', value: 'Qwerty1234567890', error: ERRORS.password },
  { title: 'Password: no digit', field: 'password', value: 'Qwertyui', error: ERRORS.password },
  { title: 'Password: no uppercase', field: 'password', value: 'qwerty12', error: ERRORS.password },
  { title: 'Password: no lowercase', field: 'password', value: 'QWERTY12', error: ERRORS.password },

  { title: 'Re-enter password: empty', field: 'repeatPassword', value: '', error: ERRORS.repeatPasswordRequired },
  { title: 'Re-enter password: mismatch', field: 'repeatPassword', value: 'Qwerty13', error: ERRORS.passwordsMismatch },
];

/** Known bug: the app's text differs from the requirement. */
export const EMPTY_NAME_CASES: { field: RegistrationField; specError: string; actualError: string }[] = [
  { field: 'name', specError: 'Name is required', actualError: 'Name required' },
  { field: 'lastName', specError: 'Last name is required', actualError: 'Last name required' },
];
