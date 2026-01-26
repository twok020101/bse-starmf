import { TransactionNoGenerator } from '../../src/utils/transaction-no';

describe('TransactionNoGenerator', () => {
  const memberId = 'TESTMEM';

  describe('generate', () => {
    it('should generate a transaction number with correct format', () => {
      const generator = new TransactionNoGenerator(memberId);
      const transNo = generator.generate();

      expect(transNo).toMatch(/^\d{8}TESTMEM\d{6}$/);
    });

    it('should include current date in YYYYMMDD format', () => {
      const generator = new TransactionNoGenerator(memberId);
      const transNo = generator.generate();
      const today = new Date();
      const datePart = `${today.getFullYear()}${(today.getMonth() + 1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}`;

      expect(transNo.startsWith(datePart)).toBe(true);
    });

    it('should include member ID in the transaction number', () => {
      const generator = new TransactionNoGenerator(memberId);
      const transNo = generator.generate();

      expect(transNo).toContain(memberId);
    });

    it('should generate unique transaction numbers for consecutive calls', () => {
      const generator = new TransactionNoGenerator(memberId);
      const transNo1 = generator.generate();
      const transNo2 = generator.generate();

      expect(transNo1).not.toBe(transNo2);
    });

    it('should increment counter for consecutive calls', () => {
      const generator = new TransactionNoGenerator(memberId);
      const transNo1 = generator.generate();
      const transNo2 = generator.generate();

      const counter1 = transNo1.slice(-6);
      const counter2 = transNo2.slice(-6);
      const counterNum1 = parseInt(counter1, 10);
      const counterNum2 = parseInt(counter2, 10);

      expect(counterNum2).toBe(counterNum1 + 1);
    });

    it('should reset counter when day changes', () => {
      const generator = new TransactionNoGenerator(memberId);
      const transNo1 = generator.generate();
      const transNo2 = generator.generate();

      generator.reset();

      const transNo3 = generator.generate();
      expect(transNo3.slice(-6)).toBe('000001');
    });
  });

  describe('reset', () => {
    it('should reset counter to 0', () => {
      const generator = new TransactionNoGenerator(memberId);
      generator.generate();
      generator.generate();

      generator.reset();

      const transNo = generator.generate();
      expect(transNo.endsWith('000001')).toBe(true);
    });
  });
});
