import axios, { AxiosInstance } from 'axios';
import { BSEConfig } from '../client/client.types';
import {
  MandateRegistrationRequest,
  MandateRegistrationResponse,
  MandateStatusRequest,
  MandateStatusResponse,
  MandateShiftRequest,
  MandateShiftResponse,
} from '../types/api.types';
import { BSEError } from '../errors/bse-error';

export class MandateService {
  private config: BSEConfig;
  private httpClient: AxiosInstance;

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
