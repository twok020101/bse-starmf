export class TransactionNoGenerator {
  private memberId: string;
  private counter: number;
  private lastDate: Date;

  constructor(memberId: string) {
    this.memberId = memberId;
    this.counter = 0;
    this.lastDate = new Date();
  }

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

  reset(): void {
    this.counter = 0;
    this.lastDate = new Date();
  }
}
