import type {
  BuySellType,
  DPTransaction,
  YesNo,
  SIPFrequency,
  TransactionCode,
} from './common.types';

/**
 * Request parameters for purchase orders.
 */
export interface PurchaseRequest {
  /** Unique Client Code (UCC) */
  clientCode: string;

  /** BSE Scheme Code */
  schemeCode: string;

  /** Purchase amount in INR (required if quantity not specified) */
  amount?: number;

  /** Number of units to purchase (required if amount not specified) */
  quantity?: number;

  /** Order type: 'FRESH' or 'ADDITIONAL' */
  buySellType?: BuySellType;

  /** Demat transaction type: 'P' (Physical), 'C' (Cascade), 'N' (NCD) */
  dpTransaction?: DPTransaction;

  /** Existing folio number */
  folioNumber?: string;

  /** 'Y' for complete redemption (use with amount=0, quantity=0) */
  allRedeem?: YesNo;

  /** 'Y' if KYC completed */
  kycStatus?: YesNo;

  /** Optional remarks */
  remarks?: string;

  /** Your internal reference number */
  internalRefNo?: string;

  /** Sub-broker code (ARN) */
  subBrokerCode?: string;

  /** EUIN for advisory */
  euin?: string;

  /** 'Y' if EUIN declared */
  euinDeclaration?: YesNo;

  /** Minimum redemption flag */
  minRedeemFlag?: YesNo;

  /** 'Y' to disable panic cut-off */
  dpcFlag?: YesNo;

  /** Sub-broker ARN code */
  subBrokerArn?: string;

  /** Payment gateway reference */
  pgRefNo?: string;

  /** Bank account number for payment */
  bankAccountNo?: string;

  /** Mobile number */
  mobileNo?: string;

  /** Email address */
  emailId?: string;

  /** Mandate ID for SIP payments */
  mandateId?: string;
}

/**
 * Response from purchase order.
 */
export interface PurchaseResponse {
  /** Transaction code (NEW, MOD, CXL) */
  transCode: TransactionCode;

  /** Transaction number */
  transNo: string;

  /** BSE Order ID */
  orderId: number;

  /** User ID */
  userId: string;

  /** Member ID */
  memberId: string;

  /** Client Code */
  clientCode: string;

  /** BSE remarks or error message */
  bseRemarks: string;

  /** Success flag: '0' = success, '1' = error */
  successFlag: '0' | '1';
}

/**
 * Request parameters for redemption orders.
 */
export interface RedeemRequest {
  /** Unique Client Code (UCC) */
  clientCode: string;

  /** BSE Scheme Code */
  schemeCode: string;

  /** Redemption amount in INR (optional if quantity specified) */
  amount?: number;

  /** Number of units to redeem (optional if amount specified) */
  quantity?: number;

  /** 'Y' to redeem all units */
  allRedeem?: YesNo;

  /** Order type: 'FRESH' or 'ADDITIONAL' */
  buySellType?: BuySellType;

  /** Demat transaction type: 'P' (Physical), 'C' (Cascade), 'N' (NCD) */
  dpTransaction?: DPTransaction;

  /** Existing folio number */
  folioNumber?: string;

  /** 'Y' if KYC completed */
  kycStatus?: YesNo;

  /** Optional remarks */
  remarks?: string;

  /** Your internal reference number */
  internalRefNo?: string;

  /** Sub-broker code (ARN) */
  subBrokerCode?: string;

  /** EUIN for advisory */
  euin?: string;

  /** 'Y' if EUIN declared */
  euinDeclaration?: YesNo;

  /** Minimum redemption flag */
  minRedeemFlag?: YesNo;

  /** 'Y' to disable panic cut-off */
  dpcFlag?: YesNo;

  /** Bank account number for payment */
  bankAccountNo?: string;

  /** Mobile number */
  mobileNo?: string;

  /** Email address */
  emailId?: string;
}

/** Response from redemption order (same as purchase) */
export interface RedeemResponse extends PurchaseResponse {}

/**
 * Request parameters for SIP registration.
 */
export interface SIPRequest {
  /** Unique Client Code (UCC) */
  clientCode: string;

  /** BSE Scheme Code */
  schemeCode: string;

  /** SIP installment amount in INR */
  amount: number;

