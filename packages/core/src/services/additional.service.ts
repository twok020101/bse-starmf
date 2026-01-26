import type { AxiosInstance } from 'axios';
import axios from 'axios';
import type { BSEConfig } from '../client/client.types';
import { BSEError } from '../errors/bse-error';
import { TransactionNoGenerator } from '../utils/transaction-no';

/**
 * Request parameters for FATCA data upload.
 */
export interface FATCAUploadRequest {
  /** Unique Client Code (UCC) */
  clientCode: string;
  /** FATCA compliance details */
  fatcaDetails: {
    /** Tax status (e.g., Resident Individual, NRI, etc.) */
    taxStatus: string;
    /** Place of birth */
    birthplace: string;
    /** Nationality */
    nationality: string;
    /** Country of tax residence */
    countryOfTaxResidence: string;
    /** Tax identification number in resident country */
    taxIdentificationNo: string;
    /** Type of address (Residence/Business) */
    addressType: string;
    /** Proof type for address (optional) */
    addressProofType?: string;
    /** Expiry date for address proof (optional) */
    addressProofExpiryDate?: string;
    /** Source of wealth (optional) */
    sourceOfWealth?: string;
    /** Occupation type */
    occupationType: string;
    /** Political exposure status */
    politicalExposure: 'Y' | 'N';
    /** Politically related party status */
    politicallyRelatedParty: 'Y' | 'N';
    /** Relative in politically related party */
    relativePoliticalParty: 'Y' | 'N';
    /** US Person status (FATCA requirement) */
    usPerson: 'Y' | 'N';
    /** Gross annual income range */
    grossAnnualIncome: string;
    /** Net annual income (optional) */
    netAnnualIncome?: string;
    /** Anticipated turnover (optional) */
    anticipatedTurnover?: string;
    /** Associates information (optional) */
    associates?: string;
    /** Fractional holding details (optional) */
    fractionalHolding?: string;
    /** Blacklisted or rejected status (optional) */
    blacklistedOrRejected?: 'Y' | 'N';
    /** Sanction check status (optional) */
    sanctionCheck?: 'Y' | 'N';
  };
}

/**
 * Response from FATCA data upload.
 */
export interface FATCAResponse {
  /** Status of the upload */
  status: string;
  /** BSE remarks or error message */
  bseRemarks: string;
}

/**
 * Request parameters for CKYC data upload.
 */
export interface CKYCUploadRequest {
  /** Unique Client Code (UCC) */
  clientCode: string;
  /** CKYC details */
  ckycDetails: {
    /** Existing CKYC number (optional if providing Aadhar) */
    ckycNumber?: string;
    /** Aadhar number (optional if providing CKYC) */
    aadharNumber?: string;
    /** Name as per Aadhar */
    aadharName?: string;
    /** Date of birth as per Aadhar (DD/MM/YYYY) */
    aadharDOB?: string;
    /** Gender as per Aadhar */
    aadharGender?: 'M' | 'F' | 'O';
    /** Address as per Aadhar */
    aadharAddress?: string;
    /** Pincode as per Aadhar */
    aadharPincode?: string;
  };
}

/**
 * Response from CKYC data upload.
 */
export interface CKYCResponse {
  /** CKYC number assigned or verified */
  ckycNumber: string;
  /** Status of the upload */
  status: string;
  /** BSE remarks or error message */
  bseRemarks: string;
}

/**
 * Request parameters for SIP pause.
 */
export interface SIPPauseRequest {
  /** Unique Client Code (UCC) */
  clientCode: string;
  /** SIP registration ID to pause */
  sipRegId: number;
  /** Start date of pause period (DD/MM/YYYY) */
  pauseFromDate: string;
  /** End date of pause period (DD/MM/YYYY) */
  pauseToDate: string;
  /** Reason for pause (optional) */
  reason?: string;
}

/**
 * Response from SIP pause request.
 */
export interface SIPPauseResponse {
  /** Status of the pause request */
  status: string;
  /** Pause ID for tracking */
  pauseId: number;
  /** BSE remarks or error message */
  bseRemarks: string;
}

/**
 * Request parameters for XSIP to SIP shift.
 */
export interface XSIPToSIPShiftRequest {
  /** Unique Client Code (UCC) */
  clientCode: string;
  /** XSIP registration ID to shift */
  xsipRegId: number;
  /** Target scheme BSE Code */
  shiftToSchemeCode: string;
  /** Effective date of shift (DD/MM/YYYY) */
  effectiveDate: string;
}

/**
 * Response from XSIP to SIP shift request.
 */
export interface XSIPToSIPShiftResponse {
  /** Status of the shift request */
  status: string;
  /** New SIP registration ID */
  newSipRegId: number;
  /** BSE remarks or error message */
  bseRemarks: string;
}

