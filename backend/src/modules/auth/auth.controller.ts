import { Router, Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { authenticate, AuthenticatedRequest } from '../../common/middleware/auth.middleware';
import { store } from '../../database/data-store';

const router = Router();

// POST /api/v1/auth/otp/send
router.post('/otp/send', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { identifier } = req.body;
    if (!identifier) {
      return res.status(400).json({ success: false, message: 'Phone number or email is required' });
    }
    const result = await AuthService.sendOtp(identifier);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/auth/register
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone, email, password, fullName, username, dateOfBirth, state, referralCode, deviceId } = req.body;
    if (!phone || !email || !fullName || !username || !dateOfBirth || !state) {
      return res.status(400).json({ success: false, message: 'Missing required registration parameters' });
    }
    const result = await AuthService.register({
      phone,
      email,
      password,
      fullName,
      username,
      dateOfBirth,
      state,
      referralCode,
      deviceId,
      ipAddress: req.ip,
    });
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/auth/login
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { identifier, password, otp, deviceId } = req.body;
    if (!identifier) {
      return res.status(400).json({ success: false, message: 'Mobile or email identifier is required' });
    }

    if (otp) {
      const result = await AuthService.loginWithOtp(identifier, otp, deviceId, req.ip);
      return res.json({ success: true, data: result });
    }

    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required' });
    }

    const result = await AuthService.loginWithPassword(identifier, password, deviceId, req.ip);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/auth/admin/login
router.post('/admin/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, otp2Fa } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }
    const result = await AuthService.adminLogin(email, password, otp2Fa);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/auth/me
router.get('/me', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const user = store.users.get(userId);
  const profile = store.profiles.get(userId);
  const wallet = store.wallets.get(userId);
  const kyc = store.kycProfiles.get(userId);

  res.json({
    success: true,
    data: {
      user,
      profile,
      wallet,
      kycStatus: kyc ? kyc.status : 'UNVERIFIED',
    },
  });
});

export const authRouter = router;
