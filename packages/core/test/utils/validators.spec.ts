import {
  validatePurchaseParams,
  validateSIPParams,
  validateClientParams,
  PANSchema,
  MobileNoSchema,
  EmailSchema,
  DateSchema,
} from '../../src/utils/validators';

describe('Validators', () => {
  describe('validatePurchaseParams', () => {
    it('should throw error when no amount, quantity, or allRedeem specified', () => {
      expect(() => {
        validatePurchaseParams({});
      }).toThrow('Either amount, quantity, or allRedeem=Y must be specified');
    });

    it('should throw error when amount is 0', () => {
      expect(() => {
        validatePurchaseParams({ amount: 0 });
      }).toThrow('Either amount, quantity, or allRedeem=Y must be specified');
    });

    it('should throw error when quantity is 0', () => {
      expect(() => {
        validatePurchaseParams({ quantity: 0 });
      }).toThrow('Either amount, quantity, or allRedeem=Y must be specified');
    });

    it('should accept valid amount', () => {
      expect(() => {
        validatePurchaseParams({ amount: 5000 });
      }).not.toThrow();
    });

    it('should accept valid quantity', () => {
      expect(() => {
        validatePurchaseParams({ quantity: 100 });
      }).not.toThrow();
    });

    it('should accept allRedeem=Y', () => {
      expect(() => {
        validatePurchaseParams({ allRedeem: 'Y' });
      }).not.toThrow();
    });

    it('should throw error when both amount and quantity specified', () => {
      expect(() => {
        validatePurchaseParams({ amount: 5000, quantity: 100 });
      }).toThrow('Cannot specify both amount and quantity');
    });

    it('should not throw when amount is positive and quantity is 0', () => {
      expect(() => {
        validatePurchaseParams({ amount: 5000, quantity: 0 });
      }).not.toThrow();
    });
  });

  describe('validateSIPParams', () => {
    it('should throw error when frequency is missing', () => {
      expect(() => {
        validateSIPParams({});
      }).toThrow('Frequency is required for SIP');
    });

    it('should throw error when noOfInstallments is less than 1', () => {
      expect(() => {
        validateSIPParams({ frequency: 'MONTHLY', noOfInstallments: 0 });
      }).toThrow('No of installments must be at least 1');
    });

    it('should throw error when noOfInstallments is undefined', () => {
      expect(() => {
        validateSIPParams({ frequency: 'MONTHLY' });
      }).toThrow('No of installments must be at least 1');
    });

    it('should throw error when DAILY frequency without endDate', () => {
      expect(() => {
        validateSIPParams({
          frequency: 'DAILY',
          noOfInstallments: 12,
          amount: 1000,
          startDate: '01/01/2024',
        });
      }).toThrow('End date is required for daily SIP');
    });

    it('should accept valid MONTHLY SIP params', () => {
      expect(() => {
        validateSIPParams({
          frequency: 'MONTHLY',
          noOfInstallments: 12,
          amount: 1000,
          startDate: '01/01/2024',
        });
      }).not.toThrow();
    });

    it('should accept valid DAILY SIP params with endDate', () => {
      expect(() => {
        validateSIPParams({
          frequency: 'DAILY',
          noOfInstallments: 30,
          amount: 500,
          startDate: '01/01/2024',
          endDate: '30/01/2024',
        });
      }).not.toThrow();
    });
  });

  describe('validateClientParams', () => {
    it('should throw error when firstName is missing', () => {
      expect(() => {
        validateClientParams({});
      }).toThrow('First name is required');
    });

    it('should throw error when PAN is missing', () => {
      expect(() => {
        validateClientParams({ firstName: 'John' });
      }).toThrow('PAN is required');
    });

    it('should throw error for invalid PAN format', () => {
      expect(() => {
        validateClientParams({
          firstName: 'John',
          pan: 'INVALID',
        });
      }).toThrow('Invalid PAN format');
    });

    it('should throw error when mobile is missing', () => {
      expect(() => {
        validateClientParams({
          firstName: 'John',
          pan: 'ABCDE1234F',
        });
      }).toThrow('Mobile number is required');
    });

    it('should throw error for invalid mobile number', () => {
      expect(() => {
        validateClientParams({
          firstName: 'John',
          pan: 'ABCDE1234F',
          mobile: '5123456789',
          email: 'john@example.com',
          address1: '123 Main St',
          city: 'Mumbai',
          pinCode: '400001',
          bankAccountNo: '1234567890',
          ifscCode: 'HDFC0001234',
        });
      }).toThrow('Invalid Indian mobile number');
    });

    it('should throw error when email is missing', () => {
      expect(() => {
        validateClientParams({
          firstName: 'John',
          pan: 'ABCDE1234F',
          mobile: '9876543210',
        });
      }).toThrow('Email is required');
    });

    it('should accept valid client params', () => {
      expect(() => {
        validateClientParams({
          firstName: 'John',
          pan: 'ABCDE1234F',
          mobile: '9876543210',
          email: 'john@example.com',
          address1: '123 Main St',
          city: 'Mumbai',
          pinCode: '400001',
          bankAccountNo: '1234567890',
          ifscCode: 'HDFC0001234',
        });
      }).not.toThrow();
    });
  });

  describe('PANSchema', () => {
    it('should validate correct PAN format', () => {
      expect(PANSchema.safeParse('ABCDE1234F').success).toBe(true);
    });

    it('should reject invalid PAN format', () => {
      expect(PANSchema.safeParse('ABC12345F').success).toBe(false);
      expect(PANSchema.safeParse('ABCDE1234').success).toBe(false);
      expect(PANSchema.safeParse('abcde1234f').success).toBe(false);
    });
  });

  describe('MobileNoSchema', () => {
    it('should validate correct Indian mobile numbers', () => {
      expect(MobileNoSchema.safeParse('9876543210').success).toBe(true);
      expect(MobileNoSchema.safeParse('9876543210').success).toBe(true);
    });

    it('should reject invalid mobile numbers', () => {
      expect(MobileNoSchema.safeParse('1234567890').success).toBe(false);
      expect(MobileNoSchema.safeParse('987654321').success).toBe(false);
    });
  });

  describe('EmailSchema', () => {
    it('should validate correct email format', () => {
      expect(EmailSchema.safeParse('test@example.com').success).toBe(true);
    });

    it('should reject invalid email format', () => {
      expect(EmailSchema.safeParse('invalid-email').success).toBe(false);
      expect(EmailSchema.safeParse('missing@domain').success).toBe(false);
    });
  });

  describe('DateSchema', () => {
    it('should validate correct DD/MM/YYYY format', () => {
      expect(DateSchema.safeParse('01/01/2024').success).toBe(true);
      expect(DateSchema.safeParse('31/12/2024').success).toBe(true);
    });

    it('should reject invalid date format', () => {
      expect(DateSchema.safeParse('2024-01-01').success).toBe(false);
      expect(DateSchema.safeParse('01-01-2024').success).toBe(false);
    });
  });
});
