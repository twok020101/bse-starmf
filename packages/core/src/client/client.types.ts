import { Environment } from '../types/common.types';

export interface BSEConfig {
  userId: string;
  memberId: string;
  password: string;
  passkey?: string;
  environment: Environment;
  baseUrl?: string;
  timeout?: number;
  retries?: number;
  debug?: boolean;
}

export interface BSEClientOptions extends BSEConfig {
  sessionManagerOptions?: SessionManagerOptions;
  encryptorOptions?: EncryptorOptions;
}

export interface SessionManagerOptions {
  defaultExpiry?: number;
  autoRefresh?: boolean;
  refreshThreshold?: number;
}

export interface EncryptorOptions {
  algorithm?: 'AES';
  mode?: 'ECB' | 'CBC';
  padding?: 'Pkcs7';
}
