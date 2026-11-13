import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '..', '.env'), quiet: true });

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing env variable: ${name}. Copy .env.example to .env and fill it in.`);
  }
  return value;
}

export const BASE_URL = process.env.BASE_URL || 'https://qauto.forstudy.space';

export const HTTP_CREDENTIALS = {
  username: requireEnv('HTTP_USERNAME'),
  password: requireEnv('HTTP_PASSWORD'),
};

/** Registered QAuto user. Read lazily so a missing value fails only the tests that need it. */
export function testUser(): { email: string; password: string } {
  return { email: requireEnv('USER_EMAIL'), password: requireEnv('USER_PASSWORD') };
}

/** Session saved by tests/setup/auth.setup.ts (git-ignored). */
export const STORAGE_STATE_PATH = path.resolve(__dirname, '..', 'playwright/.auth/user.json');
