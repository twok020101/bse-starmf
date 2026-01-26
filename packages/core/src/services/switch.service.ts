import { BaseService } from './base.service';
import { BSEConfig } from '../client/client.types';
import { SessionManager } from '../auth/session-manager';
import { PasswordEncryptor } from '../encryption/password-encryptor';
import { SwitchRequest, SwitchResponse } from '../types/api.types';
import { validateSwitchParams } from '../utils/validators';
import { TransactionNoGenerator } from '../utils/transaction-no';

export class SwitchService extends BaseService {
  private transNoGenerator: TransactionNoGenerator;

  constructor(
    config: BSEConfig,
    sessionManager: SessionManager,
    encryptor: PasswordEncryptor
  ) {
    super(config, sessionManager, encryptor, '/MFOrderEntry/MFOrder.svc/Secure');
    this.transNoGenerator = new TransactionNoGenerator(config.memberId);
  }

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
