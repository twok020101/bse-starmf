import { BaseService } from './base.service';
import type { BSEConfig } from '../client/client.types';
import type { SessionManager } from '../auth/session-manager';
import type { PasswordEncryptor } from '../encryption/password-encryptor';
import type { SIPRequest, SIPResponse } from '../types/api.types';
import { validateSIPParams } from '../utils/validators';
import { TransactionNoGenerator } from '../utils/transaction-no';

/**
 * Service for handling SIP (Systematic Investment Plan) operations.
 *
 * Provides methods for registering new SIPs and canceling existing ones.
 *
 * @example
 * ```typescript
 * // Register SIP
 * const sip = await client.sip.register({
 *   clientCode: 'UCC001',
 *   schemeCode: '119603',
 *   amount: 1000,
 *   frequency: 'MONTHLY',
 *   startDate: '15/01/2026',
 *   noOfInstallments: 24,
 * });
 *
 * // Cancel SIP
 * await client.sip.cancel(sip.sipRegId);
 * ```
 */
export class SIPService extends BaseService {
  private transNoGenerator: TransactionNoGenerator;

  /**
   * Creates a new SIPService instance.
   *
   * @param config - BSE configuration
   * @param sessionManager - Session manager for authentication
   * @param encryptor - Password encryptor
   */
  constructor(config: BSEConfig, sessionManager: SessionManager, encryptor: PasswordEncryptor) {
    super(config, sessionManager, encryptor, '/MFOrderEntry/MFOrder.svc/Secure');
    this.transNoGenerator = new TransactionNoGenerator(config.memberId);
  }

  /**
   * Registers a new SIP for a mutual fund scheme.
   *
   * @param params - SIP registration parameters
   * @param params.clientCode - Unique Client Code (UCC)
   * @param params.schemeCode - BSE Scheme Code
   * @param params.amount - SIP installment amount in INR
   * @param params.frequency - SIP frequency: 'MONTHLY', 'QUARTERLY', or 'WEEKLY'
   * @param params.startDate - First installment date in DD/MM/YYYY format
   * @param params.noOfInstallments - Number of installments (use 999 for perpetual)
   * @param params.folioNumber - Existing folio number (optional)
   * @param params.firstOrderToday - 'Y' to execute first order immediately
   * @param params.subBrokerCode - Sub-broker code (ARN)
   * @param params.euin - EUIN for advisory
   * @param params.euinDeclaration - 'Y' if EUIN declared
   * @param params.dpTransaction - Demat transaction type
   * @param params.mandateId - Mandate ID for auto-debit
   * @param params.endDate - End date in DD/MM/YYYY (required for daily SIP)
   * @param params.remarks - Optional remarks
   *
   * @returns {Promise<SIPResponse>} SIP registration response with SIP ID
   *
   * @throws {BSEError} TXN_002 - Invalid scheme code
   * @throws {BSEError} AUTH_001 - Invalid client code
   */
  async register(params: SIPRequest): Promise<SIPResponse> {
    validateSIPParams({
      startDate: params.startDate,
      endDate: params.endDate,
      frequency: params.frequency,
      noOfInstallments: params.noOfInstallments,
      amount: params.amount,
    });

    const transNo = this.transNoGenerator.generate();

    return this.executeRequest<SIPResponse>('sipOrderEntryParam', {
      TransCode: 'NEW',
      TransNo: transNo,
      RegID: '',
      ClientCode: params.clientCode,
      SchemeCd: params.schemeCode,
      Frequency: params.frequency,
      StartDate: params.startDate,
      EndDate: params.endDate || '',
      Day: '',
      FreqDesc: '',
      NoofInstallments: params.noOfInstallments,
      InstallmentAmt: params.amount,
      FirstOrderDate: '',
      OrderId: '',
      FolioNo: params.folioNumber || '',
      SubBrCode: params.subBrokerCode || '',
      EUIN: params.euin || '',
      EUINVal: params.euinDeclaration || 'N',
      DPTxn: params.dpTransaction || 'P',
      Remarks: params.remarks || '',
      MandateID: params.mandateId || '',
      Param1: '',
      Param2: params.endDate || '',
    });
  }

  /**
   * Cancels an existing SIP registration.
   *
   * @param sipRegId - The SIP registration ID to cancel
   *
   * @returns {Promise<SIPResponse>} Cancellation response
   *
   * @throws {BSEError} TXN_003 - Cancellation failed (SIP may not exist)
   */
  async cancel(sipRegId: number): Promise<SIPResponse> {
    const transNo = this.transNoGenerator.generate();

    return this.executeRequest<SIPResponse>('sipOrderEntryParam', {
      TransCode: 'CXL',
      TransNo: transNo,
      RegID: sipRegId.toString(),
      ClientCode: '',
      SchemeCd: '',
      Frequency: '',
      StartDate: '',
      EndDate: '',
      Day: '',
      FreqDesc: '',
      NoofInstallments: 0,
      InstallmentAmt: '',
      FirstOrderDate: '',
      OrderId: '',
      FolioNo: '',
      SubBrCode: '',
      EUIN: '',
      EUINVal: 'N',
      DPTxn: '',
      Remarks: '',
      MandateID: '',
      Param1: '',
      Param2: '',
    });
  }

  protected getSoapAction(methodName: string): string {
    return `http://bsestarmf.in/MFOrderEntry/${methodName}`;
  }

  protected buildSoapEnvelope(method: string, params: Record<string, unknown>): string {
    const { SOAPBuilder } = require('../utils/soap-builder');
    return SOAPBuilder.build('bses', 'http://bsestarmf.in/', method, params);
  }

  protected parseResponse<T>(soapResponse: string): T {
    try {
      const parser = new (require('fast-xml-parser').XMLParser)();
      const doc = parser.parse(soapResponse);

      const resultText =
        doc?.['soap:Envelope']?.['soap:Body']?.['sipOrderEntryParamResult']?.['#text'] ||
        doc?.['soap:Envelope']?.['soap:Body']?.['sipOrderEntryParamResult'] ||
        '';

      if (!resultText || typeof resultText !== 'string') {
        throw new Error('Empty SIP response');
      }

      const parts = resultText.split('|');
      return {
        transCode: parts[0] || '',
        transNo: parts[1] || '',
        memberId: parts[2] || '',
        clientCode: parts[3] || '',
        userId: parts[4] || '',
        sipRegId: parseInt(parts[5] || '0', 10),
        bseRemarks: parts[6] || '',
        successFlag: (parts[7] as '0' | '1') || '1',
        firstOrderTodayOrderNo: parts[8],
      } as T;
    } catch {
      throw new Error('Failed to parse SIP response');
    }
  }
}
