import type { BSEConfig } from '../client/client.types';

/**
 * Default configuration for BSE StAR MF Test environment.
 */
export const TEST_CONFIG: BSEConfig = {
  baseUrl: 'https://bsestarmfdemo.bseindia.com',
  environment: 'test',
  timeout: 30000,
  retries: 3,
};

/**
 * Default configuration for BSE StAR MF Production environment.
 */
export const PROD_CONFIG: BSEConfig = {
  baseUrl: 'https://bsestarmf.bseindia.com',
  environment: 'production',
  timeout: 30000,
  retries: 3,
};

/**
 * API endpoints for BSE StAR MF services.
 *
 * Organized by environment (test/production) and service type.
 */
export const API_ENDPOINTS = {
  test: {
    /** Order entry SOAP API endpoint */
    orderEntry: 'https://bsestarmfdemo.bseindia.com/MFOrderEntry/MFOrder.svc/Secure',
    /** Client master registration REST API endpoint */
    clientMaster: 'https://bsestarmfdemo.bseindia.com/StarMFCommonAPI/ClientMaster/Registration',
    /** Mandate registration REST API endpoint */
    mandate: 'https://bsestarmfdemo.bseindia.com/StarMFCommonAPI/MandateRegistration',
    /** STP registration REST API endpoint */
    stp: 'https://bsestarmfdemo.bseindia.com/StarMFCommonAPI/STPRegistration',
    /** Reports REST API endpoint */
    reports: 'https://bsestarmfdemo.bseindia.com/StarMFCommonAPI/Reports',
    /** Payment gateway REST API endpoint */
    payment: 'https://bsestarmfdemo.bseindia.com/StarMFCommonAPI/PaymentGateway',
  },
  production: {
    /** Order entry SOAP API endpoint */
    orderEntry: 'https://bsestarmf.bseindia.com/MFOrderEntry/MFOrder.svc/Secure',
    /** Client master registration REST API endpoint */
    clientMaster: 'https://bsestarmf.bseindia.com/StarMFCommonAPI/ClientMaster/Registration',
    /** Mandate registration REST API endpoint */
    mandate: 'https://bsestarmf.bseindia.com/StarMFCommonAPI/MandateRegistration',
    /** STP registration REST API endpoint */
    stp: 'https://bsestarmf.bseindia.com/StarMFCommonAPI/STPRegistration',
    /** Reports REST API endpoint */
    reports: 'https://bsestarmf.bseindia.com/StarMFCommonAPI/Reports',
    /** Payment gateway REST API endpoint */
    payment: 'https://bsestarmf.bseindia.com/StarMFCommonAPI/PaymentGateway',
  },
};

/**
 * Session expiry times in milliseconds.
 */
export const SESSION_EXPIRY = {
  /** MF Order API session expiry (1 hour) */
  MF_ORDER: 60 * 60 * 1000,
  /** Common API session expiry (5 minutes) */
  COMMON_API: 5 * 60 * 1000,
};
