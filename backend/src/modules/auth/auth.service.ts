import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { store, User, UserProfile, Wallet } from '../../database/data-store';
import { ApiError } from '../../common/errors/api-error';
import { JwtUtil } from '../../common/utils/jwt';
import { AuditService } from '../../common/utils/audit';
import { AntiFraudService } from '../../common/utils/risk-engine';

export class AuthService {
  // Mock OTP storage with expiry
  private static otpStore: Map<string, { code: string; expiresAt: number; attempts: number }> = new Map();

  static async sendOtp(phoneOrEmail: string): Promise<{ success: boolean; message: string; demoOtp?: string }> {
    const cleanIdentifier = phoneOrEmail.trim().toLowerCase();
    const existingOtp = this.otpStore.get(cleanIdentifier);

    // Rate limiting: allow at most once per 60 seconds
    if (existingOtp && Date.now() < existingOtp.expiresAt - 4 * 60 * 1000) {
      throw ApiError.badRequest('Please wait 60 seconds before requesting a new OTP', 'RATE_LIMITED');
    }

    // In demo/test mode, use fixed or predictable OTP '123456'
    const code = '123456';
    this.otpStore.set(cleanIdentifier, {
      code,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 mins
      attempts: 0,
    });

    console.log(`[AUTH] Sent OTP to ${cleanIdentifier}: ${code}`);

    return {
      success: true,
      message: 'OTP sent successfully to your mobile/email',
      demoOtp: code,
    };
  }

  static async verifyOtp(phoneOrEmail: string, code: string): Promise<boolean> {
    const cleanIdentifier = phoneOrEmail.trim().toLowerCase();
    const record = this.otpStore.get(cleanIdentifier);

    if (!record) {
      throw ApiError.badRequest('No OTP requested or OTP has expired', 'OTP_EXPIRED');
    }

    if (Date.now() > record.expiresAt) {
      this.otpStore.delete(cleanIdentifier);
      throw ApiError.badRequest('OTP expired. Please request a new one', 'OTP_EXPIRED');
    }

    if (record.attempts >= 5) {
      this.otpStore.delete(cleanIdentifier);
      throw ApiError.badRequest('Too many failed attempts. OTP has been invalidated', 'OTP_MAX_ATTEMPTS');
    }

    if (record.code !== code) {
      record.attempts++;
      throw ApiError.badRequest('Invalid OTP code. Please enter the correct 6-digit code', 'INVALID_OTP');
    }

    this.otpStore.delete(cleanIdentifier);
    return true;
  }

