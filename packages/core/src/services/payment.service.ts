import axios, { AxiosInstance } from 'axios';
import { BSEConfig } from '../client/client.types';
import {
  PaymentGatewayRequest,
  PaymentGatewayResponse,
  PaymentStatusRequest,
  PaymentStatusResponse,
} from '../types/api.types';
import { API_ENDPOINTS } from '../config/environments';
import { BSEError } from '../errors/bse-error';

export class PaymentService {
  private config: BSEConfig;
  private _httpClient: AxiosInstance;

  constructor(config: BSEConfig) {
    this.config = config;
    const baseUrl = API_ENDPOINTS[this.config.environment].payment;
    this._httpClient = axios.create({
      baseURL: baseUrl,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async generatePaymentUrl(params: PaymentGatewayRequest): Promise<PaymentGatewayResponse> {
    const transactionId = this.generateTransactionId();

    const payload = {
      OrderId: params.orderId,
      Amount: params.amount,
      ClientCode: params.clientCode,
      ReturnUrl: params.returnUrl,
      PaymentMode: params.paymentMode || 'NETBANKING',
      BankCode: params.bankCode || '',
      TransactionId: transactionId,
    };

    try {
      const response = await this._httpClient.post('/DirectPaymentGateway', payload);
      return this.parsePaymentResponse(response.data, transactionId);
    } catch (error) {
      throw this.mapPaymentError(error);
    }
  }

  async getPaymentStatus(params: PaymentStatusRequest): Promise<PaymentStatusResponse> {
    try {
      const response = await this._httpClient.get(`/PaymentStatus/${params.transactionId}`);
      return this.parsePaymentStatusResponse(response.data);
    } catch (error) {
      throw this.mapPaymentError(error);
    }
  }

  async initiateSinglePayment(params: PaymentGatewayRequest): Promise<PaymentGatewayResponse> {
    const transactionId = this.generateTransactionId();

    const payload = {
      OrderId: params.orderId,
      Amount: params.amount,
      ClientCode: params.clientCode,
      ReturnUrl: params.returnUrl,
      PaymentMode: params.paymentMode || 'NETBANKING',
      BankCode: params.bankCode || '',
      TransactionId: transactionId,
    };

    try {
      const response = await this._httpClient.post('/SinglePaymentAPI', payload);
      return this.parsePaymentResponse(response.data, transactionId);
    } catch (error) {
      throw this.mapPaymentError(error);
    }
  }

  private generateTransactionId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 10);
    return `PAY${timestamp}${random}`.toUpperCase();
  }

  private parsePaymentResponse(data: unknown, transactionId: string): PaymentGatewayResponse {
    if (!data || typeof data !== 'object') {
      throw new BSEError('PAYMENT_ERROR', 'Invalid payment gateway response');
    }

    const responseData = data as Record<string, unknown>;
    const paymentUrl =
      (responseData.paymentUrl as string) || (responseData.redirectUrl as string) || '';
    const bseTransactionId = (responseData.transactionId as string) || transactionId;

    if (!paymentUrl) {
      throw new BSEError('PAYMENT_ERROR', 'No payment URL returned');
    }

    return {
      paymentUrl,
      transactionId: bseTransactionId,
    };
  }

  private parsePaymentStatusResponse(data: unknown): PaymentStatusResponse {
    if (!data || typeof data !== 'object') {
      throw new BSEError('PAYMENT_ERROR', 'Invalid payment status response');
    }

    const responseData = data as Record<string, unknown>;

    return {
      transactionId: (responseData.transactionId as string) || '',
      status: this.mapPaymentStatus(responseData.status as string),
      amount: parseFloat((responseData.amount as string) || '0'),
      paymentDate: responseData.paymentDate as string,
      bseRemarks: (responseData.remarks as string) || (responseData.bseRemarks as string) || '',
    };
  }

  private mapPaymentStatus(status: string): 'Pending' | 'Success' | 'Failed' {
    const normalizedStatus = status?.toUpperCase();
    if (normalizedStatus === 'SUCCESS' || normalizedStatus === 'S') {
      return 'Success';
    }
    if (
      normalizedStatus === 'FAILED' ||
      normalizedStatus === 'F' ||
      normalizedStatus === 'FAILURE'
    ) {
      return 'Failed';
    }
    return 'Pending';
  }

  private mapPaymentError(error: unknown): BSEError {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const message = error.response?.data?.message || error.message || 'Payment request failed';

      return new BSEError(status >= 500 ? 'SERVER_ERROR' : 'PAYMENT_ERROR', message, {
        retryable: status >= 500,
        details: { statusCode: status },
      });
    }

    return new BSEError('PAYMENT_ERROR', 'Unknown payment error');
  }
}
