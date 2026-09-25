import { v4 as uuidv4 } from 'uuid';
import { store, Wallet, LedgerEntry, Withdrawal } from '../../database/data-store';
import { ApiError } from '../../common/errors/api-error';
import { config } from '../../config';
import { AuditService } from '../../common/utils/audit';

export class WalletService {
  static getWallet(userId: string): Wallet {
    let wallet = store.wallets.get(userId);
    if (!wallet) {
      wallet = {
        id: uuidv4(),
        user_id: userId,
        deposit_balance: 0.0,
        winnings_balance: 0.0,
        bonus_balance: 0.0,
        locked_balance: 0.0,
        currency: 'INR',
        is_frozen: false,
        updated_at: new Date().toISOString(),
      };
      store.wallets.set(userId, wallet);
    }
    return wallet;
  }

  static getLedgerHistory(userId: string, limit = 50): LedgerEntry[] {
    return store.ledger
      .filter((entry) => entry.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
  }

  /**
   * Atomic credit to wallet with immutable ledger entry
   */
  static async credit(params: {
    userId: string;
    amount: number;
    balanceType: 'DEPOSIT' | 'WINNINGS' | 'BONUS';
    category: 'DEPOSIT' | 'PRIZE' | 'REFUND' | 'REFERRAL' | 'BONUS' | 'ADJUSTMENT';
    referenceType: string;
    referenceId: string;
    description: string;
    idempotencyKey?: string;
  }): Promise<{ wallet: Wallet; ledgerEntry: LedgerEntry }> {
    if (params.amount <= 0) {
      throw ApiError.badRequest('Credit amount must be greater than zero');
    }

    if (params.idempotencyKey) {
      const existingEntry = store.ledger.find((l) => l.idempotency_key === params.idempotencyKey);
      if (existingEntry) {
        return { wallet: this.getWallet(params.userId), ledgerEntry: existingEntry };
      }
    }

    const wallet = this.getWallet(params.userId);
    if (wallet.is_frozen) {
      throw ApiError.forbidden('Wallet is frozen. Contact customer support.', 'WALLET_FROZEN');
    }

    // Update specific balance
    if (params.balanceType === 'DEPOSIT') {
      wallet.deposit_balance = Number((wallet.deposit_balance + params.amount).toFixed(2));
    } else if (params.balanceType === 'WINNINGS') {
      wallet.winnings_balance = Number((wallet.winnings_balance + params.amount).toFixed(2));
    } else if (params.balanceType === 'BONUS') {
      wallet.bonus_balance = Number((wallet.bonus_balance + params.amount).toFixed(2));
    }
    wallet.updated_at = new Date().toISOString();

    const totalCurrentBalance = Number(
      (wallet.deposit_balance + wallet.winnings_balance + wallet.bonus_balance).toFixed(2)
    );

    const ledgerEntry: LedgerEntry = {
      id: uuidv4(),
      wallet_id: wallet.id,
      user_id: params.userId,
      transaction_id: `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      entry_type: 'CREDIT',
      balance_type: params.balanceType,
      amount: params.amount,
      balance_after: totalCurrentBalance,
      category: params.category,
      reference_type: params.referenceType,
      reference_id: params.referenceId,
      description: params.description,
      idempotency_key: params.idempotencyKey,
      created_at: new Date().toISOString(),
    };

    store.ledger.unshift(ledgerEntry);

    return { wallet, ledgerEntry };
  }

  /**
   * Atomic debit from wallet (prioritizing Bonus -> Deposit -> Winnings for entry fee, or strictly Winnings for withdrawal)
   */
  static async debit(params: {
    userId: string;
    amount: number;
    preferredBalanceType?: 'DEPOSIT' | 'WINNINGS' | 'BONUS' | 'AUTO';
    category: 'TOURNAMENT_ENTRY' | 'WITHDRAWAL' | 'ADJUSTMENT';
    referenceType: string;
    referenceId: string;
    description: string;
    idempotencyKey?: string;
  }): Promise<{ wallet: Wallet; ledgerEntries: LedgerEntry[] }> {
    if (params.amount <= 0) {
      throw ApiError.badRequest('Debit amount must be greater than zero');
    }

    if (params.idempotencyKey) {
      const existingEntries = store.ledger.filter((l) => l.idempotency_key === params.idempotencyKey);
      if (existingEntries.length > 0) {
        return { wallet: this.getWallet(params.userId), ledgerEntries: existingEntries };
      }
    }

    const wallet = this.getWallet(params.userId);
    if (wallet.is_frozen) {
      throw ApiError.forbidden('Wallet is frozen. Cannot process transactions.', 'WALLET_FROZEN');
    }

    // Check total available balance
    const totalAvailable = wallet.deposit_balance + wallet.winnings_balance + wallet.bonus_balance;
    if (totalAvailable < params.amount) {
      throw ApiError.badRequest(
        `Insufficient balance. Available: ₹${totalAvailable.toFixed(2)}, Required: ₹${params.amount.toFixed(2)}`,
        'INSUFFICIENT_BALANCE'
      );
    }

    let remainingToDebit = params.amount;
    const entries: LedgerEntry[] = [];

    // Deduction strategy for tournament entries: Bonus (max 10%) -> Deposit -> Winnings
    if (params.category === 'TOURNAMENT_ENTRY') {
      // 1. Bonus deduction (up to 10% of entry fee or available bonus)
      const maxBonusUsable = Math.min(wallet.bonus_balance, Number((params.amount * 0.1).toFixed(2)));
      if (maxBonusUsable > 0) {
        wallet.bonus_balance = Number((wallet.bonus_balance - maxBonusUsable).toFixed(2));
        remainingToDebit = Number((remainingToDebit - maxBonusUsable).toFixed(2));

        entries.push({
          id: uuidv4(),
          wallet_id: wallet.id,
          user_id: params.userId,
          transaction_id: `TXN-DEB-BONUS-${Date.now()}`,
          entry_type: 'DEBIT',
          balance_type: 'BONUS',
          amount: maxBonusUsable,
          balance_after: Number((wallet.deposit_balance + wallet.winnings_balance + wallet.bonus_balance).toFixed(2)),
          category: 'TOURNAMENT_ENTRY',
          reference_type: params.referenceType,
          reference_id: params.referenceId,
          description: `${params.description} (Bonus Portion)`,
          idempotency_key: params.idempotencyKey ? `${params.idempotencyKey}-bonus` : undefined,
          created_at: new Date().toISOString(),
        });
      }

      // 2. Deposit deduction
      if (remainingToDebit > 0 && wallet.deposit_balance > 0) {
        const debitFromDeposit = Math.min(wallet.deposit_balance, remainingToDebit);
        wallet.deposit_balance = Number((wallet.deposit_balance - debitFromDeposit).toFixed(2));
        remainingToDebit = Number((remainingToDebit - debitFromDeposit).toFixed(2));

        entries.push({
          id: uuidv4(),
          wallet_id: wallet.id,
          user_id: params.userId,
          transaction_id: `TXN-DEB-DEP-${Date.now()}`,
          entry_type: 'DEBIT',
          balance_type: 'DEPOSIT',
          amount: debitFromDeposit,
          balance_after: Number((wallet.deposit_balance + wallet.winnings_balance + wallet.bonus_balance).toFixed(2)),
          category: 'TOURNAMENT_ENTRY',
          reference_type: params.referenceType,
          reference_id: params.referenceId,
          description: `${params.description} (Deposit Portion)`,
          idempotency_key: params.idempotencyKey ? `${params.idempotencyKey}-dep` : undefined,
          created_at: new Date().toISOString(),
        });
      }

      // 3. Winnings deduction
      if (remainingToDebit > 0) {
        if (wallet.winnings_balance < remainingToDebit) {
          throw ApiError.badRequest('Insufficient eligible balance to cover tournament entry', 'INSUFFICIENT_FUNDS');
        }
        wallet.winnings_balance = Number((wallet.winnings_balance - remainingToDebit).toFixed(2));

        entries.push({
          id: uuidv4(),
          wallet_id: wallet.id,
          user_id: params.userId,
          transaction_id: `TXN-DEB-WIN-${Date.now()}`,
          entry_type: 'DEBIT',
          balance_type: 'WINNINGS',
          amount: remainingToDebit,
          balance_after: Number((wallet.deposit_balance + wallet.winnings_balance + wallet.bonus_balance).toFixed(2)),
          category: 'TOURNAMENT_ENTRY',
          reference_type: params.referenceType,
          reference_id: params.referenceId,
          description: `${params.description} (Winnings Portion)`,
          idempotency_key: params.idempotencyKey ? `${params.idempotencyKey}-win` : undefined,
          created_at: new Date().toISOString(),
        });
      }
    } else if (params.category === 'WITHDRAWAL') {
      // Withdrawals can strictly come ONLY from Winnings balance
      if (wallet.winnings_balance < params.amount) {
        throw ApiError.badRequest(
          `Withdrawal can only be made from Winnings balance. Available winnings: ₹${wallet.winnings_balance.toFixed(2)}`,
          'INSUFFICIENT_WINNINGS'
        );
      }

      wallet.winnings_balance = Number((wallet.winnings_balance - params.amount).toFixed(2));
      wallet.locked_balance = Number((wallet.locked_balance + params.amount).toFixed(2));

      entries.push({
        id: uuidv4(),
        wallet_id: wallet.id,
        user_id: params.userId,
        transaction_id: `TXN-WDR-LOCK-${Date.now()}`,
        entry_type: 'DEBIT',
        balance_type: 'WINNINGS',
        amount: params.amount,
        balance_after: Number((wallet.deposit_balance + wallet.winnings_balance + wallet.bonus_balance).toFixed(2)),
        category: 'WITHDRAWAL',
        reference_type: params.referenceType,
        reference_id: params.referenceId,
        description: `${params.description} (Moved to Locked for processing)`,
        idempotency_key: params.idempotencyKey,
        created_at: new Date().toISOString(),
      });
    }

    wallet.updated_at = new Date().toISOString();

    for (const entry of entries) {
      store.ledger.unshift(entry);
    }

    return { wallet, ledgerEntries: entries };
  }

  // Create Add Money Order
  static async createDepositOrder(userId: string, amount: number) {
    if (amount < config.financial.minDeposit) {
      throw ApiError.badRequest(`Minimum deposit amount is ₹${config.financial.minDeposit}`);
    }
    if (amount > config.financial.maxDeposit) {
      throw ApiError.badRequest(`Maximum deposit amount is ₹${config.financial.maxDeposit}`);
    }

    const orderId = `ORD-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const newOrder = {
      id: uuidv4(),
      user_id: userId,
      order_id: orderId,
      amount,
      currency: 'INR',
      gateway: 'MOCK' as const,
      status: 'PENDING' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    store.paymentOrders.set(orderId, newOrder);

    return {
      orderId,
      amount,
      currency: 'INR',
      gateway: config.payment.provider,
      keyId: config.payment.keyId,
    };
  }

  // Confirm Deposit Payment (Webhook or Server Verification)
  static async confirmDepositPayment(orderId: string, paymentDetails: { gatewayPaymentId: string; signature?: string }) {
    const order = store.paymentOrders.get(orderId);
    if (!order) throw ApiError.notFound('Payment order not found');

    if (order.status === 'SUCCESS') {
      return { success: true, message: 'Payment already processed' };
    }

    order.status = 'SUCCESS';
    order.updated_at = new Date().toISOString();

    // Credit to user's deposit balance with immutable ledger record
    await this.credit({
      userId: order.user_id,
      amount: order.amount,
      balanceType: 'DEPOSIT',
      category: 'DEPOSIT',
      referenceType: 'payment_orders',
      referenceId: order.order_id,
      description: `Deposit via Gateway #${paymentDetails.gatewayPaymentId}`,
      idempotencyKey: `DEP-${order.order_id}`,
    });

    // Notify user
    store.notifications.unshift({
      id: uuidv4(),
      user_id: order.user_id,
      title: 'Deposit Successful 💳',
      message: `₹${order.amount.toFixed(2)} has been added to your Tournament X deposit balance.`,
      type: 'WALLET',
      is_read: false,
      created_at: new Date().toISOString(),
    });

    return { success: true, amount: order.amount, orderId: order.order_id };
  }

  // Request Withdrawal
  static async requestWithdrawal(userId: string, data: {
    amount: number;
    payoutMethod: 'UPI' | 'BANK_ACCOUNT';
    upiId?: string;
    bankAccount?: string;
    ifsc?: string;
    accountHolder?: string;
  }): Promise<Withdrawal> {
    const kyc = store.kycProfiles.get(userId);
    if (!kyc || kyc.status !== 'VERIFIED') {
      throw ApiError.forbidden('KYC verification is mandatory before requesting withdrawals', 'KYC_REQUIRED');
    }

    if (data.amount < config.financial.minWithdrawal) {
      throw ApiError.badRequest(`Minimum withdrawal amount is ₹${config.financial.minWithdrawal}`);
    }
    if (data.amount > config.financial.maxWithdrawal) {
      throw ApiError.badRequest(`Maximum withdrawal amount per request is ₹${config.financial.maxWithdrawal}`);
    }

    const fee = Number(((data.amount * config.financial.withdrawalFeePercent) / 100).toFixed(2));
    const netAmount = Number((data.amount - fee).toFixed(2));

    const payoutId = `WDR-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    // Debit atomically from winnings and lock
    await this.debit({
      userId,
      amount: data.amount,
      category: 'WITHDRAWAL',
      referenceType: 'withdrawals',
      referenceId: payoutId,
      description: `Withdrawal Request to ${data.payoutMethod}: ${data.upiId || data.bankAccount}`,
      idempotencyKey: payoutId,
    });

    const withdrawal: Withdrawal = {
      id: uuidv4(),
      user_id: userId,
      payout_id: payoutId,
      amount: data.amount,
      fee,
      net_amount: netAmount,
      payout_method: data.payoutMethod,
      payout_details: {
        upi_id: data.upiId,
        bank_account: data.bankAccount,
        ifsc: data.ifsc,
        account_holder: data.accountHolder,
      },
      status: config.demoMode ? 'PAID' : 'UNDER_REVIEW', // In demo mode, simulate instant payout!
      created_at: new Date().toISOString(),
    };

    if (config.demoMode) {
      withdrawal.processed_at = new Date().toISOString();
      const wallet = this.getWallet(userId);
      wallet.locked_balance = Math.max(0, Number((wallet.locked_balance - data.amount).toFixed(2)));
    }

    store.withdrawals.set(payoutId, withdrawal);

    AuditService.log({
      actorId: userId,
      actorRole: 'PLAYER',
      action: 'REQUEST_WITHDRAWAL',
      entity: 'withdrawals',
      entityId: payoutId,
      afterState: { amount: data.amount, netAmount, method: data.payoutMethod },
    });

    store.notifications.unshift({
      id: uuidv4(),
      user_id: userId,
      title: 'Withdrawal Initiated ⚡',
      message: `Your withdrawal request for ₹${netAmount.toFixed(2)} (${data.payoutMethod}) is ${config.demoMode ? 'processed' : 'under review'}.`,
      type: 'WALLET',
      is_read: false,
      created_at: new Date().toISOString(),
    });

    return withdrawal;
  }
}
