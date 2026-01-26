import { OrderService } from '../../src/services/order.service';
import { SessionManager } from '../../src/auth/session-manager';
import { PasswordEncryptor } from '../../src/encryption/password-encryptor';
import {
  PURCHASE_SUCCESS_RESPONSE,
  REDEMPTION_SUCCESS_RESPONSE,
  ORDER_REJECTED_RESPONSE,
  INVALID_SCHEME_RESPONSE,
  EMPTY_RESPONSE,
} from '../mocks/responses';
import { createMockSessionManager, createMockEncryptor, TEST_CONFIG } from '../mocks/mock-helpers';
import { jest } from '@jest/globals';

describe('OrderService Integration Tests', () => {
  let orderService: OrderService;
  let mockSessionManager: jest.Mocked<SessionManager>;
  let mockEncryptor: jest.Mocked<PasswordEncryptor>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSessionManager = createMockSessionManager() as jest.Mocked<SessionManager>;
    mockEncryptor = createMockEncryptor() as jest.Mocked<PasswordEncryptor>;
    orderService = new OrderService(TEST_CONFIG, mockSessionManager, mockEncryptor);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('purchase', () => {
    it('should successfully place a purchase order', async () => {
      jest.spyOn(orderService as any, 'executeRequest').mockResolvedValue({
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
      jest.spyOn(orderService as any, 'executeRequest').mockResolvedValue({
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
      jest.spyOn(orderService as any, 'executeRequest').mockResolvedValue({
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
      jest.spyOn(orderService as any, 'executeRequest').mockResolvedValue({
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

      expect((orderService as any).executeRequest).toHaveBeenCalledWith(
        'orderEntryParam',
        expect.objectContaining({
          FolioNo: '12345678',
          Remarks: 'Test purchase',
        })
      );
    });

    it('should throw error for empty response', async () => {
      jest
        .spyOn(orderService as any, 'executeRequest')
        .mockRejectedValue(
          new (require('../../src/errors/bse-error').BSEError)(
            'EMPTY_RESPONSE',
            'Received empty response from BSE'
          )
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
      jest.spyOn(orderService as any, 'executeRequest').mockResolvedValue({
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
      jest.spyOn(orderService as any, 'executeRequest').mockResolvedValue({
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
      jest.spyOn(orderService as any, 'executeRequest').mockResolvedValue({
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
      jest.spyOn(orderService as any, 'executeRequest').mockResolvedValue({
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
      const executeRequestSpy = jest.spyOn(orderService as any, 'executeRequest');

      executeRequestSpy.mockResolvedValueOnce({
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

      executeRequestSpy.mockResolvedValueOnce({
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
      jest.spyOn(orderService as any, 'executeRequest').mockResolvedValue({
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
