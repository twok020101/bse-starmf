import axios, { AxiosInstance } from 'axios';
import { BSEConfig } from '../client/client.types';
import { BSEError } from '../errors/bse-error';
import { TransactionNoGenerator } from '../utils/transaction-no';

export interface FATCAUploadRequest {
  clientCode: string;
  fatcaDetails: {
    taxStatus: string;
    birthplace: string;
    nationality: string;
    countryOfTaxResidence: string;
    taxIdentificationNo: string;
    addressType: string;
    addressProofType?: string;
    addressProofExpiryDate?: string;
    sourceOfWealth?: string;
    occupationType: string;
    politicalExposure: 'Y' | 'N';
    politicallyRelatedParty: 'Y' | 'N';
    relativePoliticalParty: 'Y' | 'N';
    usPerson: 'Y' | 'N';
    grossAnnualIncome: string;
    netAnnualIncome?: string;
    anticipatedTurnover?: string;
    associates?: string;
    fractionalHolding?: string;
    blacklistedOrRejected?: 'Y' | 'N';
    sanctionCheck?: 'Y' | 'N';
  };
}

export interface FATCAResponse {
  status: string;
  bseRemarks: string;
}

export interface CKYCUploadRequest {
  clientCode: string;
  ckycDetails: {
    ckycNumber?: string;
    aadharNumber?: string;
    aadharName?: string;
    aadharDOB?: string;
    aadharGender?: 'M' | 'F' | 'O';
    aadharAddress?: string;
    aadharPincode?: string;
  };
}

export interface CKYCResponse {
  ckycNumber: string;
  status: string;
  bseRemarks: string;
}

export interface SIPPauseRequest {
  clientCode: string;
  sipRegId: number;
  pauseFromDate: string;
  pauseToDate: string;
  reason?: string;
}

export interface SIPPauseResponse {
  status: string;
  pauseId: number;
  bseRemarks: string;
}

export interface XSIPToSIPShiftRequest {
  clientCode: string;
  xsipRegId: number;
  shiftToSchemeCode: string;
  effectiveDate: string;
}

export interface XSIPToSIPShiftResponse {
  status: string;
  newSipRegId: number;
  bseRemarks: string;
}

export class AdditionalService {
  private config: BSEConfig;
  private _httpClient: AxiosInstance;
  private transNoGenerator: TransactionNoGenerator;

