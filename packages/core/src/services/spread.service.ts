import { BaseService } from './base.service';
import type { BSEConfig } from '../client/client.types';
import type { SessionManager } from '../auth/session-manager';
import type { PasswordEncryptor } from '../encryption/password-encryptor';
import type { SpreadRequest, SpreadResponse } from '../types/api.types';
import { validateSpreadParams } from '../utils/validators';
import { TransactionNoGenerator } from '../utils/transaction-no';

/**
 * Service for handling Spread orders.
 *
 * Spread orders allow simultaneous purchase and redemption on the same day,
 * typically used for capital gains distribution strategies.
 *
 * @example
 * ```typescript
 * // Create a spread order (buy + redeem on same day)
 * const spread = await client.spread.createSpread({
 *   clientCode: 'UCC001',
 *   schemeCode: '119603',
 *   amount: 50000,
 *   redeemDate: '25/01/2026',
 * });
 * ```
 */
export class SpreadService extends BaseService {
  private transNoGenerator: TransactionNoGenerator;

  /**
   * Creates a new SpreadService instance.
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
   * Creates a spread order (simultaneous buy and redeem).
   *
   * @param params - Spread order parameters
   * @param params.clientCode - Unique Client Code (UCC)
   * @param params.schemeCode - BSE Scheme Code
   * @param params.amount - Purchase amount in INR
   * @param params.redeemDate - Date for redemption in DD/MM/YYYY format
   * @param params.folioNumber - Existing folio number (optional)
   * @param params.remarks - Optional remarks
   * @param params.subBrokerCode - Sub-broker code (ARN)
   * @param params.euin - EUIN for advisory
   * @param params.euinDeclaration - 'Y' if EUIN declared
   *
   * @returns {Promise<SpreadResponse>} Spread order response
   *
   * @throws {BSEError} TXN_002 - Invalid scheme code
   * @throws {BSEError} TXN_003 - Order rejected
   */
  async createSpread(params: SpreadRequest): Promise<SpreadResponse> {
    validateSpreadParams(params);

    const transNo = this.transNoGenerator.generate();

    return this.executeRequest<SpreadResponse>('spreadOrderEntryParam', {
      TransCode: 'NEW',
      TransNo: transNo,
      OrderId: '',
      UserID: this.config.userId,
      MemberId: this.config.memberId,
      ClientCode: params.clientCode,
      SchemeCd: params.schemeCode,
      BuySell: 'P',
      BuySellType: 'FRESH',
      DPTxn: 'P',
      OrderVal: params.amount.toString(),
      Qty: '',
      AllRedeem: 'N',
      FolioNo: params.folioNumber || '',
      Remarks: params.remarks || '',
      KYCStatus: 'Y',
      RefNo: '',
      SubBrCode: params.subBrokerCode || '',
      EUIN: params.euin || '',
      EUINVal: params.euinDeclaration || 'N',
      MinRedeem: 'N',
      DPC: 'Y',
      IPAdd: '',
      Param1: '',
      Param2: '',
      Param3: params.redeemDate,
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
        doc?.['soap:Envelope']?.['soap:Body']?.['spreadOrderEntryParamResult']?.['#text'] ||
        doc?.['soap:Envelope']?.['soap:Body']?.['spreadOrderEntryParamResult'] ||
        '';

      if (!resultText || typeof resultText !== 'string') {
        throw new Error('Empty spread response');
      }

      const parts = resultText.split('|');
      return {
        transCode: parts[0] || '',
        transNo: parts[1] || '',
        orderId: parseInt(parts[2] || '0', 10),
        userId: parts[3] || '',
        memberId: parts[4] || '',
        clientCode: parts[5] || '',
        bseRemarks: parts[6] || '',
        successFlag: (parts[7] as '0' | '1') || '1',
      } as T;
    } catch {
      throw new Error('Failed to parse spread response');
    }
  }
}
