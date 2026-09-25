import { Router, Response, NextFunction } from 'express';
import { requireAdmin } from '../../common/middleware/admin.middleware';
import { AuthenticatedRequest } from '../../common/middleware/auth.middleware';
import { store } from '../../database/data-store';
import { ApiError } from '../../common/errors/api-error';
import { AuditService } from '../../common/utils/audit';
import { WalletService } from '../wallet/wallet.service';

const router = Router();

// Apply admin RBAC to all routes in this controller
router.use(requireAdmin(['SUPER_ADMIN', 'ADMIN', 'FINANCE_ADMIN', 'TOURNAMENT_ADMIN', 'KYC_ADMIN', 'SUPPORT_AGENT']));

// 1. Dashboard Overview Metrics & Charts
router.get('/dashboard', (req: AuthenticatedRequest, res: Response) => {
  const totalUsers = Array.from(store.users.values()).filter((u) => u.role === 'PLAYER').length;
  const verifiedKycCount = Array.from(store.kycProfiles.values()).filter((k) => k.status === 'VERIFIED').length;
  const pendingKycCount = Array.from(store.kycProfiles.values()).filter((k) => k.status === 'PENDING').length;
  const activeTournaments = Array.from(store.tournaments.values()).filter(
    (t) => t.status === 'OPEN' || t.status === 'LIVE' || t.status === 'FULL'
  ).length;
  const pendingWithdrawalsCount = Array.from(store.withdrawals.values()).filter((w) => w.status === 'UNDER_REVIEW' || w.status === 'REQUESTED').length;
  const openDisputesCount = Array.from(store.disputes.values()).filter((d) => d.status === 'OPEN').length;
  const flaggedRiskCount = Array.from(store.riskEvents.values()).filter((r) => !r.is_reviewed).length;

  let totalEntryRevenue = 0;
  for (const reg of store.registrations.values()) {
    if (reg.status === 'CONFIRMED') totalEntryRevenue += reg.entry_fee_paid;
  }

  let totalPrizePaid = 0;
  for (const entry of store.ledger) {
    if (entry.category === 'PRIZE') totalPrizePaid += entry.amount;
  }

  res.json({
    success: true,
    data: {
      metrics: {
        totalUsers,
        verifiedUsers: verifiedKycCount,
        activeTournaments,
        todayRegistrations: store.registrations.size,
        totalRevenue: totalEntryRevenue,
        platformGrossMargin: totalEntryRevenue * 0.1,
        totalPrizesDisbursed: totalPrizePaid,
        pendingWithdrawals: pendingWithdrawalsCount,
        pendingKyc: pendingKycCount,
        openDisputes: openDisputesCount,
        flaggedRiskAccounts: flaggedRiskCount,
      },
      chartData: [
        { day: 'Mon', revenue: 12400, registrations: 85, deposits: 28000 },
        { day: 'Tue', revenue: 15800, registrations: 110, deposits: 32000 },
        { day: 'Wed', revenue: 18200, registrations: 135, deposits: 41000 },
        { day: 'Thu', revenue: 22400, registrations: 160, deposits: 49000 },
        { day: 'Fri', revenue: 31000, registrations: 220, deposits: 68000 },
        { day: 'Sat', revenue: 45000, registrations: 340, deposits: 95000 },
        { day: 'Sun', revenue: 52000, registrations: 410, deposits: 112000 },
      ],
    },
  });
});

// 2. User Management
router.get('/users', (req: AuthenticatedRequest, res: Response) => {
  const usersList = Array.from(store.users.values()).map((u) => {
    const profile = store.profiles.get(u.id);
    const wallet = store.wallets.get(u.id);
    const kyc = store.kycProfiles.get(u.id);
    return {
      id: u.id,
      phone: u.phone,
      email: u.email,
      role: u.role,
      status: u.status,
      riskScore: u.risk_score,
      profile: profile || null,
      wallet: wallet
        ? {
            total: wallet.deposit_balance + wallet.winnings_balance + wallet.bonus_balance,
            deposit: wallet.deposit_balance,
            winnings: wallet.winnings_balance,
            bonus: wallet.bonus_balance,
            isFrozen: wallet.is_frozen,
          }
        : null,
      kycStatus: kyc?.status || 'UNVERIFIED',
      createdAt: u.created_at,
    };
  });

  res.json({ success: true, data: usersList });
});

