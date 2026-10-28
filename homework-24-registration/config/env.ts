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

export const config: {
  baseURL: string;
  httpCredentials: { username: string; password: string };
} = {
  baseURL: requireEnv('BASE_URL'),
  httpCredentials: {
    username: requireEnv('HTTP_USERNAME'),
    password: requireEnv('HTTP_PASSWORD'),
  },
};
