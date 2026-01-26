import type { AxiosInstance } from 'axios';
import axios from 'axios';
import type { BSEConfig } from '../client/client.types';
import type {
  OrderStatusRequest,
  OrderStatusResponse,
  AllotmentStatementRequest,
  AllotmentStatementResponse,
  RedemptionStatementRequest,
  RedemptionStatementResponse,
} from '../types/api.types';
import { BSEError } from '../errors/bse-error';

export class ReportService {
  private config: BSEConfig;
  private httpClient: AxiosInstance;

  constructor(config: BSEConfig) {
    this.config = config;
    const baseUrl = config.baseUrl || this.getBaseUrl();
    this.httpClient = axios.create({
      baseURL: `${baseUrl}/StarMFCommonAPI/Reports`,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async getOrderStatus(params: OrderStatusRequest): Promise<OrderStatusResponse> {
    try {
      const response = await this.httpClient.get(`/order/${params.orderId}/status`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new BSEError('ORDER_STATUS_FAILED', error.message);
      }
      throw error;
    }
  }

  async getAllotmentStatement(
    params: AllotmentStatementRequest
  ): Promise<AllotmentStatementResponse> {
    try {
      const response = await this.httpClient.get(`/order/${params.orderId}/allotment`, {
        params: { clientCode: params.clientCode },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new BSEError('ALLOTMENT_FAILED', error.message);
      }
      throw error;
    }
  }

  async getRedemptionStatement(
    params: RedemptionStatementRequest
  ): Promise<RedemptionStatementResponse> {
    try {
      const response = await this.httpClient.get(`/order/${params.orderId}/redemption`, {
        params: { clientCode: params.clientCode },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new BSEError('REDEMPTION_FAILED', error.message);
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