  constructor(config: BSEConfig) {
    this.config = config;
    const baseUrl = this.config.baseUrl || this.getBaseUrl();
    this._httpClient = axios.create({
      baseURL: `${baseUrl}/StarMFCommonAPI/AdditionalServices`,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    this.transNoGenerator = new TransactionNoGenerator(config.memberId);
  }

  async uploadFATCA(params: FATCAUploadRequest): Promise<FATCAResponse> {
    const transNo = this.transNoGenerator.generate();

    const payload = {
      TransCode: 'NEW',
      TransNo: transNo,
      UserID: this.config.userId,
      MemberId: this.config.memberId,
      ClientCode: params.clientCode,
      ...params.fatcaDetails,
    };

    try {
      const response = await this._httpClient.post('/FATCAUpload', payload);
      return this.parseAdditionalResponse(response.data);
    } catch (error) {
      throw this.mapAdditionalError(error);
    }
  }

  async uploadCKYC(params: CKYCUploadRequest): Promise<CKYCResponse> {
    const transNo = this.transNoGenerator.generate();

    const payload = {
      TransCode: 'NEW',
      TransNo: transNo,
      UserID: this.config.userId,
      MemberId: this.config.memberId,
      ClientCode: params.clientCode,
      ...params.ckycDetails,
    };

    try {
      const response = await this._httpClient.post('/CKYCUpload', payload);
      return this.parseCKYCResponse(response.data);
    } catch (error) {
      throw this.mapAdditionalError(error);
    }
  }

  async pauseSIP(params: SIPPauseRequest): Promise<SIPPauseResponse> {
    const transNo = this.transNoGenerator.generate();

    const payload = {
      TransCode: 'NEW',
      TransNo: transNo,
      UserID: this.config.userId,
      MemberId: this.config.memberId,
      ClientCode: params.clientCode,
      SIPRegID: params.sipRegId.toString(),
      FromDate: params.pauseFromDate,
      ToDate: params.pauseToDate,
      Remarks: params.reason || '',
    };

    try {
      const response = await this._httpClient.post('/SIPPause', payload);
      return this.parseSIPPauseResponse(response.data);
    } catch (error) {
      throw this.mapAdditionalError(error);
    }
  }

  async xsipToSIPShift(params: XSIPToSIPShiftRequest): Promise<XSIPToSIPShiftResponse> {
    const transNo = this.transNoGenerator.generate();

    const payload = {
      TransCode: 'NEW',
      TransNo: transNo,
      UserID: this.config.userId,
      MemberId: this.config.memberId,
      ClientCode: params.clientCode,
      XSIPRegID: params.xsipRegId.toString(),
      SchemeCd: params.shiftToSchemeCode,
      EffectiveDate: params.effectiveDate,
    };

    try {
      const response = await this._httpClient.post('/XSIPToSIPShift', payload);
      return this.parseXSIPShiftResponse(response.data);
    } catch (error) {
      throw this.mapAdditionalError(error);
    }
  }

  private parseAdditionalResponse(data: unknown): FATCAResponse {
    if (!data || typeof data !== 'object') {
      throw new BSEError('ADDITIONAL_ERROR', 'Invalid FATCA response');
    }

    const responseData = data as Record<string, unknown>;

    return {
      status: (responseData.status as string) || '',
      bseRemarks: (responseData.bseRemarks as string) || (responseData.remarks as string) || '',
    };
  }

  private parseCKYCResponse(data: unknown): CKYCResponse {
    if (!data || typeof data !== 'object') {
      throw new BSEError('ADDITIONAL_ERROR', 'Invalid CKYC response');
    }

    const responseData = data as Record<string, unknown>;

    return {
      ckycNumber: (responseData.ckycNumber as string) || (responseData.ckycNo as string) || '',
      status: (responseData.status as string) || '',
      bseRemarks: (responseData.bseRemarks as string) || (responseData.remarks as string) || '',
    };
  }

  private parseSIPPauseResponse(data: unknown): SIPPauseResponse {
    if (!data || typeof data !== 'object') {
      throw new BSEError('ADDITIONAL_ERROR', 'Invalid SIP pause response');
    }

    const responseData = data as Record<string, unknown>;

    return {
      status: (responseData.status as string) || '',
      pauseId: parseInt((responseData.pauseId as string) || '0', 10),
      bseRemarks: (responseData.bseRemarks as string) || (responseData.remarks as string) || '',
    };
  }

  private parseXSIPShiftResponse(data: unknown): XSIPToSIPShiftResponse {
    if (!data || typeof data !== 'object') {
      throw new BSEError('ADDITIONAL_ERROR', 'Invalid XSIP shift response');
    }

    const responseData = data as Record<string, unknown>;

    return {
      status: (responseData.status as string) || '',
      newSipRegId: parseInt(
        (responseData.newSIPRegId as string) || (responseData.sipRegId as string) || '0',
        10
      ),
      bseRemarks: (responseData.bseRemarks as string) || (responseData.remarks as string) || '',
    };
  }

  private mapAdditionalError(error: unknown): BSEError {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const message =
        error.response?.data?.message || error.message || 'Additional service request failed';

      return new BSEError(status >= 500 ? 'SERVER_ERROR' : 'ADDITIONAL_ERROR', message, {
        retryable: status >= 500,
        details: { statusCode: status },
      });
    }

    return new BSEError('ADDITIONAL_ERROR', 'Unknown additional service error');
  }

  private getBaseUrl(): string {
    return this.config.environment === 'production'
      ? 'https://bsestarmf.bseindia.com'
      : 'https://bsestarmfdemo.bseindia.com';
  }
}
