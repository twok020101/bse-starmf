import axios, { AxiosInstance } from 'axios';
import { BSEConfig } from '../client/client.types';
import {
  ClientRegistrationRequest,
  ClientRegistrationResponse,
  ClientModificationRequest,
} from '../types/api.types';
import { validateClientParams } from '../utils/validators';
import { BSEError } from '../errors/bse-error';

export class ClientService {
  private config: BSEConfig;
  private httpClient: AxiosInstance;

  constructor(config: BSEConfig) {
    this.config = config;
    const baseUrl = config.baseUrl || this.getBaseUrl();
    this.httpClient = axios.create({
      baseURL: `${baseUrl}/StarMFCommonAPI/ClientMaster/Registration`,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

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
