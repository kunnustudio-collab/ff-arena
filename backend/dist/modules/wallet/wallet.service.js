"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletService = void 0;
const uuid_1 = require("uuid");
const data_store_1 = require("../../database/data-store");
const api_error_1 = require("../../common/errors/api-error");
const config_1 = require("../../config");
const audit_1 = require("../../common/utils/audit");
class WalletService {
    static getWallet(userId) {
        let wallet = data_store_1.store.wallets.get(userId);
        if (!wallet) {
            wallet = {
                id: (0, uuid_1.v4)(),
                user_id: userId,
                deposit_balance: 0.0,
                winnings_balance: 0.0,
                bonus_balance: 0.0,
                locked_balance: 0.0,
                currency: 'INR',
                is_frozen: false,
                updated_at: new Date().toISOString(),
            };
            data_store_1.store.wallets.set(userId, wallet);
        }
        return wallet;
    }
    static getLedgerHistory(userId, limit = 50) {
        return data_store_1.store.ledger
            .filter((entry) => entry.user_id === userId)
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, limit);
    }
    /**
     * Atomic credit to wallet with immutable ledger entry
     */
    static async credit(params) {
        if (params.amount <= 0) {
            throw api_error_1.ApiError.badRequest('Credit amount must be greater than zero');
        }
        if (params.idempotencyKey) {
            const existingEntry = data_store_1.store.ledger.find((l) => l.idempotency_key === params.idempotencyKey);
            if (existingEntry) {
                return { wallet: this.getWallet(params.userId), ledgerEntry: existingEntry };
            }
        }
        const wallet = this.getWallet(params.userId);
        if (wallet.is_frozen) {
            throw api_error_1.ApiError.forbidden('Wallet is frozen. Contact customer support.', 'WALLET_FROZEN');
        }
        // Update specific balance
        if (params.balanceType === 'DEPOSIT') {
            wallet.deposit_balance = Number((wallet.deposit_balance + params.amount).toFixed(2));
        }
        else if (params.balanceType === 'WINNINGS') {
            wallet.winnings_balance = Number((wallet.winnings_balance + params.amount).toFixed(2));
        }
        else if (params.balanceType === 'BONUS') {
            wallet.bonus_balance = Number((wallet.bonus_balance + params.amount).toFixed(2));
        }
        wallet.updated_at = new Date().toISOString();
        const totalCurrentBalance = Number((wallet.deposit_balance + wallet.winnings_balance + wallet.bonus_balance).toFixed(2));
        const ledgerEntry = {
            id: (0, uuid_1.v4)(),
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
        data_store_1.store.ledger.unshift(ledgerEntry);
        return { wallet, ledgerEntry };
    }
    /**
     * Atomic debit from wallet (prioritizing Bonus -> Deposit -> Winnings for entry fee, or strictly Winnings for withdrawal)
     */
    static async debit(params) {
        if (params.amount <= 0) {
            throw api_error_1.ApiError.badRequest('Debit amount must be greater than zero');
        }
        if (params.idempotencyKey) {
            const existingEntries = data_store_1.store.ledger.filter((l) => l.idempotency_key === params.idempotencyKey);
            if (existingEntries.length > 0) {
                return { wallet: this.getWallet(params.userId), ledgerEntries: existingEntries };
            }
        }
        const wallet = this.getWallet(params.userId);
        if (wallet.is_frozen) {
            throw api_error_1.ApiError.forbidden('Wallet is frozen. Cannot process transactions.', 'WALLET_FROZEN');
        }
        // Check total available balance
        const totalAvailable = wallet.deposit_balance + wallet.winnings_balance + wallet.bonus_balance;
        if (totalAvailable < params.amount) {
            throw api_error_1.ApiError.badRequest(`Insufficient balance. Available: ₹${totalAvailable.toFixed(2)}, Required: ₹${params.amount.toFixed(2)}`, 'INSUFFICIENT_BALANCE');
        }
        let remainingToDebit = params.amount;
        const entries = [];
        // Deduction strategy for tournament entries: Bonus (max 10%) -> Deposit -> Winnings
        if (params.category === 'TOURNAMENT_ENTRY') {
            // 1. Bonus deduction (up to 10% of entry fee or available bonus)
            const maxBonusUsable = Math.min(wallet.bonus_balance, Number((params.amount * 0.1).toFixed(2)));
            if (maxBonusUsable > 0) {
                wallet.bonus_balance = Number((wallet.bonus_balance - maxBonusUsable).toFixed(2));
                remainingToDebit = Number((remainingToDebit - maxBonusUsable).toFixed(2));
                entries.push({
                    id: (0, uuid_1.v4)(),
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
                    id: (0, uuid_1.v4)(),
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
                    throw api_error_1.ApiError.badRequest('Insufficient eligible balance to cover tournament entry', 'INSUFFICIENT_FUNDS');
                }
                wallet.winnings_balance = Number((wallet.winnings_balance - remainingToDebit).toFixed(2));
                entries.push({
                    id: (0, uuid_1.v4)(),
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
        }
        else if (params.category === 'WITHDRAWAL') {
            // Withdrawals can strictly come ONLY from Winnings balance
            if (wallet.winnings_balance < params.amount) {
                throw api_error_1.ApiError.badRequest(`Withdrawal can only be made from Winnings balance. Available winnings: ₹${wallet.winnings_balance.toFixed(2)}`, 'INSUFFICIENT_WINNINGS');
            }
            wallet.winnings_balance = Number((wallet.winnings_balance - params.amount).toFixed(2));
            wallet.locked_balance = Number((wallet.locked_balance + params.amount).toFixed(2));
            entries.push({
                id: (0, uuid_1.v4)(),
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
            data_store_1.store.ledger.unshift(entry);
        }
        return { wallet, ledgerEntries: entries };
    }
    // Create Add Money Order
    static async createDepositOrder(userId, amount) {
        if (amount < config_1.config.financial.minDeposit) {
            throw api_error_1.ApiError.badRequest(`Minimum deposit amount is ₹${config_1.config.financial.minDeposit}`);
        }
        if (amount > config_1.config.financial.maxDeposit) {
            throw api_error_1.ApiError.badRequest(`Maximum deposit amount is ₹${config_1.config.financial.maxDeposit}`);
        }
        const orderId = `ORD-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
        const newOrder = {
            id: (0, uuid_1.v4)(),
            user_id: userId,
            order_id: orderId,
            amount,
            currency: 'INR',
            gateway: 'MOCK',
            status: 'PENDING',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        data_store_1.store.paymentOrders.set(orderId, newOrder);
        return {
            orderId,
            amount,
            currency: 'INR',
            gateway: config_1.config.payment.provider,
            keyId: config_1.config.payment.keyId,
        };
    }
    // Confirm Deposit Payment (Webhook or Server Verification)
    static async confirmDepositPayment(orderId, paymentDetails) {
        const order = data_store_1.store.paymentOrders.get(orderId);
        if (!order)
            throw api_error_1.ApiError.notFound('Payment order not found');
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
        data_store_1.store.notifications.unshift({
            id: (0, uuid_1.v4)(),
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
    static async requestWithdrawal(userId, data) {
        const kyc = data_store_1.store.kycProfiles.get(userId);
        if (!kyc || kyc.status !== 'VERIFIED') {
            throw api_error_1.ApiError.forbidden('KYC verification is mandatory before requesting withdrawals', 'KYC_REQUIRED');
        }
        if (data.amount < config_1.config.financial.minWithdrawal) {
            throw api_error_1.ApiError.badRequest(`Minimum withdrawal amount is ₹${config_1.config.financial.minWithdrawal}`);
        }
        if (data.amount > config_1.config.financial.maxWithdrawal) {
            throw api_error_1.ApiError.badRequest(`Maximum withdrawal amount per request is ₹${config_1.config.financial.maxWithdrawal}`);
        }
        const fee = Number(((data.amount * config_1.config.financial.withdrawalFeePercent) / 100).toFixed(2));
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
        const withdrawal = {
            id: (0, uuid_1.v4)(),
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
            status: config_1.config.demoMode ? 'PAID' : 'UNDER_REVIEW', // In demo mode, simulate instant payout!
            created_at: new Date().toISOString(),
        };
        if (config_1.config.demoMode) {
            withdrawal.processed_at = new Date().toISOString();
            const wallet = this.getWallet(userId);
            wallet.locked_balance = Math.max(0, Number((wallet.locked_balance - data.amount).toFixed(2)));
        }
        data_store_1.store.withdrawals.set(payoutId, withdrawal);
        audit_1.AuditService.log({
            actorId: userId,
            actorRole: 'PLAYER',
            action: 'REQUEST_WITHDRAWAL',
            entity: 'withdrawals',
            entityId: payoutId,
            afterState: { amount: data.amount, netAmount, method: data.payoutMethod },
        });
        data_store_1.store.notifications.unshift({
            id: (0, uuid_1.v4)(),
            user_id: userId,
            title: 'Withdrawal Initiated ⚡',
            message: `Your withdrawal request for ₹${netAmount.toFixed(2)} (${data.payoutMethod}) is ${config_1.config.demoMode ? 'processed' : 'under review'}.`,
            type: 'WALLET',
            is_read: false,
            created_at: new Date().toISOString(),
        });
        return withdrawal;
    }
}
exports.WalletService = WalletService;
