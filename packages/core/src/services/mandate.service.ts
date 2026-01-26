import type { AxiosInstance } from 'axios';
import axios from 'axios';
import type { BSEConfig } from '../client/client.types';
import type {
  MandateRegistrationRequest,
  MandateRegistrationResponse,
  MandateStatusRequest,
  MandateStatusResponse,
  MandateShiftRequest,
  MandateShiftResponse,
} from '../types/api.types';
import { BSEError } from '../errors/bse-error';

/**
 * Service for handling Mandate registration and management.
 *
 * Mandates are auto-debit instructions that allow BSE to debit your
 * bank account for SIP payments. Mandates must be approved before use.
 *
 * @example
 * ```typescript
 * // Register a new mandate
 * const mandate = await client.mandates.register({
 *   clientCode: 'UCC001',
 *   bankAccountNo: '1234567890',
 *   ifscCode: 'HDFC0001234',
 *   mandateAmount: 50000,
 *   mandateType: 'PERIODIC',
 *   frequency: 'MONTHLY',
 *   startDate: '01/02/2026',
 *   endDate: '01/02/2028',
 * });
 *
 * // Check mandate status
 * const status = await client.mandates.getStatus({ mandateId: mandate.mandateId });
 * ```
 */
export class MandateService {
  private config: BSEConfig;
  private httpClient: AxiosInstance;

  /**
   * Creates a new MandateService instance.
   *
   * @param config - BSE configuration
   */
  constructor(config: BSEConfig) {
    this.config = config;
    const baseUrl = config.baseUrl || this.getBaseUrl();
    this.httpClient = axios.create({
      baseURL: `${baseUrl}/StarMFCommonAPI/MandateRegistration`,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Registers a new mandate for auto-debit.
   *
   * @param params - Mandate registration parameters
   * @param params.clientCode - Unique Client Code (UCC)
   * @param params.bankAccountNo - Bank account number
   * @param params.ifscCode - IFSC code of the bank branch
   * @param params.mandateAmount - Maximum mandate amount
   * @param params.mandateType - 'PERIODIC' or 'ONETIME'
   * @param params.frequency - 'MONTHLY', 'QUARTERLY', etc.
   * @param params.startDate - Start date in DD/MM/YYYY format
   * @param params.endDate - End date in DD/MM/YYYY format
   *
   * @returns {Promise<MandateRegistrationResponse>} Registration response with mandate ID
   *
   * @throws {BSEError} MANDATE_REG_FAILED - Registration failed
   */
  async register(params: MandateRegistrationRequest): Promise<MandateRegistrationResponse> {
    try {
      const response = await this.httpClient.post('', params);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new BSEError('MANDATE_REG_FAILED', error.message);
      }
      throw error;
    }
  }

  /**
   * Checks the status of a registered mandate.
   *
   * Mandate status flow: PENDING -> ACTIVE/REJECTED
   *
   * @param params - Mandate status request parameters
   * @param params.mandateId - The mandate ID to check
   *
   * @returns {Promise<MandateStatusResponse>} Status response
   *
   * @throws {BSEError} MANDATE_STATUS_FAILED - Status check failed
   */
  async getStatus(params: MandateStatusRequest): Promise<MandateStatusResponse> {
    try {
      const response = await this.httpClient.get(`/${params.mandateId}/status`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new BSEError('MANDATE_STATUS_FAILED', error.message);
      }
      throw error;
    }
  }

  /**
   * Shifts a mandate to a different bank account.
   *
   * @param params - Mandate shift parameters
   * @param params.mandateId - The mandate ID to shift
   * @param params.newBankAccountNo - New bank account number
   * @param params.newIfscCode - New IFSC code
   *
   * @returns {Promise<MandateShiftResponse>} Shift response
   *
   * @throws {BSEError} MANDATE_SHIFT_FAILED - Shift failed
   */
  async shift(params: MandateShiftRequest): Promise<MandateShiftResponse> {
    try {
      const response = await this.httpClient.post(`/${params.mandateId}/shift`, params);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new BSEError('MANDATE_SHIFT_FAILED', error.message);
      }
      throw error;
    }
  }

  private getBaseUrl(): string {
    return this.config.environment === 'production'
      ? 'https://bsestarmf.bseindia.com'
      : 'https://bsestarmfdemo.bseindia.com';
  }
}
