import { BuySellType, DPTransaction, YesNo, SIPFrequency, TransactionCode } from './common.types';

export interface PurchaseRequest {
  clientCode: string;
  schemeCode: string;
  amount?: number;
  quantity?: number;
  buySellType?: BuySellType;
  dpTransaction?: DPTransaction;
  folioNumber?: string;
  allRedeem?: YesNo;
  kycStatus?: YesNo;
  remarks?: string;
  internalRefNo?: string;
  subBrokerCode?: string;
  euin?: string;
  euinDeclaration?: YesNo;
  minRedeemFlag?: YesNo;
  dpcFlag?: YesNo;
  subBrokerArn?: string;
  pgRefNo?: string;
  bankAccountNo?: string;
  mobileNo?: string;
  emailId?: string;
  mandateId?: string;
}

export interface PurchaseResponse {
  transCode: TransactionCode;
  transNo: string;
  orderId: number;
  userId: string;
  memberId: string;
  clientCode: string;
  bseRemarks: string;
  successFlag: '0' | '1';
}

export interface RedeemRequest {
  clientCode: string;
  schemeCode: string;
  amount?: number;
  quantity?: number;
  allRedeem?: YesNo;
  buySellType?: BuySellType;
  dpTransaction?: DPTransaction;
  folioNumber?: string;
  kycStatus?: YesNo;
  remarks?: string;
  internalRefNo?: string;
  subBrokerCode?: string;
  euin?: string;
  euinDeclaration?: YesNo;
  minRedeemFlag?: YesNo;
  dpcFlag?: YesNo;
  bankAccountNo?: string;
  mobileNo?: string;
  emailId?: string;
}

export interface RedeemResponse extends PurchaseResponse {}

export interface SIPRequest {
  clientCode: string;
  schemeCode: string;
  amount: number;
  frequency: SIPFrequency;
  startDate: string;
  noOfInstallments: number;
  folioNumber?: string;
  firstOrderToday?: YesNo;
  subBrokerCode?: string;
  euin?: string;
  euinDeclaration?: YesNo;
  dpTransaction?: DPTransaction;
  mandateId?: string;
  endDate?: string;
  remarks?: string;
}

export interface SIPResponse {
  transCode: TransactionCode;
  transNo: string;
  memberId: string;
  clientCode: string;
  userId: string;
  sipRegId: number;
  bseRemarks: string;
  successFlag: '0' | '1';
  firstOrderTodayOrderNo?: string;
}

export interface XSIPRequest {
  clientCode: string;
  schemeCode: string;
  amount: number;
  frequency: SIPFrequency;
  startDate: string;
  noOfInstallments: number;
  xsipMandateId: string;
  folioNumber?: string;
  firstOrderToday?: YesNo;
  subBrokerCode?: string;
  euin?: string;
  euinDeclaration?: YesNo;
  endDate?: string;
  remarks?: string;
}

export interface XSIPResponse extends SIPResponse {}

export interface SwitchRequest {
  clientCode: string;
  schemeCode: string;
  switchSchemeCode: string;
  amount?: number;
  quantity?: number;
  allRedeem?: YesNo;
  folioNumber?: string;
  remarks?: string;
  subBrokerCode?: string;
  euin?: string;
  euinDeclaration?: YesNo;
}

export interface SwitchResponse {
  transCode: TransactionCode;
  transNo: string;
  soOrderId: number;
  siOrderId: number;
  userId: string;
  memberId: string;
  clientCode: string;
  bseRemarks: string;
  successFlag: '0' | '1';
}

export interface SpreadRequest {
  clientCode: string;
  schemeCode: string;
  amount: number;
  redeemDate: string;
  folioNumber?: string;
  remarks?: string;
  subBrokerCode?: string;
  euin?: string;
  euinDeclaration?: YesNo;
}

export interface SpreadResponse {
  transCode: TransactionCode;
  transNo: string;
  orderId: number;
  userId: string;
  memberId: string;
  clientCode: string;
  bseRemarks: string;
  successFlag: '0' | '1';
}

