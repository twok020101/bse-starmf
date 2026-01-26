import { jest } from '@jest/globals';
import axios, { AxiosInstance, AxiosResponse } from 'axios';

export interface MockConfig {
  responseData: string;
  status?: number;
  statusText?: string;
}

export function createMockAxiosResponse(config: MockConfig): AxiosResponse {
  return {
    data: config.responseData,
    status: config.status || 200,
    statusText: config.statusText || 'OK',
    headers: {},
    config: {
      headers: new axios.AxiosHeaders(),
    } as axios.AxiosRequestConfig,
  };
}

let mockedAxiosInstance: AxiosInstance | null = null;
let createSpy: jest.SpiedInstance<typeof axios.create> | null = null;
let postSpy: jest.SpiedInstance<typeof axios.post> | null = null;

export function mockAxios(config: MockConfig): jest.SpiedInstance<typeof axios.post> {
  const mockResponse = createMockAxiosResponse(config);

  const mockInstance = {
    post: jest.fn().mockResolvedValue(mockResponse),
    get: jest.fn().mockResolvedValue(mockResponse),
    request: jest.fn().mockResolvedValue(mockResponse),
    interceptors: {
      request: {
        use: jest.fn((successFn, errorFn) => {
          if (successFn)
            successFn({
              headers: new axios.AxiosHeaders(),
              method: 'post',
              url: 'http://test.com',
              data: '',
            });
        }),
      },
      response: {
        use: jest.fn(),
      },
    },
    defaults: {
      headers: new axios.AxiosHeaders(),
    },
    getUri: jest.fn().mockReturnValue('http://test.com'),
  } as unknown as AxiosInstance;

  createSpy = jest.spyOn(axios, 'create').mockReturnValue(mockInstance);
  postSpy = jest.spyOn(axios, 'post').mockResolvedValue(mockResponse);

  return postSpy;
}

export function restoreAxios(): void {
  if (createSpy) {
    createSpy.mockRestore();
    createSpy = null;
  }
  if (postSpy) {
    postSpy.mockRestore();
    postSpy = null;
  }
  jest.restoreAllMocks();
}

export function createMockSessionManager() {
  return {
    createSession: jest.fn().mockResolvedValue({
      id: 'mock-session-id',
      userId: 'TESTUSER',
      memberId: 'TESTMEMBER',
      encryptedPassword: 'encrypted-password',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 3600000),
      isValid: true,
    }),
    getSession: jest.fn().mockResolvedValue({
      id: 'mock-session-id',
      userId: 'TESTUSER',
      memberId: 'TESTMEMBER',
      encryptedPassword: 'encrypted-password',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 3600000),
      isValid: true,
    }),
    refreshSession: jest.fn().mockResolvedValue({
      id: 'mock-session-id-refreshed',
      userId: 'TESTUSER',
      memberId: 'TESTMEMBER',
      encryptedPassword: 'encrypted-password-refreshed',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 3600000),
      isValid: true,
    }),
    clearSession: jest.fn(),
  };
}

export function createMockEncryptor() {
  return {
    encrypt: jest.fn().mockReturnValue('encrypted-password'),
    decrypt: jest.fn().mockReturnValue('plain-password'),
  };
}

export const TEST_CONFIG = {
  userId: 'TESTUSER',
  memberId: 'TESTMEMBER',
  password: 'testpassword',
  passkey: 'TESTPASSKEY',
  environment: 'test' as const,
  timeout: 30000,
  retries: 3,
  debug: false,
};
