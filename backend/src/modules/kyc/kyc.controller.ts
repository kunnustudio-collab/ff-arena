import { Router, Response, NextFunction } from 'express';
import { KycService } from './kyc.service';
import { authenticate, AuthenticatedRequest } from '../../common/middleware/auth.middleware';
import { requireAdmin } from '../../common/middleware/admin.middleware';

const router = Router();

// GET /api/v1/kyc/status
router.get('/status', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const kyc = KycService.getKycByUserId(req.user!.id);
  res.json({
    success: true,
    data: kyc || { status: 'UNVERIFIED' },
  });
});

// POST /api/v1/kyc/submit
router.post('/submit', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { legalName, dateOfBirth, address, state, pincode, idType, idNumber, payoutUpiId, payoutBankAccount, payoutBankIfsc, documentUrl } = req.body;
    if (!legalName || !dateOfBirth || !address || !state || !idType || !idNumber) {
      return res.status(400).json({ success: false, message: 'All mandatory KYC fields must be filled' });
    }

    const result = await KycService.submitKyc(req.user!.id, {
      legalName,
      dateOfBirth,
      address,
      state,
      pincode: pincode || '',
      idType,
      idNumber,
      payoutUpiId,
      payoutBankAccount,
      payoutBankIfsc,
      documentUrl,
    });

    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

// ADMIN: POST /api/v1/kyc/review
router.post('/review', requireAdmin(['SUPER_ADMIN', 'ADMIN', 'KYC_ADMIN']), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { kycId, status, rejectionReason } = req.body;
    if (!kycId || !status) {
      return res.status(400).json({ success: false, message: 'kycId and status are required' });
    }

    const result = await KycService.reviewKyc(req.user!.id, kycId, status, rejectionReason);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

export const kycRouter = router;
