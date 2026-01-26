/**
 * BSE StAR MF environment type.
 *
 * - `test`: BSE StAR MF Demo environment for testing
 * - `production`: BSE StAR MF Production environment for live transactions
 */
export type Environment = 'test' | 'production';

/**
 * Transaction code for BSE API operations.
 *
 * - `NEW`: Create a new transaction
 * - `MOD`: Modify an existing transaction
 * - `CXL`: Cancel an existing transaction
 */
export type TransactionCode = 'NEW' | 'MOD' | 'CXL';

/**
 * Buy/Sell indicator for orders.
 *
 * - `P`: Purchase (Buy)
 * - `R`: Redemption (Sell)
 */
export type BuySell = 'P' | 'R';

/**
 * Buy/Sell type for fresh or additional transactions.
 *
 * - `FRESH`: New investment
 * - `ADDITIONAL`: Additional purchase into existing holding
 */
export type BuySellType = 'FRESH' | 'ADDITIONAL';

/**
 * Demat transaction type for purchase/redemption.
 *
 * - `C`: Cascade (through depository)
 * - `N`: NCD (Non-Cascade)
 * - `P`: Physical (without depository)
 */
export type DPTransaction = 'C' | 'N' | 'P';

/**
 * Yes/No indicator for various options.
 */
export type YesNo = 'Y' | 'N';

/**
 * SIP frequency for periodic investments.
 *
 * - `DAILY`: Every trading day
 * - `WEEKLY`: Once per week
 * - `MONTHLY`: Once per month (default)
 * - `QUARTERLY`: Once per quarter
 */
export type SIPFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY';