  /** SIP frequency: 'MONTHLY', 'QUARTERLY', 'WEEKLY', 'DAILY' */
  frequency: SIPFrequency;

  /** First installment date in DD/MM/YYYY format */
  startDate: string;

  /** Number of installments (use 999 for perpetual) */
  noOfInstallments: number;

  /** Existing folio number */
  folioNumber?: string;

  /** 'Y' to execute first order immediately */
  firstOrderToday?: YesNo;

  /** Sub-broker code (ARN) */
  subBrokerCode?: string;

  /** EUIN for advisory */
  euin?: string;

  /** 'Y' if EUIN declared */
  euinDeclaration?: YesNo;

  /** Demat transaction type */
  dpTransaction?: DPTransaction;

  /** Mandate ID for auto-debit */
  mandateId?: string;

  /** End date in DD/MM/YYYY format (required for daily SIP) */
  endDate?: string;

  /** Optional remarks */
  remarks?: string;
}

/**
 * Response from SIP registration.
 */
export interface SIPResponse {
  /** Transaction code (NEW, MOD, CXL) */
  transCode: TransactionCode;

  /** Transaction number */
  transNo: string;

  /** Member ID */
  memberId: string;

  /** Client Code */
  clientCode: string;

  /** User ID */
  userId: string;

  /** BSE SIP Registration ID */
  sipRegId: number;

  /** BSE remarks or error message */
  bseRemarks: string;

  /** Success flag: '0' = success, '1' = error */
  successFlag: '0' | '1';

  /** First order today's order number (if applicable) */
  firstOrderTodayOrderNo?: string;
}

/**
 * Request parameters for XSIP registration.
 */
export interface XSIPRequest {
  /** Unique Client Code (UCC) */
  clientCode: string;

  /** BSE Scheme Code */
  schemeCode: string;

  /** SIP installment amount in INR */
  amount: number;

  /** SIP frequency */
  frequency: SIPFrequency;

  /** First installment date in DD/MM/YYYY format */
  startDate: string;

  /** Number of installments */
  noOfInstallments: number;

  /** Registered Mandate ID for auto-debit */
  xsipMandateId: string;

  /** Existing folio number */
  folioNumber?: string;

  /** 'Y' to execute first order immediately */
  firstOrderToday?: YesNo;

  /** Sub-broker code (ARN) */
  subBrokerCode?: string;

  /** EUIN for advisory */
  euin?: string;

  /** 'Y' if EUIN declared */
  euinDeclaration?: YesNo;

  /** End date in DD/MM/YYYY format */
  endDate?: string;

  /** Optional remarks */
  remarks?: string;
}

/** Response from XSIP registration (same as SIP) */
export interface XSIPResponse extends SIPResponse {}

/**
 * Request parameters for switch orders.
 */
export interface SwitchRequest {
  /** Unique Client Code (UCC) */
  clientCode: string;

  /** Source scheme BSE Code (redemption) */
  schemeCode: string;

  /** Target scheme BSE Code (purchase) */
  switchSchemeCode: string;

  /** Switch amount in INR */
  amount?: number;

  /** Number of units to switch */
  quantity?: number;

  /** 'Y' to switch all units */
  allRedeem?: YesNo;

  /** Existing folio number */
  folioNumber?: string;

  /** Optional remarks */
  remarks?: string;

  /** Sub-broker code (ARN) */
  subBrokerCode?: string;

  /** EUIN for advisory */
  euin?: string;

  /** 'Y' if EUIN declared */
  euinDeclaration?: YesNo;
}

/**
 * Response from switch order.
 */
export interface SwitchResponse {
  /** Transaction code */
  transCode: TransactionCode;

  /** Transaction number */
  transNo: string;

  /** Sell order ID */
  soOrderId: number;

  /** Buy order ID */
  siOrderId: number;

  /** User ID */
  userId: string;

  /** Member ID */
  memberId: string;

  /** Client Code */
  clientCode: string;

  /** BSE remarks or error message */
  bseRemarks: string;

  /** Success flag: '0' = success, '1' = error */
  successFlag: '0' | '1';
}

/**
 * Request parameters for spread orders.
 */
export interface SpreadRequest {
  /** Unique Client Code (UCC) */
  clientCode: string;

  /** BSE Scheme Code */
  schemeCode: string;

  /** Purchase amount in INR */
  amount: number;

