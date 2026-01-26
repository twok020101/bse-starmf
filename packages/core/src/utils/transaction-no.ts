/**
 * Generates unique transaction numbers for BSE StAR MF orders.
 *
 * Transaction number format: YYYYMMDD + MemberID + 6-digit counter
 * Example: 20260126MEMBER000001
 *
 * The counter resets at the start of each new day.
 *
 * @example
 * ```typescript
 * const generator = new TransactionNoGenerator('MEMBER001');
 * const transNo1 = generator.generate(); // 20260126MEMBER000001
 * const transNo2 = generator.generate(); // 20260126MEMBER000002
 * ```
 */
export class TransactionNoGenerator {
  private memberId: string;
  private counter: number;
  private lastDate: Date;

  /**
   * Creates a new TransactionNoGenerator.
   *
   * @param memberId - The BSE member/ARN ID to include in transaction numbers
   */
  constructor(memberId: string) {
    this.memberId = memberId;
    this.counter = 0;
    this.lastDate = new Date();
  }

  /**
   * Generates a unique transaction number.
   *
   * Format: YYYYMMDD{MemberId}{6-digit-counter}
   *
   * @returns {string} Unique transaction number
   */
  generate(): string {
    const now = new Date();

    if (this.isNewDay(now)) {
      this.counter = 0;
      this.lastDate = now;
    }

    this.counter++;
    const datePart = this.formatDate(now);
    const counterPart = this.counter.toString().padStart(6, '0');

    return `${datePart}${this.memberId}${counterPart}`;
  }

  private isNewDay(date: Date): boolean {
    return (
      date.getFullYear() !== this.lastDate.getFullYear() ||
      date.getMonth() !== this.lastDate.getMonth() ||
      date.getDate() !== this.lastDate.getDate()
    );
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}${month}${day}`;
  }

  /**
   * Resets the counter to zero.
   *
   * Normally called automatically at the start of each new day,
   * but can be manually reset if needed.
   */
  reset(): void {
    this.counter = 0;
    this.lastDate = new Date();
  }
}