  static async register(data: {
    phone: string;
    email: string;
    password?: string;
    fullName: string;
    username: string;
    dateOfBirth: string;
    state: string;
    referralCode?: string;
    deviceId?: string;
    ipAddress?: string;
  }): Promise<{ user: User; profile: UserProfile; tokens: { accessToken: string; refreshToken: string } }> {
    const phone = data.phone.trim();
    const email = data.email.trim().toLowerCase();
    const username = data.username.trim();

    // Check unique phone, email, username
    for (const u of store.users.values()) {
      if (u.phone === phone) throw ApiError.conflict('Mobile number is already registered', 'PHONE_EXISTS');
      if (u.email === email) throw ApiError.conflict('Email address is already registered', 'EMAIL_EXISTS');
    }

    for (const p of store.profiles.values()) {
      if (p.username.toLowerCase() === username.toLowerCase()) {
        throw ApiError.conflict('Username is already taken. Please choose another.', 'USERNAME_TAKEN');
      }
    }

    const userId = uuidv4();
    const passwordHash = data.password ? bcrypt.hashSync(data.password, 10) : '';

    // Generate unique referral code for this user
    const userRefCode = username.toUpperCase().slice(0, 5) + Math.floor(100 + Math.random() * 900);

    const newUser: User = {
      id: userId,
      phone,
      email,
      password_hash: passwordHash,
      role: 'PLAYER',
      status: 'ACTIVE',
      risk_score: 0,
      is_phone_verified: true,
      is_email_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const newProfile: UserProfile = {
      user_id: userId,
      full_name: data.fullName,
      username,
      avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
      date_of_birth: data.dateOfBirth,
      state: data.state,
      country: 'India',
      ff_uid: '',
      ff_ign: '',
      preferred_language: 'en',
      referral_code: userRefCode,
      referred_by_code: data.referralCode,
      total_tournaments: 0,
      total_wins: 0,
      total_earnings: 0.0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Initialize user wallet
    const walletId = uuidv4();
    const newWallet: Wallet = {
      id: walletId,
      user_id: userId,
      deposit_balance: 0.0,
      winnings_balance: 0.0,
      bonus_balance: data.referralCode ? 25.0 : 0.0, // Sign up bonus if referred
      locked_balance: 0.0,
      currency: 'INR',
      is_frozen: false,
      updated_at: new Date().toISOString(),
    };

    store.users.set(userId, newUser);
    store.profiles.set(userId, newProfile);
    store.wallets.set(userId, newWallet);

    // If referral code was valid, record bonus ledger
    if (data.referralCode) {
      store.ledger.push({
        id: uuidv4(),
        wallet_id: walletId,
        user_id: userId,
        transaction_id: `TXN-REF-BONUS-${Date.now()}`,
        entry_type: 'CREDIT',
        balance_type: 'BONUS',
        amount: 25.0,
        balance_after: 25.0,
        category: 'REFERRAL',
        reference_type: 'referrals',
        reference_id: data.referralCode,
        description: 'Welcome Referral Bonus',
        created_at: new Date().toISOString(),
      });
    }

    // Evaluate anti-fraud on registration
    AntiFraudService.evaluateUserActivity(userId, {
      eventType: 'USER_REGISTER',
      ip: data.ipAddress,
      deviceId: data.deviceId,
      state: data.state,
    });

    const accessToken = JwtUtil.signAccessToken({ userId, role: newUser.role, email, phone });
    const refreshToken = JwtUtil.signRefreshToken({ userId, role: newUser.role, email, phone });

    return {
      user: newUser,
      profile: newProfile,
      tokens: { accessToken, refreshToken },
    };
  }

  static async loginWithPassword(phoneOrEmail: string, password: string, deviceId?: string, ip?: string) {
    const ident = phoneOrEmail.trim().toLowerCase();
    let foundUser: User | undefined;

    for (const u of store.users.values()) {
      if (u.phone === ident || u.email.toLowerCase() === ident) {
        foundUser = u;
        break;
      }
    }

    if (!foundUser) {
      throw ApiError.unauthorized('Invalid phone/email or password credentials');
    }

    if (foundUser.status === 'SUSPENDED') {
      throw ApiError.forbidden('Your account has been suspended. Please contact support.', 'ACCOUNT_SUSPENDED');
    }

    const isMatch = bcrypt.compareSync(password, foundUser.password_hash);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid phone/email or password credentials');
    }

    const profile = store.profiles.get(foundUser.id);
    const wallet = store.wallets.get(foundUser.id);

    const accessToken = JwtUtil.signAccessToken({
      userId: foundUser.id,
      role: foundUser.role,
      email: foundUser.email,
      phone: foundUser.phone,
    });
    const refreshToken = JwtUtil.signRefreshToken({
      userId: foundUser.id,
      role: foundUser.role,
      email: foundUser.email,
      phone: foundUser.phone,
    });

    AuditService.log({
      actorId: foundUser.id,
      actorRole: foundUser.role,
      action: 'LOGIN_PASSWORD',
      entity: 'users',
      entityId: foundUser.id,
      ipAddress: ip,
    });

    return {
      user: foundUser,
      profile,
      wallet,
      tokens: { accessToken, refreshToken },
    };
  }

  static async loginWithOtp(phone: string, otpCode: string, deviceId?: string, ip?: string) {
    await this.verifyOtp(phone, otpCode);

    let foundUser: User | undefined;
    for (const u of store.users.values()) {
      if (u.phone === phone.trim()) {
        foundUser = u;
        break;
      }
    }

    if (!foundUser) {
      throw ApiError.notFound('Account not found with this mobile number. Please register first.');
    }

    const profile = store.profiles.get(foundUser.id);
    const wallet = store.wallets.get(foundUser.id);

    const accessToken = JwtUtil.signAccessToken({
      userId: foundUser.id,
      role: foundUser.role,
      email: foundUser.email,
      phone: foundUser.phone,
    });
    const refreshToken = JwtUtil.signRefreshToken({
      userId: foundUser.id,
      role: foundUser.role,
      email: foundUser.email,
      phone: foundUser.phone,
    });

    return {
      user: foundUser,
      profile,
      wallet,
      tokens: { accessToken, refreshToken },
    };
  }

  static async adminLogin(email: string, password: string, otp2Fa?: string) {
    let adminUser: User | undefined;
    for (const u of store.users.values()) {
      if (u.email.toLowerCase() === email.trim().toLowerCase()) {
        adminUser = u;
        break;
      }
    }

    if (!adminUser || !['SUPER_ADMIN', 'ADMIN', 'FINANCE_ADMIN', 'TOURNAMENT_ADMIN', 'KYC_ADMIN', 'SUPPORT_AGENT'].includes(adminUser.role)) {
      throw ApiError.unauthorized('Invalid administrator credentials');
    }

    const isMatch = bcrypt.compareSync(password, adminUser.password_hash);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid administrator credentials');
    }

    const token = JwtUtil.signAdminToken({
      userId: adminUser.id,
      role: adminUser.role,
      email: adminUser.email,
      phone: adminUser.phone,
    });

    AuditService.log({
      actorId: adminUser.id,
      actorRole: adminUser.role,
      action: 'ADMIN_LOGIN',
      entity: 'admin_users',
      entityId: adminUser.id,
    });

    return {
      admin: {
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
      },
      token,
    };
  }
}
