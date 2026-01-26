import { BaseService } from './base.service';
import type { BSEConfig } from '../client/client.types';
import type { SessionManager } from '../auth/session-manager';
import type { PasswordEncryptor } from '../encryption/password-encryptor';
import type { XSIPRequest, XSIPResponse } from '../types/api.types';
import { validateSIPParams } from '../utils/validators';
import { TransactionNoGenerator } from '../utils/transaction-no';

/**
 * Service for handling XSIP (Extended SIP) operations.
 *
 * XSIP allows registration of SIPs with mandate integration for automatic
 * debit instructions. Similar to regular SIP but requires a registered mandate.
 *
 * @example
 * ```typescript
 * // Register XSIP with mandate
 * const xsip = await client.xsip.register({
 *   clientCode: 'UCC001',
 *   schemeCode: '119603',
 *   amount: 2000,
 *   frequency: 'MONTHLY',
 *   startDate: '01/02/2026',
 *   noOfInstallments: 12,
 *   xsipMandateId: 'MDT001',
 * });
 *
 * // Cancel XSIP
 * await client.xsip.cancel(xsip.sipRegId);
 * ```
 */
export class XSIPService extends BaseService {
  private transNoGenerator: TransactionNoGenerator;

  /**
   * Creates a new XSIPService instance.
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
   * Registers a new XSIP with mandate integration.
   *
   * @param params - XSIP registration parameters
   * @param params.clientCode - Unique Client Code (UCC)
   * @param params.schemeCode - BSE Scheme Code
   * @param params.amount - SIP installment amount in INR
   * @param params.frequency - SIP frequency: 'MONTHLY', 'QUARTERLY', or 'WEEKLY'
   * @param params.startDate - First installment date in DD/MM/YYYY format
   * @param params.noOfInstallments - Number of installments (use 999 for perpetual)
   * @param params.xsipMandateId - Registered Mandate ID for auto-debit
   * @param params.folioNumber - Existing folio number (optional)
   * @param params.subBrokerCode - Sub-broker code (ARN)
   * @param params.euin - EUIN for advisory
   * @param params.euinDeclaration - 'Y' if EUIN declared
   * @param params.remarks - Optional remarks
   * @param params.endDate - End date in DD/MM/YYYY format
   *
   * @returns {Promise<XSIPResponse>} XSIP registration response with registration ID
   *
   * @throws {BSEError} TXN_002 - Invalid scheme code
   * @throws {BSEError} AUTH_001 - Invalid client code
   */
  async register(params: XSIPRequest): Promise<XSIPResponse> {
    validateSIPParams({
      startDate: params.startDate,
      endDate: params.endDate,
      frequency: params.frequency,
      noOfInstallments: params.noOfInstallments,
      amount: params.amount,
    });

    const transNo = this.transNoGenerator.generate();

    return this.executeRequest<XSIPResponse>('xsipOrderEntryParam', {
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
      MandateID: params.xsipMandateId,
      Remarks: params.remarks || '',
      Param1: '',
      Param2: params.endDate || '',
    });
  }

  /**
   * Cancels an existing XSIP registration.
   *
   * @param xsipRegId - The XSIP registration ID to cancel
   *
   * @returns {Promise<XSIPResponse>} Cancellation response
   *
   * @throws {BSEError} TXN_003 - Cancellation failed
   */
  async cancel(xsipRegId: number): Promise<XSIPResponse> {
    const transNo = this.transNoGenerator.generate();

    return this.executeRequest<XSIPResponse>('xsipOrderEntryParam', {
      TransCode: 'CXL',
      TransNo: transNo,
      RegID: xsipRegId.toString(),
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
      MandateID: '',
      Remarks: '',
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
        doc?.['soap:Envelope']?.['soap:Body']?.['xsipOrderEntryParamResult']?.['#text'] ||
        doc?.['soap:Envelope']?.['soap:Body']?.['xsipOrderEntryParamResult'] ||
        '';

      if (!resultText || typeof resultText !== 'string') {
        throw new Error('Empty XSIP response');
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
      throw new Error('Failed to parse XSIP response');
    }
  }
}
