import { BaseService } from './base.service';
import type { BSEConfig } from '../client/client.types';
import type { SessionManager } from '../auth/session-manager';
import type { PasswordEncryptor } from '../encryption/password-encryptor';
import type { SwitchRequest, SwitchResponse } from '../types/api.types';
import { validateSwitchParams } from '../utils/validators';
import { TransactionNoGenerator } from '../utils/transaction-no';

/**
 * Service for handling Switch orders.
 *
 * Switch allows transferring units from one scheme to another within the
 * same or different AMCs (Asset Management Companies).
 *
 * @example
 * ```typescript
 * // Switch from one scheme to another
 * const switchOrder = await client.switch.switchOrder({
 *   clientCode: 'UCC001',
 *   schemeCode: '119603',  // Source scheme
 *   switchSchemeCode: '119891',  // Target scheme
 *   amount: 10000,
 * });
 * ```
 */
export class SwitchService extends BaseService {
  private transNoGenerator: TransactionNoGenerator;

  /**
   * Creates a new SwitchService instance.
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
   * Places a switch order to transfer units between schemes.
   *
   * @param params - Switch order parameters
   * @param params.clientCode - Unique Client Code (UCC)
   * @param params.schemeCode - Source scheme BSE Code
   * @param params.switchSchemeCode - Target scheme BSE Code
   * @param params.amount - Switch amount in INR (optional if quantity specified)
   * @param params.quantity - Number of units to switch (optional if amount specified)
   * @param params.allRedeem - 'Y' to switch all units
   * @param params.folioNumber - Existing folio number
   * @param params.remarks - Optional remarks
   * @param params.subBrokerCode - Sub-broker code (ARN)
   * @param params.euin - EUIN for advisory
   * @param params.euinDeclaration - 'Y' if EUIN declared
   *
   * @returns {Promise<SwitchResponse>} Switch response with order IDs
   *
   * @throws {BSEError} TXN_002 - Invalid scheme code
   * @throws {BSEError} TXN_003 - Switch rejected
   * @throws {BSEError} TXN_004 - Insufficient units
   */
  async switchOrder(params: SwitchRequest): Promise<SwitchResponse> {
    validateSwitchParams(params);

    const transNo = this.transNoGenerator.generate();

    return this.executeRequest<SwitchResponse>('switchOrderEntryParam', {
      TransCode: 'NEW',
      TransNo: transNo,
      OrderId: '',
      UserID: this.config.userId,
      MemberId: this.config.memberId,
      ClientCode: params.clientCode,
      SchemeCd: params.schemeCode,
      SwitchSchemeCd: params.switchSchemeCode,
      BuySell: 'P',
      BuySellType: 'FRESH',
      DPTxn: 'P',
      OrderVal: params.amount?.toString() || '',
      Qty: params.quantity?.toString() || '',
      AllRedeem: params.allRedeem || 'N',
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
      Param3: '',
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
        doc?.['soap:Envelope']?.['soap:Body']?.['switchOrderEntryParamResult']?.['#text'] ||
        doc?.['soap:Envelope']?.['soap:Body']?.['switchOrderEntryParamResult'] ||
        '';

      if (!resultText || typeof resultText !== 'string') {
        throw new Error('Empty switch response');
      }

      const parts = resultText.split('|');
      return {
        transCode: parts[0] || '',
        transNo: parts[1] || '',
        soOrderId: parseInt(parts[2] || '0', 10),
        siOrderId: parseInt(parts[3] || '0', 10),
        userId: parts[4] || '',
        memberId: parts[5] || '',
        clientCode: parts[6] || '',
        bseRemarks: parts[7] || '',
        successFlag: (parts[8] as '0' | '1') || '1',
      } as T;
    } catch {
      throw new Error('Failed to parse switch response');
    }
  }
}
