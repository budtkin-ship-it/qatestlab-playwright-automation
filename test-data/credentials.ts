import { requireEnv } from '../utils/env';

export interface Credentials {
  username: string;
  password: string;
}

export function getCredentials(): Credentials {
  return {
    username: requireEnv('ORANGEHRM_USERNAME'),
    password: requireEnv('ORANGEHRM_PASSWORD'),
  };
}