/**
 * Service for handling additional BSE StAR MF services.
 *
 * Provides access to FATCA/KYC data upload, SIP pause/resume,
 * and XSIP to SIP migration capabilities.
 *
 * @example
 * ```typescript
 * // Upload FATCA details
 * await client.additional.uploadFATCA({
 *   clientCode: 'UCC001',
 *   fatcaDetails: { ... },
 * });
 *
 * // Pause an SIP
 * await client.additional.pauseSIP({
 *   clientCode: 'UCC001',
 *   sipRegId: 12345,
 *   pauseFromDate: '01/03/2026',
 *   pauseToDate: '31/05/2026',
 * });
 * ```
 */
export class AdditionalService {
  private config: BSEConfig;
  private _httpClient: AxiosInstance;
  private transNoGenerator: TransactionNoGenerator;

  /**
   * Creates a new AdditionalService instance.
   *
   * @param config - BSE configuration
   */
  constructor(config: BSEConfig) {
    this.config = config;
    const baseUrl = this.config.baseUrl ?? this.getBaseUrl();
    this._httpClient = axios.create({
      baseURL: `${baseUrl}/StarMFCommonAPI/AdditionalServices`,
      timeout: config.timeout ?? 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    this.transNoGenerator = new TransactionNoGenerator(config.memberId);
  }

  /**
   * Uploads FATCA (Foreign Account Tax Compliance Act) details for a client.
   *
   * @param params - FATCA upload request parameters
   * @param params.clientCode - Unique Client Code (UCC)
   * @param params.fatcaDetails - Complete FATCA compliance information
   *
   * @returns {Promise<FATCAResponse>} Upload response with status
   *
   * @throws {BSEError} ADDITIONAL_ERROR - FATCA upload failed
   */
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

  /**
   * Uploads or verifies CKYC (Central KYC) details for a client.
   *
   * @param params - CKYC upload request parameters
   * @param params.clientCode - Unique Client Code (UCC)
   * @param params.ckycDetails - CKYC information (either CKYC number or Aadhar details)
   *
   * @returns {Promise<CKYCResponse>} Response with CKYC number and status
   *
   * @throws {BSEError} ADDITIONAL_ERROR - CKYC upload failed
   */
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

  /**
   * Pauses an active SIP for a specified period.
   *
   * @param params - SIP pause request parameters
   * @param params.clientCode - Unique Client Code (UCC)
   * @param params.sipRegId - SIP registration ID to pause
   * @param params.pauseFromDate - Start date of pause (DD/MM/YYYY)
   * @param params.pauseToDate - End date of pause (DD/MM/YYYY)
   * @param params.reason - Reason for pause (optional)
   *
   * @returns {Promise<SIPPauseResponse>} Pause response with pause ID
   *
   * @throws {BSEError} ADDITIONAL_ERROR - SIP pause failed
   */
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
      Remarks: params.reason ?? '',
    };

    try {
      const response = await this._httpClient.post('/SIPPause', payload);
      return this.parseSIPPauseResponse(response.data);
    } catch (error) {
      throw this.mapAdditionalError(error);
    }
  }

  /**
   * Shifts an XSIP registration to a regular SIP with a different scheme.
   *
   * @param params - XSIP to SIP shift request parameters
   * @param params.clientCode - Unique Client Code (UCC)
   * @param params.xsipRegId - XSIP registration ID to shift
   * @param params.shiftToSchemeCode - Target scheme BSE Code for new SIP
   * @param params.effectiveDate - Effective date of shift (DD/MM/YYYY)
   *
   * @returns {Promise<XSIPToSIPShiftResponse>} Shift response with new SIP ID
   *
   * @throws {BSEError} ADDITIONAL_ERROR - XSIP shift failed
   */
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
      status: (responseData.status as string) ?? '',
      pauseId: parseInt((responseData.pauseId as string) ?? '0', 10),
      bseRemarks: (responseData.bseRemarks as string) ?? (responseData.remarks as string) ?? '',
    };
  }

  private parseXSIPShiftResponse(data: unknown): XSIPToSIPShiftResponse {
    if (!data || typeof data !== 'object') {
      throw new BSEError('ADDITIONAL_ERROR', 'Invalid XSIP shift response');
    }

    const responseData = data as Record<string, unknown>;

    return {
      status: (responseData.status as string) ?? '',
      newSipRegId: parseInt(
        (responseData.newSIPRegId as string) ?? (responseData.sipRegId as string) ?? '0',
        10
      ),
      bseRemarks: (responseData.bseRemarks as string) ?? (responseData.remarks as string) ?? '',
    };
  }

  private mapAdditionalError(error: unknown): BSEError {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? 500;
      const message =
        error.response?.data?.message ?? error.message ?? 'Additional service request failed';

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
