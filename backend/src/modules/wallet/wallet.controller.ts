import { Router, Request, Response, NextFunction } from 'express';
import { WalletService } from './wallet.service';
import { authenticate, AuthenticatedRequest } from '../../common/middleware/auth.middleware';
import { store } from '../../database/data-store';

const router = Router();

// GET /api/v1/wallet
router.get('/', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const wallet = WalletService.getWallet(req.user!.id);
  res.json({
    success: true,
    data: {
      totalBalance: Number((wallet.deposit_balance + wallet.winnings_balance + wallet.bonus_balance).toFixed(2)),
      depositBalance: wallet.deposit_balance,
      winningsBalance: wallet.winnings_balance,
      bonusBalance: wallet.bonus_balance,
      lockedBalance: wallet.locked_balance,
      currency: wallet.currency,
      isFrozen: wallet.is_frozen,
    },
  });
});

// GET /api/v1/wallet/transactions
router.get('/transactions', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const transactions = WalletService.getLedgerHistory(req.user!.id, 50);
  res.json({
    success: true,
    data: transactions,
  });
});

// POST /api/v1/wallet/deposit/order
router.post('/deposit/order', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { amount } = req.body;
    if (!amount || isNaN(Number(amount))) {
      return res.status(400).json({ success: false, message: 'Valid deposit amount is required' });
    }
    const order = await WalletService.createDepositOrder(req.user!.id, Number(amount));
    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/wallet/deposit/verify (Client callback or mock simulation)
router.post('/deposit/verify', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { orderId, paymentId, signature } = req.body;
    if (!orderId) {
      return res.status(400).json({ success: false, message: 'orderId is required' });
    }
    const result = await WalletService.confirmDepositPayment(orderId, {
      gatewayPaymentId: paymentId || `PAY-${Date.now()}`,
      signature,
    });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/wallet/withdraw
router.post('/withdraw', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { amount, payoutMethod, upiId, bankAccount, ifsc, accountHolder } = req.body;
    if (!amount || !payoutMethod) {
      return res.status(400).json({ success: false, message: 'Amount and payoutMethod are required' });
    }
    const withdrawal = await WalletService.requestWithdrawal(req.user!.id, {
      amount: Number(amount),
      payoutMethod,
      upiId,
      bankAccount,
      ifsc,
      accountHolder,
    });
    res.status(201).json({ success: true, data: withdrawal });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/wallet/withdrawals
router.get('/withdrawals', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const userWithdrawals = Array.from(store.withdrawals.values())
    .filter((w) => w.user_id === req.user!.id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  res.json({ success: true, data: userWithdrawals });
});

// Webhook listener for Payment Gateways (e.g. Razorpay / Cashfree)
router.post('/webhook/payment', async (req: Request, res: Response) => {
  const { event, payload } = req.body;
  console.log(`[PAYMENT WEBHOOK] Received event: ${event}`);
  // In production, verify HMAC SHA256 signature using config.payment.webhookSecret
  if (event === 'payment.captured' || event === 'order.paid') {
    const orderId = payload?.payment?.entity?.notes?.order_id || payload?.order?.entity?.id;
    const paymentId = payload?.payment?.entity?.id || `GATEWAY-${Date.now()}`;
    if (orderId) {
      await WalletService.confirmDepositPayment(orderId, { gatewayPaymentId: paymentId });
    }
  }
  res.status(200).json({ received: true });
});

export const walletRouter = router;