  /** Date for redemption in DD/MM/YYYY format */
  redeemDate: string;

  /** Existing folio number */
  folioNumber?: string;

  /** Optional remarks */
  remarks?: string;

  /** Sub-broker code (ARN) */
  subBrokerCode?: string;

  /** EUIN for advisory */
  euin?: string;

  /** 'Y' if EUIN declared */
  euinDeclaration?: YesNo;
}

/**
 * Response from spread order.
 */
export interface SpreadResponse {
  /** Transaction code */
  transCode: TransactionCode;

  /** Transaction number */
  transNo: string;

  /** Order ID */
  orderId: number;

  /** User ID */
  userId: string;

  /** Member ID */
  memberId: string;

  /** Client Code */
  clientCode: string;

  /** BSE remarks or error message */
  bseRemarks: string;

  /** Success flag: '0' = success, '1' = error */
  successFlag: '0' | '1';
}

/**
 * Request parameters for client registration.
 */
export interface ClientRegistrationRequest {
  /** Client Code (optional, auto-generated if not provided) */
  clientCode?: string;

  /** First name */
  firstName: string;

  /** Middle name */
  middleName?: string;

  /** Last name */
  lastName: string;

  /** Date of birth in DD/MM/YYYY format */
  dateOfBirth: string;

  /** PAN number */
  pan: string;

  /** PAN exempt category */
  panExemptCategory?: string;

  /** Gender: 'M' (Male), 'F' (Female), 'O' (Other) */
  gender?: 'M' | 'F' | 'O';

  /** Father or spouse name */
  fatherOrSpouseName?: string;

  /** Marital status: 'S' (Single), 'M' (Married) */
  maritalStatus?: 'S' | 'M';

  /** Customer type: 'I' (Individual), 'N' (Non-Individual) */
  customerType?: 'I' | 'N';

  /** Occupation type */
  occupation?: string;

  /** Constitution */
  constitution?: string;

  /** Registration date */
  registrationDate?: string;

  /** Communication mode 1: 'P' (Post), 'E' (Email), 'F' (Fax) */
  comMode1?: 'P' | 'E' | 'F';

  /** Communication mode 2 */
  comMode2?: 'P' | 'E' | 'F';

  /** Address line 1 */
  address1: string;

  /** Address line 2 */
  address2?: string;

  /** Address line 3 */
  address3?: string;

  /** City */
  city: string;

  /** PIN code */
  pinCode: string;

  /** State */
  state: string;

  /** Country */
  country: string;

  /** STD code */
  stdCode?: string;

  /** Residence phone */
  phoneRes?: string;

  /** Office phone */
  phoneOff?: string;

  /** Mobile number */
  mobile: string;

  /** Email address */
  email: string;

  /** Wealth files */
  wealthFiles?: string;

  /** Tax status */
  taxStatus: string;

  /** Application source */
  applicationSource?: string;

  /** Account type */
  accountType: string;

  /** Client holding type */
  clientHolding: string;

  /** Dividend pay mode */
  dividendPayMode: string;

  /** Bank name */
  bankName: string;

  /** Bank branch name */
  bankBranch: string;

  /** Bank account number */
  bankAccountNo: string;

  /** Bank account type */
  bankAccountType: string;

  /** MICR number */
  micrNo?: string;

  /** IFSC code */
  ifscCode?: string;

  /** CDSL BO ID */
  cmBoID?: string;

  /** CDSL BO ID serial number */
  cmBoIDSlNo?: string;

  /** CDSL BO ID sub-serial number */
  cmBoIDSubSlNo?: string;

  /** Depository name: 'CDSL' or 'NSDL' */
  depositoryName?: 'CDSL' | 'NSDL';

  /** Sub-broker code */
  subBrokerCode?: string;

  /** Sub-broker ARN */
  subBrokerARN?: string;

  /** EUIN */
  euin?: string;

  /** EUIN validation */
  euinVal?: YesNo;

  /** Pay-in bank mapping */
  payinBankMapping?: string;
}

/**
 * Response from client registration.
 */
export interface ClientRegistrationResponse {
  /** Status of registration */
  status: string;

  /** Unique Client Code (UCC) assigned by BSE */
  ucc: string;

  /** BSE remarks or error message */
  bseRemarks: string;
}

