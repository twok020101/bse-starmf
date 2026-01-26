import { z } from 'zod';

export const TransactionNoSchema = z.string().regex(
  /^\d{8}[A-Z0-9]+\d{6}$/,
  'Invalid transaction number format'
);

export const AmountSchema = z.number().positive().multipleOf(0.001);

export const PANSchema = z.string().regex(
  /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
  'Invalid PAN format'
);

export const MobileNoSchema = z.string().regex(
  /^[6-9]\d{9}$/,
  'Invalid Indian mobile number'
);

export const EmailSchema = z.string().email();

export const DateSchema = z.string().regex(
  /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/,
  'Date must be in DD/MM/YYYY format'
);

export function validatePurchaseParams(params: {
  amount?: number;
  quantity?: number;
  allRedeem?: string;
}): void {
  const hasAmount = params.amount !== undefined && params.amount > 0;
  const hasQuantity = params.quantity !== undefined && params.quantity > 0;
  const isAllRedeem = params.allRedeem === 'Y';

  if (!hasAmount && !hasQuantity && !isAllRedeem) {
    throw new Error('Either amount, quantity, or allRedeem=Y must be specified');
  }

  if (hasAmount && hasQuantity) {
    throw new Error('Cannot specify both amount and quantity');
  }
}

export function validateSIPParams(params: {
  startDate?: string;
  endDate?: string;
  frequency?: string;
  noOfInstallments?: number;
  amount?: number;
}): void {
  if (!params.frequency) {
    throw new Error('Frequency is required for SIP');
  }

  if (!params.noOfInstallments || params.noOfInstallments < 1) {
    throw new Error('No of installments must be at least 1');
  }

  if (params.frequency === 'DAILY' && !params.endDate) {
    throw new Error('End date is required for daily SIP');
  }
}

export function validateClientParams(params: {
  firstName?: string;
  pan?: string;
  mobile?: string;
  email?: string;
  address1?: string;
  city?: string;
  pinCode?: string;
  bankAccountNo?: string;
  ifscCode?: string;
}): void {
  if (!params.firstName) {
    throw new Error('First name is required');
  }

  if (!params.pan) {
    throw new Error('PAN is required');
  }

  if (params.pan && !PANSchema.safeParse(params.pan).success) {
    throw new Error('Invalid PAN format');
  }

  if (!params.mobile) {
    throw new Error('Mobile number is required');
  }

  if (params.mobile && !MobileNoSchema.safeParse(params.mobile).success) {
    throw new Error('Invalid Indian mobile number');
  }

  if (!params.email) {
    throw new Error('Email is required');
  }

  if (!params.address1) {
    throw new Error('Address is required');
  }

  if (!params.city) {
    throw new Error('City is required');
  }

  if (!params.pinCode) {
    throw new Error('PIN code is required');
  }

  if (!params.bankAccountNo) {
    throw new Error('Bank account number is required');
  }

  if (!params.ifscCode) {
    throw new Error('IFSC code is required');
  }
}

export function validateSwitchParams(params: {
  amount?: number;
  quantity?: number;
  allRedeem?: string;
  switchSchemeCode?: string;
}): void {
  const hasAmount = params.amount !== undefined && params.amount > 0;
  const hasQuantity = params.quantity !== undefined && params.quantity > 0;
  const isAllRedeem = params.allRedeem === 'Y';

  if (!params.switchSchemeCode) {
    throw new Error('Switch scheme code is required');
  }

  if (!hasAmount && !hasQuantity && !isAllRedeem) {
    throw new Error('Either amount, quantity, or allRedeem=Y must be specified');
  }

  if (hasAmount && hasQuantity) {
    throw new Error('Cannot specify both amount and quantity');
  }
}

export function validateSpreadParams(params: {
  amount?: number;
  redeemDate?: string;
}): void {
  if (!params.amount || params.amount <= 0) {
    throw new Error('Valid amount is required for spread order');
  }

  if (!params.redeemDate) {
    throw new Error('Redeem date is required for spread order');
  }

  if (!DateSchema.safeParse(params.redeemDate).success) {
    throw new Error('Redeem date must be in DD/MM/YYYY format');
  }
}
