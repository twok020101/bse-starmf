import type { BSEConfig } from '../client/client.types';

export const TEST_CONFIG: BSEConfig = {
  baseUrl: 'https://bsestarmfdemo.bseindia.com',
  environment: 'test',
  timeout: 30000,
  retries: 3,
};

export const PROD_CONFIG: BSEConfig = {
  baseUrl: 'https://bsestarmf.bseindia.com',
  environment: 'production',
  timeout: 30000,
  retries: 3,
};

export const API_ENDPOINTS = {
  test: {
    orderEntry: 'https://bsestarmfdemo.bseindia.com/MFOrderEntry/MFOrder.svc/Secure',
    clientMaster: 'https://bsestarmfdemo.bseindia.com/StarMFCommonAPI/ClientMaster/Registration',
    mandate: 'https://bsestarmfdemo.bseindia.com/StarMFCommonAPI/MandateRegistration',
    stp: 'https://bsestarmfdemo.bseindia.com/StarMFCommonAPI/STPRegistration',
    reports: 'https://bsestarmfdemo.bseindia.com/StarMFCommonAPI/Reports',
    payment: 'https://bsestarmfdemo.bseindia.com/StarMFCommonAPI/PaymentGateway',
  },
  production: {
    orderEntry: 'https://bsestarmf.bseindia.com/MFOrderEntry/MFOrder.svc/Secure',
    clientMaster: 'https://bsestarmf.bseindia.com/StarMFCommonAPI/ClientMaster/Registration',
    mandate: 'https://bsestarmf.bseindia.com/StarMFCommonAPI/MandateRegistration',
    stp: 'https://bsestarmf.bseindia.com/StarMFCommonAPI/STPRegistration',
    reports: 'https://bsestarmf.bseindia.com/StarMFCommonAPI/Reports',
    payment: 'https://bsestarmf.bseindia.com/StarMFCommonAPI/PaymentGateway',
  },
};

export const SESSION_EXPIRY = {
  MF_ORDER: 60 * 60 * 1000, // 1 hour
  COMMON_API: 5 * 60 * 1000, // 5 minutes
};