/**
 * Request parameters for client modification.
 */
export interface ClientModificationRequest {
  /** Client Code to modify */
  clientCode: string;

  /** New first name */
  firstName?: string;

  /** New middle name */
  middleName?: string;

  /** New last name */
  lastName?: string;

  /** New address line 1 */
  address1?: string;

  /** New address line 2 */
  address2?: string;

  /** New address line 3 */
  address3?: string;

  /** New city */
  city?: string;

  /** New PIN code */
  pinCode?: string;

  /** New state */
  state?: string;

  /** New country */
  country?: string;

  /** New residence phone */
  phoneRes?: string;

  /** New office phone */
  phoneOff?: string;

  /** New mobile number */
  mobile?: string;

  /** New email address */
  email?: string;

  /** New bank name */
  bankName?: string;

  /** New bank branch */
  bankBranch?: string;

  /** New bank account number */
  bankAccountNo?: string;

  /** New bank account type */
  bankAccountType?: string;

  /** New IFSC code */
  ifscCode?: string;

  /** New communication mode 1 */
  comMode1?: 'P' | 'E' | 'F';

  /** New communication mode 2 */
  comMode2?: 'P' | 'E' | 'F';
}

/**
 * Request parameters for mandate registration.
 */
export interface MandateRegistrationRequest {
  /** Client Code */
  clientCode: string;

  /** Mandate type: 'NACH', 'ECS', 'MICR' */
  mandateType: 'NACH' | 'ECS' | 'MICR';

  /** Bank name */
  bankName: string;

  /** Branch name */
  branchName: string;

  /** Account number */
  accountNumber: string;

  /** Account type: 'SB', 'CA', 'CURRENT', 'NRE', 'NRO' */
  accountType: 'SB' | 'CA' | 'CURRENT' | 'NRE' | 'NRO';

  /** MICR number */
  micrNo?: string;

  /** IFSC code */
  ifscCode: string;

  /** Start date in DD/MM/YYYY format */
  startDate: string;

  /** End date in DD/MM/YYYY format */
  endDate: string;

  /** Amount */
  amount?: number;

  /** Maximum amount */
  maxAmount?: number;

  /** Frequency: 'MONTHLY', 'QUARTERLY', 'YEARLY', 'ASPRESENT' */
  frequency?: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'ASPRESENT';

  /** Reference number */
  referenceNo?: string;

  /** Remarks */
  remarks?: string;
}

/**
 * Response from mandate registration.
 */
export interface MandateRegistrationResponse {
  /** BSE Mandate ID */
  mandateId: string;

  /** Status of registration */
  status: string;

  /** BSE remarks or error message */
  bseRemarks: string;
}

/**
 * Request parameters for mandate status check.
 */
export interface MandateStatusRequest {
  /** Mandate ID to check */
  mandateId: string;
}

/**
 * Response from mandate status check.
 */
export interface MandateStatusResponse {
  /** Mandate ID */
  mandateId: string;

  /** Status: 'Pending', 'Approved', 'Rejected', 'Cancelled' */
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';

  /** Approval date (if approved) */
  approvedDate?: string;

  /** Rejection reason (if rejected) */
  rejectionReason?: string;
}

/**
 * Request parameters for mandate shift.
 */
export interface MandateShiftRequest {
  /** Mandate ID to shift */
  mandateId: string;

  /** New client code */
  newClientCode: string;

  /** New bank account number */
  newBankAccountNo: string;

  /** Remarks */
  remarks?: string;
}

/**
 * Response from mandate shift.
 */
export interface MandateShiftResponse {
  /** Mandate ID */
  mandateId: string;

  /** Status */
  status: string;

  /** BSE remarks or error message */
  bseRemarks: string;
}

/**
 * Request parameters for order status check.
 */
export interface OrderStatusRequest {
  /** Order ID to check */
  orderId: number;
}

/**
 * Response from order status check.
 */
export interface OrderStatusResponse {
  /** Order ID */
  orderId: number;

  /** Status: 'Pending', 'Processed', 'Rejected', 'Cancelled' */
  status: 'Pending' | 'Processed' | 'Rejected' | 'Cancelled';

  /** NAV (if processed) */
  nav?: number;

  /** Units allocated (if processed) */
  units?: number;

  /** Amount (if processed) */
  amount?: number;

