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

export class OrderService extends BaseService {
  private transNoGenerator: TransactionNoGenerator;

  constructor(config: BSEConfig, sessionManager: SessionManager, encryptor: PasswordEncryptor) {
    super(config, sessionManager, encryptor, '/MFOrderEntry/MFOrder.svc/Secure');
    this.transNoGenerator = new TransactionNoGenerator(config.memberId);
  }

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
