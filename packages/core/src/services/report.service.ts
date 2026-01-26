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

/**
 * Service for fetching reports and statements from BSE StAR MF.
 *
 * Provides access to order status, allotment statements, and redemption
 * statements for transaction verification and record keeping.
 *
 * @example
 * ```typescript
 * // Check order status
 * const status = await client.reports.getOrderStatus({ orderId: 123456 });
 *
 * // Get allotment statement
 * const allotment = await client.reports.getAllotmentStatement({
 *   orderId: 123456,
 *   clientCode: 'UCC001',
 * });
 * ```
 */
export class ReportService {
  private config: BSEConfig;
  private httpClient: AxiosInstance;

  /**
   * Creates a new ReportService instance.
   *
   * @param config - BSE configuration
   */
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

  /**
   * Gets the current status of an order.
   *
   * @param params - Order status request parameters
   * @param params.orderId - The order ID to check
   *
   * @returns {Promise<OrderStatusResponse>} Current order status
   *
   * @throws {BSEError} ORDER_STATUS_FAILED - Status check failed
   */
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

  /**
   * Gets the allotment statement for a purchase order.
   *
   * @param params - Allotment statement request parameters
   * @param params.orderId - The purchase order ID
   * @param params.clientCode - The client code
   *
   * @returns {Promise<AllotmentStatementResponse>} Allotment statement details
   *
   * @throws {BSEError} ALLOTMENT_FAILED - Failed to fetch allotment statement
   */
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

  /**
   * Gets the redemption statement for a redemption order.
   *
   * @param params - Redemption statement request parameters
   * @param params.orderId - The redemption order ID
   * @param params.clientCode - The client code
   *
   * @returns {Promise<RedemptionStatementResponse>} Redemption statement details
   *
   * @throws {BSEError} REDEMPTION_FAILED - Failed to fetch redemption statement
   */
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
