import type { AxiosInstance } from 'axios';
import axios from 'axios';
import type { BSEConfig } from '../client/client.types';
import type {
  STPRegistrationRequest,
  STPCancellationRequest,
  STPResponse,
} from '../types/api.types';
import { API_ENDPOINTS } from '../config/environments';
import { BSEError } from '../errors/bse-error';
import { TransactionNoGenerator } from '../utils/transaction-no';

export class STPService {
  private config: BSEConfig;
  private _httpClient: AxiosInstance;
  private transNoGenerator: TransactionNoGenerator;

  constructor(config: BSEConfig) {
    this.config = config;
    const baseUrl = API_ENDPOINTS[this.config.environment].stp;
    this._httpClient = axios.create({
      baseURL: baseUrl,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    this.transNoGenerator = new TransactionNoGenerator(config.memberId);
  }

  async register(params: STPRegistrationRequest): Promise<STPResponse> {
    const transNo = this.transNoGenerator.generate();

    const payload = {
      TransCode: 'NEW',
      TransNo: transNo,
      UserID: this.config.userId,
      MemberId: this.config.memberId,
      ClientCode: params.clientCode,
      FromSchemeCd: params.fromSchemeCode,
      ToSchemeCd: params.toSchemeCode,
      STPType: params.stpType,
      Amount: params.amount?.toString() || '',
      Percentage: params.percent?.toString() || '',
      Frequency: params.frequency,
      StartDate: params.startDate,
      EndDate: params.endDate || '',
      NoofInstallments: params.noOfInstallments?.toString() || '',
      FolioNo: params.folioNumber || '',
      SubBrCode: params.subBrokerCode || '',
      EUIN: params.euin || '',
      EUINVal: params.euinDeclaration || 'N',
      Remarks: params.remarks || '',
    };

    try {
      const response = await this._httpClient.post('/STPRegistration', payload);
      return this.parseSTPResponse(response.data);
    } catch (error) {
      throw this.mapSTPError(error);
    }
  }

  async cancel(params: STPCancellationRequest): Promise<STPResponse> {
    const transNo = this.transNoGenerator.generate();

    const payload = {
      TransCode: 'CXL',
      TransNo: transNo,
      UserID: this.config.userId,
      MemberId: this.config.memberId,
      RegID: params.stpRegId.toString(),
      Remarks: params.remarks || '',
    };

    try {
      const response = await this._httpClient.post('/STPRegistration', payload);
      return this.parseSTPResponse(response.data);
    } catch (error) {
      throw this.mapSTPError(error);
    }
  }

  private parseSTPResponse(data: unknown): STPResponse {
    if (!data || typeof data !== 'object') {
      throw new BSEError('STP_ERROR', 'Invalid STP response');
    }

    const responseData = data as Record<string, unknown>;

    return {
      transCode: (responseData.transCode as string) || '',
      transNo: (responseData.transNo as string) || '',
      stpRegId: parseInt(
        (responseData.stpRegId as string) || (responseData.regId as string) || '0',
        10
      ),
      status: (responseData.status as string) || '',
      bseRemarks: (responseData.bseRemarks as string) || (responseData.remarks as string) || '',
    };
  }

  private mapSTPError(error: unknown): BSEError {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const message = error.response?.data?.message || error.message || 'STP request failed';

      return new BSEError(status >= 500 ? 'SERVER_ERROR' : 'STP_ERROR', message, {
        retryable: status >= 500,
        details: { statusCode: status },
      });
    }

    return new BSEError('STP_ERROR', 'Unknown STP error');
  }
}