export interface ClientRegistrationRequest {
  clientCode?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  pan: string;
  panExemptCategory?: string;
  gender?: 'M' | 'F' | 'O';
  fatherOrSpouseName?: string;
  maritalStatus?: 'S' | 'M';
  customerType?: 'I' | 'N';
  occupation?: string;
  constitution?: string;
  registrationDate?: string;
  comMode1?: 'P' | 'E' | 'F';
  comMode2?: 'P' | 'E' | 'F';
  address1: string;
  address2?: string;
  address3?: string;
  city: string;
  pinCode: string;
  state: string;
  country: string;
  stdCode?: string;
  phoneRes?: string;
  phoneOff?: string;
  mobile: string;
  email: string;
  wealthFiles?: string;
  taxStatus: string;
  applicationSource?: string;
  accountType: string;
  clientHolding: string;
  dividendPayMode: string;
  bankName: string;
  bankBranch: string;
  bankAccountNo: string;
  bankAccountType: string;
  micrNo?: string;
  ifscCode?: string;
  cmBoID?: string;
  cmBoIDSlNo?: string;
  cmBoIDSubSlNo?: string;
  depositoryName?: 'CDSL' | 'NSDL';
  subBrokerCode?: string;
  subBrokerARN?: string;
  euin?: string;
  euinVal?: YesNo;
  payinBankMapping?: string;
}

export interface ClientRegistrationResponse {
  status: string;
  ucc: string;
  bseRemarks: string;
}

export interface ClientModificationRequest {
  clientCode: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  address1?: string;
  address2?: string;
  address3?: string;
  city?: string;
  pinCode?: string;
  state?: string;
  country?: string;
  phoneRes?: string;
  phoneOff?: string;
  mobile?: string;
  email?: string;
  bankName?: string;
  bankBranch?: string;
  bankAccountNo?: string;
  bankAccountType?: string;
  ifscCode?: string;
  comMode1?: 'P' | 'E' | 'F';
  comMode2?: 'P' | 'E' | 'F';
}

export interface MandateRegistrationRequest {
  clientCode: string;
  mandateType: 'NACH' | 'ECS' | 'MICR';
  bankName: string;
  branchName: string;
  accountNumber: string;
  accountType: 'SB' | 'CA' | 'CURRENT' | 'NRE' | 'NRO';
  micrNo?: string;
  ifscCode: string;
  startDate: string;
  endDate: string;
  amount?: number;
  maxAmount?: number;
  frequency?: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'ASPRESENT';
  referenceNo?: string;
  remarks?: string;
}

export interface MandateRegistrationResponse {
  mandateId: string;
  status: string;
  bseRemarks: string;
}

export interface MandateStatusRequest {
  mandateId: string;
}

export interface MandateStatusResponse {
  mandateId: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  approvedDate?: string;
  rejectionReason?: string;
}

export interface MandateShiftRequest {
  mandateId: string;
  newClientCode: string;
  newBankAccountNo: string;
  remarks?: string;
}

export interface MandateShiftResponse {
  mandateId: string;
  status: string;
  bseRemarks: string;
}

export interface OrderStatusRequest {
  orderId: number;
}

export interface OrderStatusResponse {
  orderId: number;
  status: 'Pending' | 'Processed' | 'Rejected' | 'Cancelled';
  nav?: number;
  units?: number;
  amount?: number;
  processedDate?: string;
  bseRemarks: string;
}

export interface AllotmentStatementRequest {
  orderId: number;
  clientCode: string;
}

export interface AllotmentStatementResponse {
  orderId: number;
  clientCode: string;
  schemeName: string;
  nav: number;
  units: number;
  amount: number;
  allotmentDate: string;
  folioNumber: string;
}

export interface RedemptionStatementRequest {
  orderId: number;
  clientCode: string;
}

export interface RedemptionStatementResponse {
  orderId: number;
  clientCode: string;
  schemeName: string;
  nav: number;
  units: number;
  amount: number;
  redemptionDate: string;
  folioNumber: string;
}

export interface PaymentGatewayRequest {
  orderId: number;
  amount: number;
  clientCode: string;
  returnUrl: string;
  paymentMode?: 'NETBANKING' | 'UPI' | 'DEBITCARD';
  bankCode?: string;
}

export interface PaymentGatewayResponse {
  paymentUrl: string;
  transactionId: string;
}

export interface PaymentStatusRequest {
  transactionId: string;
}

export interface PaymentStatusResponse {
  transactionId: string;
  status: 'Pending' | 'Success' | 'Failed';
  amount: number;
  paymentDate?: string;
  bseRemarks?: string;
}

export interface STPRegistrationRequest {
  clientCode: string;
  fromSchemeCode: string;
  toSchemeCode: string;
  stpType: 'FIXED' | 'PERCENT';
  amount?: number;
  percent?: number;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY';
  startDate: string;
  endDate?: string;
  noOfInstallments?: number;
  folioNumber?: string;
  subBrokerCode?: string;
  euin?: string;
  euinDeclaration?: YesNo;
  remarks?: string;
}

export interface STPCancellationRequest {
  stpRegId: number;
  remarks?: string;
}

export interface STPResponse {
  transCode: string;
  transNo: string;
  stpRegId: number;
  status: string;
  bseRemarks: string;
}
