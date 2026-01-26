import { AxiosError } from 'axios';
import { BSEError, mapAxiosError } from '../../src/errors/bse-error';

describe('BSEError', () => {
  describe('constructor', () => {
    it('should create error with code and message', () => {
      const error = new BSEError('AUTH_001', 'Test error message');

      expect(error.code).toBe('AUTH_001');
      expect(error.message).toBe('Test error message');
      expect(error.name).toBe('BSEError');
    });

    it('should use default message when not provided', () => {
      const error = new BSEError('AUTH_001');

      expect(error.message).toBe('USER ID SHOULD NOT BE BLANK');
    });

    it('should mark retryable errors correctly', () => {
      const sessionError = new BSEError('AUTH_003', 'Session expired');
      const networkError = new BSEError('NET_001', 'Network error');

      expect(sessionError.retryable).toBe(true);
      expect(networkError.retryable).toBe(true);
    });

    it('should allow overriding retryable flag', () => {
      const error = new BSEError('AUTH_003', 'Session expired', { retryable: false });

      expect(error.retryable).toBe(false);
    });

    it('should store rawResponse if provided', () => {
      const rawSoap = '<soap:Fault>fault details</soap:Fault>';
      const error = new BSEError('AUTH_001', 'Error', { rawResponse: rawSoap });

      expect(error.rawResponse).toBe(rawSoap);
    });

    it('should store details if provided', () => {
      const details = { field: 'value' };
      const error = new BSEError('AUTH_001', 'Error', { details });

      expect(error.details).toEqual(details);
    });

    it('should handle unknown error codes', () => {
      const error = new BSEError('UNKNOWN_CODE', 'Custom error');

      expect(error.code).toBe('UNKNOWN');
      expect(error.message).toBe('Custom error');
    });
  });

  describe('known error codes', () => {
    it('should have correct messages for auth errors', () => {
      expect(new BSEError('AUTH_001').message).toBe('USER ID SHOULD NOT BE BLANK');
      expect(new BSEError('AUTH_010').message).toBe('USER NOT EXISTS');
      expect(new BSEError('AUTH_005').message).toBe('USER IS DISABLED. CONTACT ADMIN');
      expect(new BSEError('AUTH_008').message).toBe('THE MEMBER IS SUSPENDED. CONTACT ADMIN');
      expect(new BSEError('AUTH_009').message).toBe('PASSWORD EXPIRED');
    });

    it('should have correct messages for transaction errors', () => {
      expect(new BSEError('TXN_003').message).toBe('ORDER REJECTED');
      expect(new BSEError('TXN_004').message).toBe('INSUFFICIENT UNITS');
    });

    it('should have correct messages for network errors', () => {
      expect(new BSEError('NET_001').message).toBe('NETWORK ERROR');
      expect(new BSEError('NET_002').message).toBe('SERVER ERROR');
      expect(new BSEError('NET_003').message).toBe('REQUEST TIMEOUT');
    });
  });

  describe('retryable errors', () => {
    it('should mark session timeout as retryable', () => {
      expect(new BSEError('AUTH_003').retryable).toBe(true);
    });

    it('should mark network errors as retryable', () => {
      expect(new BSEError('NET_001').retryable).toBe(true);
      expect(new BSEError('NET_002').retryable).toBe(true);
      expect(new BSEError('NET_003').retryable).toBe(true);
    });

    it('should not mark auth errors as retryable', () => {
      expect(new BSEError('AUTH_001').retryable).toBe(false);
      expect(new BSEError('AUTH_005').retryable).toBe(false);
    });
  });
});

describe('mapAxiosError', () => {
  it('should create retryable error for network failures', async () => {
    const axiosError = new AxiosError('Network Error') as AxiosError<unknown>;
    const error = await mapAxiosError(axiosError);

    expect(error.code).toBe('NET_001');
    expect(error.retryable).toBe(true);
  });

  it('should map SOAP fault messages to error codes', async () => {
    const soapResponse = `
      <?xml version="1.0" encoding="utf-8"?>
      <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">
        <soap:Body>
          <soap:Fault>
            <faultstring>USER IS DISABLED. CONTACT ADMIN</faultstring>
          </soap:Fault>
        </soap:Body>
      </soap:Envelope>
    `;

    const axiosError = new AxiosError('Error') as AxiosError<unknown>;
    axiosError.response = {
      status: 500,
      data: soapResponse,
    } as AxiosError['response'];

    const error = await mapAxiosError(axiosError);

    expect(error.code).toBe('AUTH_005');
  });
});
