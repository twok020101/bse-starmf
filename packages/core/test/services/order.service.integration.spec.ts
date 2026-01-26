import { jest } from '@jest/globals';
import { SessionManager } from '../../src/auth/session-manager';
import { PasswordEncryptor } from '../../src/encryption/password-encryptor';
import { OrderService } from '../../src/services/order.service';
import { PurchaseResponse } from '../../src/types/api.types';
import { createMockEncryptor, createMockSessionManager, TEST_CONFIG } from '../mocks/mock-helpers';

type OrderServiceExecuteRequest = (
  methodName: string,
  params: Record<string, unknown>
) => Promise<PurchaseResponse>;

describe('OrderService Integration Tests', () => {
  let orderService: OrderService;
  let mockSessionManager: jest.Mocked<SessionManager>;
  let mockEncryptor: jest.Mocked<PasswordEncryptor>;
  let mockExecuteRequest: jest.Mock<Promise<PurchaseResponse>, [string, Record<string, unknown>]>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSessionManager = createMockSessionManager() as jest.Mocked<SessionManager>;
    mockEncryptor = createMockEncryptor() as jest.Mocked<PasswordEncryptor>;
    orderService = new OrderService(TEST_CONFIG, mockSessionManager, mockEncryptor);
    mockExecuteRequest = jest.fn<Promise<PurchaseResponse>, [string, Record<string, unknown>]>();
    (orderService as unknown as { executeRequest: typeof mockExecuteRequest }).executeRequest =
      mockExecuteRequest;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('purchase', () => {
    it('should successfully place a purchase order', async () => {
      mockExecuteRequest.mockResolvedValue({
        transCode: 'NEW',
        transNo: '20260126123456000001',
        orderId: 12345678,
        userId: 'TESTUSER',
        memberId: 'TESTMEMBER',
        clientCode: 'UCC001',
        bseRemarks: 'Order Confirmed Successfully',
        successFlag: '0',
      });

      const result = await orderService.purchase({
        clientCode: 'UCC001',
        schemeCode: '119603',
        amount: 5000,
      });

      expect(result.transCode).toBe('NEW');
      expect(result.orderId).toBe(12345678);
      expect(result.clientCode).toBe('UCC001');
      expect(result.successFlag).toBe('0');
      expect(result.bseRemarks).toBe('Order Confirmed Successfully');
    });

    it('should place purchase with quantity instead of amount', async () => {
      mockExecuteRequest.mockResolvedValue({
        transCode: 'NEW',
        transNo: '20260126123456000002',
        orderId: 12345678,
        userId: 'TESTUSER',
        memberId: 'TESTMEMBER',
        clientCode: 'UCC001',
        bseRemarks: 'Order Confirmed Successfully',
        successFlag: '0',
      });

      const result = await orderService.purchase({
        clientCode: 'UCC001',
        schemeCode: '119603',
        quantity: 28.456,
      });

      expect(result.orderId).toBe(12345678);
    });

    it('should handle order rejection', async () => {
      mockExecuteRequest.mockResolvedValue({
        transCode: 'NEW',
        transNo: '20260126123456000003',
        orderId: 0,
        userId: '',
        memberId: 'TESTMEMBER',
        clientCode: 'UCC001',
        bseRemarks: 'Insufficient Units',
        successFlag: '1',
      });

      const result = await orderService.purchase({
        clientCode: 'UCC001',
        schemeCode: '119603',
        amount: 5000,
      });

      expect(result.successFlag).toBe('1');
      expect(result.bseRemarks).toBe('Insufficient Units');
    });

    it('should include optional parameters when provided', async () => {
      mockExecuteRequest.mockResolvedValue({
        transCode: 'NEW',
        transNo: '20260126123456000004',
        orderId: 12345678,
        userId: 'TESTUSER',
        memberId: 'TESTMEMBER',
        clientCode: 'UCC001',
        bseRemarks: 'Order Confirmed Successfully',
        successFlag: '0',
      });

      await orderService.purchase({
        clientCode: 'UCC001',
        schemeCode: '119603',
        amount: 5000,
        folioNumber: '12345678',
        remarks: 'Test purchase',
        subBrokerCode: 'SB001',
        euin: 'E12345',
        euinDeclaration: 'Y',
      });

      expect(mockExecuteRequest).toHaveBeenCalledWith(
        'orderEntryParam',
        expect.objectContaining({
          FolioNo: '12345678',
          Remarks: 'Test purchase',
        })
      );
    });

    it('should throw error for empty response', async () => {
      const { BSEError } = require('../../src/errors/bse-error');
      mockExecuteRequest.mockRejectedValue(
        new BSEError('EMPTY_RESPONSE', 'Received empty response from BSE')
      );

      await expect(
        orderService.purchase({
          clientCode: 'UCC001',
          schemeCode: '119603',
          amount: 5000,
        })
      ).rejects.toThrow('Received empty response from BSE');
    });
  });

  describe('redeem', () => {
    it('should successfully place a redemption order', async () => {
      mockExecuteRequest.mockResolvedValue({
        transCode: 'NEW',
        transNo: '20260126123456000005',
        orderId: 12345679,
        userId: 'TESTUSER',
        memberId: 'TESTMEMBER',
        clientCode: 'UCC001',
        bseRemarks: 'Redemption Order Confirmed',
        successFlag: '0',
      });

      const result = await orderService.redeem({
        clientCode: 'UCC001',
        schemeCode: '119603',
        amount: 5000,
      });

      expect(result.transCode).toBe('NEW');
      expect(result.orderId).toBe(12345679);
      expect(result.successFlag).toBe('0');
      expect(result.bseRemarks).toBe('Redemption Order Confirmed');
    });

    it('should place redemption with quantity', async () => {
      mockExecuteRequest.mockResolvedValue({
        transCode: 'NEW',
        transNo: '20260126123456000006',
        orderId: 12345679,
        userId: 'TESTUSER',
        memberId: 'TESTMEMBER',
        clientCode: 'UCC001',
        bseRemarks: 'Redemption Order Confirmed',
        successFlag: '0',
      });

      const result = await orderService.redeem({
        clientCode: 'UCC001',
        schemeCode: '119603',
        quantity: 28.456,
      });

      expect(result.orderId).toBe(12345679);
    });

    it('should handle all redeem flag', async () => {
      mockExecuteRequest.mockResolvedValue({
        transCode: 'NEW',
        transNo: '20260126123456000007',
        orderId: 12345679,
        userId: 'TESTUSER',
        memberId: 'TESTMEMBER',
        clientCode: 'UCC001',
        bseRemarks: 'Redemption Order Confirmed',
        successFlag: '0',
      });

      const result = await orderService.redeem({
        clientCode: 'UCC001',
        schemeCode: '119603',
        allRedeem: 'Y',
      });

      expect(result.successFlag).toBe('0');
    });

    it('should handle invalid scheme response', async () => {
      mockExecuteRequest.mockResolvedValue({
        transCode: 'NEW',
        transNo: '20260126123456000008',
        orderId: 0,
        userId: '',
        memberId: 'TESTMEMBER',
        clientCode: 'UCC001',
        bseRemarks: 'Invalid Scheme Code',
        successFlag: '1',
      });

      const result = await orderService.redeem({
        clientCode: 'UCC001',
        schemeCode: 'INVALID',
        amount: 5000,
      });

      expect(result.successFlag).toBe('1');
      expect(result.bseRemarks).toBe('Invalid Scheme Code');
    });
  });

  describe('transaction number generation', () => {
    it('should generate unique transaction numbers', async () => {
      mockExecuteRequest.mockResolvedValueOnce({
        transCode: 'NEW',
        transNo: '20260126123456000009',
        orderId: 12345678,
        userId: 'TESTUSER',
        memberId: 'TESTMEMBER',
        clientCode: 'UCC001',
        bseRemarks: 'Order Confirmed',
        successFlag: '0',
      });

      const result1 = await orderService.purchase({
        clientCode: 'UCC001',
        schemeCode: '119603',
        amount: 5000,
      });

      mockExecuteRequest.mockResolvedValueOnce({
        transCode: 'NEW',
        transNo: '20260126123456000010',
        orderId: 12345679,
        userId: 'TESTUSER',
        memberId: 'TESTMEMBER',
        clientCode: 'UCC002',
        bseRemarks: 'Order Confirmed',
        successFlag: '0',
      });

      const result2 = await orderService.purchase({
        clientCode: 'UCC002',
        schemeCode: '119603',
        amount: 3000,
      });

      expect(result1.transNo).not.toBe(result2.transNo);
    });

    it('should include member ID in transaction number', async () => {
      mockExecuteRequest.mockResolvedValue({
        transCode: 'NEW',
        transNo: '20260126123456000011TESTMEMBER000001',
        orderId: 12345678,
        userId: 'TESTUSER',
        memberId: 'TESTMEMBER',
        clientCode: 'UCC001',
        bseRemarks: 'Order Confirmed',
        successFlag: '0',
      });

      const result = await orderService.purchase({
        clientCode: 'UCC001',
        schemeCode: '119603',
        amount: 5000,
      });

      expect(result.transNo).toContain('TESTMEMBER');
    });
  });
});
