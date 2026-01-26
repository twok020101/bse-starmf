import { BaseService } from './base.service';
import type { BSEConfig } from '../client/client.types';
import type { SessionManager } from '../auth/session-manager';
import type { PasswordEncryptor } from '../encryption/password-encryptor';
import { SOAPBuilder } from '../utils/soap-builder';
import { TransactionNoGenerator } from '../utils/transaction-no';
import type {
  PurchaseRequest,
  PurchaseResponse,
  RedeemRequest,
  RedeemResponse,
} from '../types/api.types';
import { BSEError } from '../errors/bse-error';
import { validatePurchaseParams } from '../utils/validators';

/**
 * Service for handling order operations (purchase and redemption).
 *
 * Provides methods for placing buy and sell orders for mutual fund schemes.
 *
 * @example
 * ```typescript
 * // Purchase
 * const purchase = await client.orders.purchase({
 *   clientCode: 'UCC001',
 *   schemeCode: '119603',
 *   amount: 5000,
 * });
 *
 * // Redemption
 * const redemption = await client.orders.redeem({
 *   clientCode: 'UCC001',
 *   schemeCode: '119603',
 *   amount: 1000,
 * });
 * ```
 */
export class OrderService extends BaseService {
  private transNoGenerator: TransactionNoGenerator;

  /**
   * Creates a new OrderService instance.
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
   * Places a purchase order for a mutual fund scheme.
   *
   * @param params - Purchase request parameters
   * @param params.clientCode - Unique Client Code (UCC)
   * @param params.schemeCode - BSE Scheme Code
   * @param params.amount - Purchase amount in INR (required if quantity not specified)
   * @param params.quantity - Number of units to purchase (required if amount not specified)
   * @param params.buySellType - Order type: 'FRESH' or 'ADDITIONAL'
   * @param params.dpTransaction - Demat transaction type: 'P' (Physical), 'C' (Cascade), 'N' (NCD)
   * @param params.folioNumber - Existing folio number (optional)
   * @param params.allRedeem - 'Y' for complete redemption (use with quantity=0)
   * @param params.kycStatus - 'Y' if KYC completed
   * @param params.remarks - Optional remarks
   * @param params.internalRefNo - Your internal reference number
   * @param params.subBrokerCode - Sub-broker code (ARN)
   * @param params.euin - EUIN for advisory
   * @param params.euinDeclaration - 'Y' if EUIN declared
   * @param params.dpcFlag - 'Y' to disable panic cut-off
   * @param params.subBrokerArn - Sub-broker ARN code
   * @param params.pgRefNo - Payment gateway reference
   * @param params.bankAccountNo - Bank account number for payment
   * @param params.mobileNo - Mobile number
   * @param params.emailId - Email address
   * @param params.mandateId - Mandate ID for SIP payments
   *
   * @returns {Promise<PurchaseResponse>} Purchase response with order details
   *
   * @throws {BSEError} TXN_002 - Invalid scheme code
   * @throws {BSEError} TXN_003 - Order rejected
   * @throws {BSEError} AUTH_001 - Invalid client code
   */
  async purchase(params: PurchaseRequest): Promise<PurchaseResponse> {
    validatePurchaseParams({
      amount: params.amount,
      quantity: params.quantity,
      allRedeem: params.allRedeem,
    });

    const transNo = this.transNoGenerator.generate();

    const response = await this.executeRequest<PurchaseResponse>('orderEntryParam', {
      TransCode: 'NEW',
      TransNo: transNo,
      OrderId: '',
      ClientCode: params.clientCode,
      SchemeCd: params.schemeCode,
      BuySell: 'P',
      BuySellType: params.buySellType || 'FRESH',
      DPTxn: params.dpTransaction || 'P',
      OrderVal: params.amount || '',
      Qty: params.quantity || '',
      AllRedeem: params.allRedeem || 'N',
      FolioNo: params.folioNumber || '',
      Remarks: params.remarks || '',
      KYCStatus: params.kycStatus || 'Y',
      RefNo: params.internalRefNo || '',
      SubBrCode: params.subBrokerCode || '',
      EUIN: params.euin || '',
      EUINVal: params.euinDeclaration || 'N',
      MinRedeem: params.minRedeemFlag || 'N',
      DPC: params.dpcFlag || 'Y',
      IPAdd: '',
      Parma1: params.subBrokerArn || '',
      Param2: params.pgRefNo || '',
      Param3: params.bankAccountNo || '',
      MobileNo: params.mobileNo || '',
      EmailID: params.emailId || '',
      MandateID: params.mandateId || '',
    });

    return response;
  }