// Update User Status (Suspend/Unsuspend)
router.put('/users/:id/status', (req: AuthenticatedRequest, res: Response) => {
  const user = store.users.get(req.params.id);
  if (!user) throw ApiError.notFound('User not found');

  const { status, reason } = req.body;
  if (!status) return res.status(400).json({ success: false, message: 'Status is required' });

  const before = user.status;
  user.status = status;
  user.updated_at = new Date().toISOString();

  AuditService.log({
    actorId: req.user!.id,
    actorRole: req.user!.role,
    action: `USER_STATUS_${status}`,
    entity: 'users',
    entityId: user.id,
    beforeState: { status: before },
    afterState: { status },
    reason,
  });

  res.json({ success: true, message: `User status changed to ${status}` });
});

// Freeze / Unfreeze User Wallet
router.put('/users/:id/wallet-freeze', (req: AuthenticatedRequest, res: Response) => {
  const wallet = store.wallets.get(req.params.id);
  if (!wallet) throw ApiError.notFound('Wallet not found');

  const { isFrozen, reason } = req.body;
  wallet.is_frozen = Boolean(isFrozen);
  wallet.freeze_reason = reason;
  wallet.updated_at = new Date().toISOString();

  AuditService.log({
    actorId: req.user!.id,
    actorRole: req.user!.role,
    action: isFrozen ? 'WALLET_FROZEN' : 'WALLET_UNFROZEN',
    entity: 'wallets',
    entityId: wallet.id,
    reason,
  });

  res.json({ success: true, message: `Wallet ${isFrozen ? 'frozen' : 'unfrozen'} successfully` });
});

// Financial Ledger Balance Adjustment (Strictly Audited with Mandatory Reason)
router.post('/users/:id/adjust-balance', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { amount, balanceType, reason, type } = req.body; // type: CREDIT or DEBIT
    if (!amount || !balanceType || !reason) {
      return res.status(400).json({ success: false, message: 'amount, balanceType, and mandatory reason required' });
    }

    if (type === 'CREDIT') {
      await WalletService.credit({
        userId: req.params.id,
        amount: Number(amount),
        balanceType,
        category: 'ADJUSTMENT',
        referenceType: 'admin_adjustments',
        referenceId: `ADJ-${Date.now()}`,
        description: `Admin Adjustment by ${req.user!.email}: ${reason}`,
      });
    } else {
      await WalletService.debit({
        userId: req.params.id,
        amount: Number(amount),
        category: 'ADJUSTMENT',
        referenceType: 'admin_adjustments',
        referenceId: `ADJ-${Date.now()}`,
        description: `Admin Debit Adjustment by ${req.user!.email}: ${reason}`,
      });
    }

    AuditService.log({
      actorId: req.user!.id,
      actorRole: req.user!.role,
      action: `FINANCIAL_ADJUSTMENT_${type}`,
      entity: 'wallets',
      entityId: req.params.id,
      reason,
      afterState: { amount, balanceType, type },
    });

    res.json({ success: true, message: 'Balance adjusted and logged to immutable ledger.' });
  } catch (err) {
    next(err);
  }
});

// 3. KYC Queue
router.get('/kyc/queue', (req: AuthenticatedRequest, res: Response) => {
  const queue = Array.from(store.kycProfiles.values()).map((k) => {
    const user = store.users.get(k.user_id);
    const profile = store.profiles.get(k.user_id);
    return {
      ...k,
      phone: user?.phone,
      email: user?.email,
      username: profile?.username,
    };
  });
  res.json({ success: true, data: queue });
});

// 4. Withdrawal Queue & Processing
router.get('/withdrawals', (req: AuthenticatedRequest, res: Response) => {
  const list = Array.from(store.withdrawals.values()).map((w) => {
    const profile = store.profiles.get(w.user_id);
    const user = store.users.get(w.user_id);
    return {
      ...w,
      username: profile?.username,
      phone: user?.phone,
    };
  });
  res.json({ success: true, data: list });
});

