import { BaseService } from './base.service';
import { BSEConfig } from '../client/client.types';
import { SessionManager } from '../auth/session-manager';
import { PasswordEncryptor } from '../encryption/password-encryptor';
import { XSIPRequest, XSIPResponse } from '../types/api.types';
import { validateSIPParams } from '../utils/validators';
import { TransactionNoGenerator } from '../utils/transaction-no';

export class XSIPService extends BaseService {
  private transNoGenerator: TransactionNoGenerator;

  constructor(config: BSEConfig, sessionManager: SessionManager, encryptor: PasswordEncryptor) {
    super(config, sessionManager, encryptor, '/MFOrderEntry/MFOrder.svc/Secure');
    this.transNoGenerator = new TransactionNoGenerator(config.memberId);
  }

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