  /**
   * Places a redemption order for a mutual fund scheme.
   *
   * @param params - Redemption request parameters
   * @param params.clientCode - Unique Client Code (UCC)
   * @param params.schemeCode - BSE Scheme Code
   * @param params.amount - Redemption amount in INR (optional if quantity specified)
   * @param params.quantity - Number of units to redeem (optional if amount specified)
   * @param params.allRedeem - 'Y' to redeem all units (use with amount=0, quantity=0)
   * @param params.buySellType - Order type: 'FRESH' or 'ADDITIONAL'
   * @param params.dpTransaction - Demat transaction type: 'P' (Physical), 'C' (Cascade), 'N' (NCD)
   * @param params.folioNumber - Existing folio number
   * @param params.kycStatus - 'Y' if KYC completed
   * @param params.remarks - Optional remarks
   * @param params.internalRefNo - Your internal reference number
   * @param params.subBrokerCode - Sub-broker code (ARN)
   * @param params.euin - EUIN for advisory
   * @param params.euinDeclaration - 'Y' if EUIN declared
   * @param params.dpcFlag - 'Y' to disable panic cut-off
   * @param params.bankAccountNo - Bank account number for payment
   * @param params.mobileNo - Mobile number
   * @param params.emailId - Email address
   *
   * @returns {Promise<RedeemResponse>} Redemption response with order details
   *
   * @throws {BSEError} TXN_002 - Invalid scheme code
   * @throws {BSEError} TXN_003 - Order rejected
   * @throws {BSEError} TXN_004 - Insufficient units
   * @throws {BSEError} AUTH_001 - Invalid client code
   */
  async redeem(params: RedeemRequest): Promise<RedeemResponse> {
    validatePurchaseParams({
      amount: params.amount,
      quantity: params.quantity,
      allRedeem: params.allRedeem,
    });

    const transNo = this.transNoGenerator.generate();

    return this.executeRequest<RedeemResponse>('orderEntryParam', {
      TransCode: 'NEW',
      TransNo: transNo,
      OrderId: '',
      ClientCode: params.clientCode,
      SchemeCd: params.schemeCode,
      BuySell: 'R',
      BuySellType: params.buySellType || 'FRESH',
      DPTxn: params.dpTransaction || 'P',
      OrderVal: params.amount || '',
      Qty: params.quantity || '',
      AllRedeem: params.allRedeem || 'N',
      FolioNo: params.folioNumber || '',
      Remarks: params.remarks || '',
      KYCStatus: params.kycStatus || 'Y',
      RefNo: params.internalRefNo || '',
      SubBrCode: params.subBrokerCode || '',
      EUIN: params.euin || '',
      EUINVal: params.euinDeclaration || 'N',
      MinRedeem: params.minRedeemFlag || 'N',
      DPC: params.dpcFlag || 'Y',
      IPAdd: '',
      Param3: params.bankAccountNo || '',
      MobileNo: params.mobileNo || '',
      EmailID: params.emailId || '',
    });
  }

  protected getSoapAction(methodName: string): string {
    return `http://bsestarmf.in/MFOrderEntry/${methodName}`;
  }

  protected buildSoapEnvelope(method: string, params: Record<string, unknown>): string {
    return SOAPBuilder.build('bses', 'http://bsestarmf.in/', method, params);
  }

  protected parseResponse<T>(soapResponse: string): T {
    try {
      const parser = new (require('fast-xml-parser').XMLParser)();
      const doc = parser.parse(soapResponse);

      const resultText =
        doc?.['soap:Envelope']?.['soap:Body']?.[`${this.getMethodResultTag()}`]?.['#text'] ||
        doc?.['soap:Envelope']?.['soap:Body']?.[`${this.getMethodResultTag()}`] ||
        '';

      if (!resultText || typeof resultText !== 'string') {
        throw new BSEError('EMPTY_RESPONSE', 'Received empty response from BSE');
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
    } catch (error) {
      if (error instanceof BSEError) {
        throw error;
      }
      throw new BSEError('PARSE_ERROR', 'Failed to parse order response');
    }
  }

  private getMethodResultTag(): string {
    return 'orderEntryParamResult';
  }
}
