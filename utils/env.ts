import { config } from 'dotenv';
import path from 'node:path';

// Resolve relative to the project so commands work from any working directory.
// Existing shell/CI variables take precedence over the local file.
config({ path: path.resolve(__dirname, '..', '.env'), quiet: true });

export function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value?.trim()) {
    throw new Error(`Set ${name} in the local .env file or environment before running login tests.`);
  }

  return value;
}