  /** Processing date */
  processedDate?: string;

  /** BSE remarks */
  bseRemarks: string;
}

/**
 * Request parameters for allotment statement.
 */
export interface AllotmentStatementRequest {
  /** Order ID */
  orderId: number;

  /** Client Code */
  clientCode: string;
}

/**
 * Response from allotment statement.
 */
export interface AllotmentStatementResponse {
  /** Order ID */
  orderId: number;

  /** Client Code */
  clientCode: string;

  /** Scheme name */
  schemeName: string;

  /** NAV */
  nav: number;

  /** Units allocated */
  units: number;

  /** Amount invested */
  amount: number;

  /** Allotment date */
  allotmentDate: string;

  /** Folio number */
  folioNumber: string;
}

/**
 * Request parameters for redemption statement.
 */
export interface RedemptionStatementRequest {
  /** Order ID */
  orderId: number;

  /** Client Code */
  clientCode: string;
}

/**
 * Response from redemption statement.
 */
export interface RedemptionStatementResponse {
  /** Order ID */
  orderId: number;

  /** Client Code */
  clientCode: string;

  /** Scheme name */
  schemeName: string;

  /** NAV */
  nav: number;

  /** Units redeemed */
  units: number;

  /** Amount redeemed */
  amount: number;

  /** Redemption date */
  redemptionDate: string;

  /** Folio number */
  folioNumber: string;
}

/**
 * Request parameters for payment gateway.
 */
export interface PaymentGatewayRequest {
  /** Order ID to pay for */
  orderId: number;

  /** Payment amount in INR */
  amount: number;

  /** Client Code */
  clientCode: string;

  /** URL to redirect after payment */
  returnUrl: string;

  /** Payment mode */
  paymentMode?: 'NETBANKING' | 'UPI' | 'DEBITCARD';

  /** Bank code for net banking */
  bankCode?: string;
}

/**
 * Response from payment gateway.
 */
export interface PaymentGatewayResponse {
  /** Payment URL to redirect user to */
  paymentUrl: string;

  /** Transaction ID for tracking */
  transactionId: string;
}

/**
 * Request parameters for payment status check.
 */
export interface PaymentStatusRequest {
  /** Transaction ID from payment gateway */
  transactionId: string;
}

/**
 * Response from payment status check.
 */
export interface PaymentStatusResponse {
  /** Transaction ID */
  transactionId: string;

  /** Status: 'Pending', 'Success', 'Failed' */
  status: 'Pending' | 'Success' | 'Failed';

  /** Payment amount */
  amount: number;

  /** Payment date */
  paymentDate?: string;

  /** BSE remarks */
  bseRemarks?: string;
}

/**
 * Request parameters for STP registration.
 */
export interface STPRegistrationRequest {
  /** Client Code */
  clientCode: string;

  /** Source scheme BSE Code (withdrawal) */
  fromSchemeCode: string;

  /** Target scheme BSE Code (investment) */
  toSchemeCode: string;

  /** STP type: 'FIXED' or 'PERCENT' */
  stpType: 'FIXED' | 'PERCENT';

  /** Transfer amount in INR */
  amount?: number;

  /** Transfer as percentage of units */
  percent?: number;

  /** Frequency: 'DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY' */
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY';

  /** First transfer date in DD/MM/YYYY format */
  startDate: string;

  /** Last transfer date in DD/MM/YYYY format */
  endDate?: string;

  /** Number of transfers */
  noOfInstallments?: number;

  /** Existing folio number */
  folioNumber?: string;

  /** Sub-broker code */
  subBrokerCode?: string;

  /** EUIN */
  euin?: string;

  /** 'Y' if EUIN declared */
  euinDeclaration?: YesNo;

  /** Remarks */
  remarks?: string;
}

/**
 * Request parameters for STP cancellation.
 */
export interface STPCancellationRequest {
  /** STP Registration ID to cancel */
  stpRegId: number;

  /** Cancellation remarks */
  remarks?: string;
}

/**
 * Response from STP operations.
 */
export interface STPResponse {
  /** Transaction code */
  transCode: string;

  /** Transaction number */
  transNo: string;

  /** STP Registration ID */
  stpRegId: number;

  /** Status */
  status: string;

  /** BSE remarks */
  bseRemarks: string;
}
