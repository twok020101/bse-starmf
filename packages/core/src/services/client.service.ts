import type { AxiosInstance } from 'axios';
import axios from 'axios';
import type { BSEConfig } from '../client/client.types';
import type {
  ClientRegistrationRequest,
  ClientRegistrationResponse,
  ClientModificationRequest,
} from '../types/api.types';
import { validateClientParams } from '../utils/validators';
import { BSEError } from '../errors/bse-error';

/**
 * Service for handling client (UCC) registration and modification.
 *
 * Provides methods to register new clients and modify existing client
 * details in BSE StAR MF system.
 *
 * @example
 * ```typescript
 * // Register a new client
 * const client = await client.clients.register({
 *   firstName: 'John',
 *   lastName: 'Doe',
 *   pan: 'ABCDE1234F',
 *   dateOfBirth: '15/01/1990',
 *   mobile: '9876543210',
 *   email: 'john@example.com',
 *   address1: '123 Main St',
 *   city: 'Mumbai',
 *   pinCode: '400001',
 *   state: 'Maharashtra',
 *   country: 'India',
 *   taxStatus: 'Resident Individual',
 *   accountType: 'Individual',
 *   clientHolding: 'Single',
 *   dividendPayMode: 'NEFT',
 *   bankName: 'HDFC Bank',
 *   bankBranch: 'Main Branch',
 *   bankAccountNo: '1234567890',
 *   bankAccountType: 'Savings',
 *   ifscCode: 'HDFC0001234',
 * });
 *
 * // Modify client details
 * await client.clients.modify({
 *   clientCode: client.ucc,
 *   email: 'newemail@example.com',
 * });
 * ```
 */
export class ClientService {
  private config: BSEConfig;
  private httpClient: AxiosInstance;

  /**
   * Creates a new ClientService instance.
   *
   * @param config - BSE configuration
   */
  constructor(config: BSEConfig) {
    this.config = config;
    const baseUrl = config.baseUrl ?? this.getBaseUrl();
    this.httpClient = axios.create({
      baseURL: `${baseUrl}/StarMFCommonAPI/ClientMaster/Registration`,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Registers a new client (UCC) with BSE StAR MF.
   *
   * @param params - Client registration parameters
   * @param params.firstName - Client's first name
   * @param params.middleName - Middle name (optional)
   * @param params.lastName - Last name
   * @param params.dateOfBirth - Date of birth (DD/MM/YYYY format)
   * @param params.pan - PAN number (mandatory)
   * @param params.gender - Gender ('M', 'F', 'O')
   * @param params.mobile - Mobile number (10 digits)
   * @param params.email - Email address
   * @param params.address1 - Address line 1
   * @param params.address2 - Address line 2 (optional)
   * @param params.address3 - Address line 3 (optional)
   * @param params.city - City
   * @param params.pinCode - PIN code
   * @param params.state - State
   * @param params.country - Country
   * @param params.taxStatus - Tax status
   * @param params.accountType - Account type
   * @param params.clientHolding - Client holding type
   * @param params.dividendPayMode - Dividend payment mode
   * @param params.bankName - Bank name
   * @param params.bankBranch - Bank branch name
   * @param params.bankAccountNo - Bank account number
   * @param params.bankAccountType - Bank account type (Savings/Current)
   * @param params.ifscCode - IFSC code
   *
   * @returns {Promise<ClientRegistrationResponse>} Registration response with UCC
   *
   * @throws {BSEError} CLIENT_REG_FAILED - Registration failed
   */
  async register(params: ClientRegistrationRequest): Promise<ClientRegistrationResponse> {
    validateClientParams({
      firstName: params.firstName,
      pan: params.pan,
      mobile: params.mobile,
      email: params.email,
      address1: params.address1,
      city: params.city,
      pinCode: params.pinCode,
      bankAccountNo: params.bankAccountNo,
      ifscCode: params.ifscCode,
    });

    try {
      const response = await this.httpClient.post('', params);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new BSEError('CLIENT_REG_FAILED', error.message);
      }
      throw error;
    }
  }

  /**
   * Modifies existing client details in BSE StAR MF.
   *
   * @param params - Client modification parameters
   * @param params.clientCode - UCC of the client to modify
   * @param params.email - New email address (example field)
   *
   * @returns {Promise<ClientRegistrationResponse>} Modification response
   *
   * @throws {BSEError} CLIENT_MOD_FAILED - Modification failed
   */
  async modify(params: ClientModificationRequest): Promise<ClientRegistrationResponse> {
    try {
      const response = await this.httpClient.put('', params);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new BSEError('CLIENT_MOD_FAILED', error.message);
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