router.put('/withdrawals/:id', (req: AuthenticatedRequest, res: Response) => {
  const withdrawal = store.withdrawals.get(req.params.id);
  if (!withdrawal) throw ApiError.notFound('Withdrawal record not found');

  const { status, adminNotes } = req.body;
  const before = withdrawal.status;
  withdrawal.status = status;
  withdrawal.admin_notes = adminNotes;
  withdrawal.processed_at = new Date().toISOString();

  // If rejected, refund back to Winnings balance
  if (status === 'REJECTED') {
    const wallet = store.wallets.get(withdrawal.user_id);
    if (wallet) {
      wallet.locked_balance = Math.max(0, Number((wallet.locked_balance - withdrawal.amount).toFixed(2)));
      wallet.winnings_balance = Number((wallet.winnings_balance + withdrawal.amount).toFixed(2));
      wallet.updated_at = new Date().toISOString();
    }
  } else if (status === 'PAID') {
    const wallet = store.wallets.get(withdrawal.user_id);
    if (wallet) {
      wallet.locked_balance = Math.max(0, Number((wallet.locked_balance - withdrawal.amount).toFixed(2)));
      wallet.updated_at = new Date().toISOString();
    }
  }

  AuditService.log({
    actorId: req.user!.id,
    actorRole: req.user!.role,
    action: `WITHDRAWAL_${status}`,
    entity: 'withdrawals',
    entityId: withdrawal.id,
    beforeState: { status: before },
    afterState: { status },
    reason: adminNotes,
  });

  res.json({ success: true, data: withdrawal });
});

// 5. Anti-Fraud & Risk Events Queue
router.get('/antifraud/events', (req: AuthenticatedRequest, res: Response) => {
  res.json({ success: true, data: store.riskEvents });
});

router.put('/antifraud/events/:id', (req: AuthenticatedRequest, res: Response) => {
  const event = store.riskEvents.find((e) => e.id === req.params.id);
  if (!event) throw ApiError.notFound('Risk event not found');

  const { actionTaken } = req.body;
  event.is_reviewed = true;
  event.action_taken = actionTaken;

  AuditService.log({
    actorId: req.user!.id,
    actorRole: req.user!.role,
    action: 'REVIEW_RISK_EVENT',
    entity: 'risk_events',
    entityId: event.id,
    afterState: { actionTaken },
  });

  res.json({ success: true, data: event });
});

// 6. Audit Trail (Immutable)
router.get('/audit-logs', (req: AuthenticatedRequest, res: Response) => {
  res.json({ success: true, data: store.auditLogs.slice(0, 100) });
});

// 7. Disputes Management
router.get('/disputes', (req: AuthenticatedRequest, res: Response) => {
  res.json({ success: true, data: Array.from(store.disputes.values()) });
});

router.put('/disputes/:id', (req: AuthenticatedRequest, res: Response) => {
  const dispute = store.disputes.get(req.params.id);
  if (!dispute) throw ApiError.notFound('Dispute not found');

  const { status, resolutionNotes } = req.body;
  dispute.status = status;
  dispute.resolution_notes = resolutionNotes;
  dispute.resolved_by = req.user!.id;
  dispute.updated_at = new Date().toISOString();

  AuditService.log({
    actorId: req.user!.id,
    actorRole: req.user!.role,
    action: `RESOLVE_DISPUTE_${status}`,
    entity: 'disputes',
    entityId: dispute.id,
    reason: resolutionNotes,
  });

  res.json({ success: true, data: dispute });
});

// 8. Downloadable CSV Reports
router.get('/reports/:type', (req: AuthenticatedRequest, res: Response) => {
  const reportType = req.params.type;
  let csvContent = '';

  if (reportType === 'users') {
    csvContent = 'User ID,Phone,Email,Role,Status,Risk Score,Created At\n';
    for (const u of store.users.values()) {
      csvContent += `"${u.id}","${u.phone}","${u.email}","${u.role}","${u.status}","${u.risk_score}","${u.created_at}"\n`;
    }
  } else if (reportType === 'transactions') {
    csvContent = 'Transaction ID,User ID,Category,Amount,Entry Type,Balance After,Description,Timestamp\n';
    for (const l of store.ledger) {
      csvContent += `"${l.transaction_id}","${l.user_id}","${l.category}","${l.amount}","${l.entry_type}","${l.balance_after}","${l.description}","${l.created_at}"\n`;
    }
  } else {
    csvContent = 'Report Type,Generated At,Status\n';
    csvContent += `"${reportType}","${new Date().toISOString()}","OK"\n`;
  }

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=tx_${reportType}_${Date.now()}.csv`);
  res.send(csvContent);
});

export const adminRouter = router;
