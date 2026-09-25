import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  phone: string;
  email: string;
  password_hash: string;
  role: 'PLAYER' | 'ADMIN' | 'SUPER_ADMIN' | 'FINANCE_ADMIN' | 'TOURNAMENT_ADMIN' | 'KYC_ADMIN' | 'SUPPORT_AGENT';
  status: 'ACTIVE' | 'SUSPENDED' | 'FROZEN' | 'CLOSED';
  risk_score: number;
  is_phone_verified: boolean;
  is_email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  user_id: string;
  full_name: string;
  username: string;
  avatar_url: string;
  date_of_birth: string;
  state: string;
  country: string;
  ff_uid: string;
  ff_ign: string;
  preferred_language: string;
  referral_code: string;
  referred_by_code?: string;
  total_tournaments: number;
  total_wins: number;
  total_earnings: number;
  created_at: string;
  updated_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  deposit_balance: number;
  winnings_balance: number;
  bonus_balance: number;
  locked_balance: number;
  currency: string;
  is_frozen: boolean;
  freeze_reason?: string;
  updated_at: string;
}

export interface LedgerEntry {
  id: string;
  wallet_id: string;
  user_id: string;
  transaction_id: string;
  entry_type: 'CREDIT' | 'DEBIT';
  balance_type: 'DEPOSIT' | 'WINNINGS' | 'BONUS' | 'LOCKED';
  amount: number;
  balance_after: number;
  category: 'DEPOSIT' | 'TOURNAMENT_ENTRY' | 'PRIZE' | 'REFUND' | 'WITHDRAWAL' | 'REFERRAL' | 'BONUS' | 'ADJUSTMENT';
  reference_type: string;
  reference_id: string;
  description: string;
  idempotency_key?: string;
  created_at: string;
}

export interface Tournament {
  id: string;
  title: string;
  description: string;
  game: string;
  mode: 'SOLO' | 'DUO' | 'SQUAD';
  match_type: string;
  map: 'Bermuda' | 'Purgatory' | 'Kalahari' | 'Alpine' | 'NexTerra';
  entry_fee: number;
  prize_pool: number;
  platform_fee_percent: number;
  max_participants: number;
  min_participants: number;
  current_participants: number;
  start_time: string;
  reg_deadline: string;
  room_release_time: string;
  result_deadline: string;
  rules: string;
  scoring_rules: {
    killPoints: number;
    placementPoints: { [rank: string]: number };
  };
  prize_distribution: { [rank: string]: number };
  status: 'DRAFT' | 'PUBLISHED' | 'OPEN' | 'FULL' | 'REGISTRATION_CLOSED' | 'LIVE' | 'RESULT_PENDING' | 'RESULT_VERIFICATION' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
  banner_url: string;
  created_at: string;
  updated_at: string;
}

export interface TournamentRegistration {
  id: string;
  tournament_id: string;
  user_id: string;
  reg_number: string;
  slot_number: number;
  in_game_name: string;
  in_game_uid: string;
  team_name?: string;
  entry_fee_paid: number;
  paid_from_balance_type: string;
  status: 'CONFIRMED' | 'CANCELLED' | 'REFUNDED';
  created_at: string;
}

export interface MatchRoom {
  id: string;
  tournament_id: string;
  match_number: number;
  status: 'SCHEDULED' | 'ROOM_OPEN' | 'IN_PROGRESS' | 'FINISHED' | 'CANCELLED';
  room_id: string;
  room_password: string;
  room_released_at?: string;
  started_at?: string;
  ended_at?: string;
}

export interface MatchResult {
  id: string;
  match_id: string;
  tournament_id: string;
  user_id: string;
  kills: number;
  placement: number;
  kill_points: number;
  placement_points: number;
  bonus_points: number;
  total_points: number;
  prize_amount: number;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'DISPUTED';
  admin_notes?: string;
  screenshot_url?: string;
  submitted_at: string;
  verified_at?: string;
}

export interface KycProfile {
  id: string;
  user_id: string;
  legal_name: string;
  date_of_birth: string;
  address: string;
  state: string;
  pincode: string;
  id_type: 'PAN' | 'AADHAAR' | 'PASSPORT' | 'VOTER_ID' | 'DRIVING_LICENSE';
  id_number_masked: string;
  id_number_encrypted: string;
  payout_upi_id?: string;
  payout_bank_account?: string;
  payout_bank_ifsc?: string;
  status: 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED' | 'RETRY_REQUIRED';
  rejection_reason?: string;
  document_url?: string;
  verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Withdrawal {
  id: string;
  user_id: string;
  payout_id: string;
  amount: number;
  fee: number;
  net_amount: number;
  payout_method: 'UPI' | 'BANK_ACCOUNT';
  payout_details: {
    upi_id?: string;
    bank_account?: string;
    ifsc?: string;
    account_holder?: string;
  };
  status: 'REQUESTED' | 'UNDER_REVIEW' | 'APPROVED' | 'PROCESSING' | 'PAID' | 'FAILED' | 'REJECTED';
  admin_notes?: string;
  processed_at?: string;
  created_at: string;
}

export interface PaymentOrder {
  id: string;
  user_id: string;
  order_id: string;
  amount: number;
  currency: string;
  gateway: 'MOCK' | 'RAZORPAY' | 'CASHFREE';
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'EXPIRED';
  idempotency_key?: string;
  created_at: string;
  updated_at: string;
}

export interface SupportTicket {
  id: string;
  ticket_number: string;
  user_id: string;
  category: string;
  subject: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING_FOR_USER' | 'RESOLVED' | 'CLOSED';
  messages: Array<{
    id: string;
    sender_id: string;
    sender_role: string;
    message: string;
    created_at: string;
  }>;
  created_at: string;
  updated_at: string;
}

export interface Dispute {
  id: string;
  dispute_number: string;
  user_id: string;
  category: string;
  tournament_id?: string;
  match_id?: string;
  reason: string;
  evidence_url?: string;
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';
  resolution_notes?: string;
  resolved_by?: string;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  actor_id?: string;
  actor_role: string;
  action: string;
  entity: string;
  entity_id: string;
  before_state?: any;
  after_state?: any;
  ip_address?: string;
  reason?: string;
  created_at: string;
}

export interface RiskEvent {
  id: string;
  user_id: string;
  event_type: string;
  risk_score: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  details: any;
  is_reviewed: boolean;
  action_taken?: string;
  created_at: string;
}

// In-Memory Database Store for Enterprise Performance and Fallback
export class DataStore {
  public users: Map<string, User> = new Map();
  public profiles: Map<string, UserProfile> = new Map();
  public wallets: Map<string, Wallet> = new Map();
  public ledger: LedgerEntry[] = [];
  public tournaments: Map<string, Tournament> = new Map();
  public registrations: Map<string, TournamentRegistration> = new Map();
  public matches: Map<string, MatchRoom> = new Map();
  public results: Map<string, MatchResult> = new Map();
  public kycProfiles: Map<string, KycProfile> = new Map();
  public paymentOrders: Map<string, PaymentOrder> = new Map();
  public withdrawals: Map<string, Withdrawal> = new Map();
  public supportTickets: Map<string, SupportTicket> = new Map();
  public disputes: Map<string, Dispute> = new Map();
  public auditLogs: AuditLog[] = [];
  public riskEvents: RiskEvent[] = [];
  public appSettings: Map<string, any> = new Map();
  public notifications: Array<{
    id: string;
    user_id: string;
    title: string;
    message: string;
    type: string;
    is_read: boolean;
    created_at: string;
  }> = [];

  constructor() {
    this.seedDefaultData();
  }

  private seedDefaultData() {
    const passwordHash = bcrypt.hashSync('Password@123', 10);
    const adminPasswordHash = bcrypt.hashSync('Admin@123456', 10);

    // 1. Super Admin
    const superAdminId = '00000000-0000-0000-0000-000000000001';
    this.users.set(superAdminId, {
      id: superAdminId,
      phone: '9999999999',
      email: 'admin@tournamentx.com',
      password_hash: adminPasswordHash,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      risk_score: 0,
      is_phone_verified: true,
      is_email_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    this.profiles.set(superAdminId, {
      user_id: superAdminId,
      full_name: 'Tournament X Admin',
      username: 'SystemAdmin',
      avatar_url: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150',
      date_of_birth: '1990-01-01',
      state: 'Delhi',
      country: 'India',
      ff_uid: '100000001',
      ff_ign: 'TX_MASTER',
      preferred_language: 'en',
      referral_code: 'TXADMIN',
      total_tournaments: 0,
      total_wins: 0,
      total_earnings: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // 2. Demo Pro Players
    const player1Id = '00000000-0000-0000-0000-000000000010';
    this.users.set(player1Id, {
      id: player1Id,
      phone: '9876543210',
      email: 'player1@tournamentx.com',
      password_hash: passwordHash,
      role: 'PLAYER',
      status: 'ACTIVE',
      risk_score: 5,
      is_phone_verified: true,
      is_email_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    this.profiles.set(player1Id, {
      user_id: player1Id,
      full_name: 'Viper Esports',
      username: 'TX_Viper',
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      date_of_birth: '2001-05-15',
      state: 'Maharashtra',
      country: 'India',
      ff_uid: '552194821',
      ff_ign: 'TX_Viper_YT',
      preferred_language: 'en',
      referral_code: 'VIPER99',
      total_tournaments: 48,
      total_wins: 14,
      total_earnings: 8400.0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    const player1WalletId = uuidv4();
    this.wallets.set(player1Id, {
      id: player1WalletId,
      user_id: player1Id,
      deposit_balance: 550.0,
      winnings_balance: 2450.0,
      bonus_balance: 100.0,
      locked_balance: 0.0,
      currency: 'INR',
      is_frozen: false,
      updated_at: new Date().toISOString(),
    });

    // Add initial ledger records for Player 1
    this.ledger.push({
      id: uuidv4(),
      wallet_id: player1WalletId,
      user_id: player1Id,
      transaction_id: 'TXN-INIT-DEP-01',
      entry_type: 'CREDIT',
      balance_type: 'DEPOSIT',
      amount: 500.0,
      balance_after: 500.0,
      category: 'DEPOSIT',
      reference_type: 'payment_orders',
      reference_id: 'ORD-99128',
      description: 'Deposit via UPI / Card Gateway',
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    });

    this.ledger.push({
      id: uuidv4(),
      wallet_id: player1WalletId,
      user_id: player1Id,
      transaction_id: 'TXN-INIT-WIN-01',
      entry_type: 'CREDIT',
      balance_type: 'WINNINGS',
      amount: 2450.0,
      balance_after: 2450.0,
      category: 'PRIZE',
      reference_type: 'tournaments',
      reference_id: 'TX-101',
      description: 'Prize Winnings: Rank #1 Bermuda Masters',
      created_at: new Date(Date.now() - 86400000).toISOString(),
    });

    // Player 1 KYC
    this.kycProfiles.set(player1Id, {
      id: uuidv4(),
      user_id: player1Id,
      legal_name: 'Viper Raj Sharma',
      date_of_birth: '2001-05-15',
      address: 'B-402, Highrise Heights, Bandra West',
      state: 'Maharashtra',
      pincode: '400050',
      id_type: 'PAN',
      id_number_masked: 'ABCDE****F',
      id_number_encrypted: 'ENC_PAN_7819238',
      payout_upi_id: 'viper.esports@okhdfcbank',
      status: 'VERIFIED',
      verified_at: new Date(Date.now() - 86400000 * 5).toISOString(),
      created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
      updated_at: new Date().toISOString(),
    });

    // 3. Demo Tournaments
    const t1Id = '11111111-1111-1111-1111-111111111101';
    const now = Date.now();
    this.tournaments.set(t1Id, {
      id: t1Id,
      title: 'Free Fire Bermuda Grand Masters',
      description: 'Skill-based Battle Royale Tournament. Full map tactical combat. Kill points + Placement rewards.',
      game: 'Free Fire MAX',
      mode: 'SOLO',
      match_type: 'Battle Royale',
      map: 'Bermuda',
      entry_fee: 20.0,
      prize_pool: 1000.0,
      platform_fee_percent: 10.0,
      max_participants: 50,
      min_participants: 12,
      current_participants: 44,
      start_time: new Date(now + 1000 * 60 * 45).toISOString(), // 45 mins from now
      reg_deadline: new Date(now + 1000 * 60 * 30).toISOString(),
      room_release_time: new Date(now + 1000 * 60 * 35).toISOString(),
      result_deadline: new Date(now + 1000 * 60 * 120).toISOString(),
      rules: '1. No emulators allowed.\n2. Hacks or game-file manipulation will result in permanent ban.\n3. Room ID & Password will be released 10 mins before match start.',
      scoring_rules: {
        killPoints: 10,
        placementPoints: {
          '1': 100,
          '2': 80,
          '3': 60,
          '4': 40,
          '5': 20,
        },
      },
      prize_distribution: {
        '1': 400,
        '2': 250,
        '3': 150,
        '4-10': 200,
      },
      status: 'OPEN',
      banner_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // Match Room for T1
    const match1Id = uuidv4();
    this.matches.set(match1Id, {
      id: match1Id,
      tournament_id: t1Id,
      match_number: 1,
      status: 'ROOM_OPEN',
      room_id: '9921448',
      room_password: 'TX2026BERMUDA',
      room_released_at: new Date().toISOString(),
    });

    // Tournament 2: Purgatory Squad Dominators
    const t2Id = '11111111-1111-1111-1111-111111111102';
    this.tournaments.set(t2Id, {
      id: t2Id,
      title: 'Purgatory Squad Mega Showdown',
      description: 'Squad vs Squad battle on Purgatory. Gather your squad and claim the championship prize!',
      game: 'Free Fire MAX',
      mode: 'SQUAD',
      match_type: 'Battle Royale',
      map: 'Purgatory',
      entry_fee: 100.0,
      prize_pool: 5000.0,
      platform_fee_percent: 10.0,
      max_participants: 12,
      min_participants: 6,
      current_participants: 9,
      start_time: new Date(now + 1000 * 60 * 180).toISOString(), // 3 hours from now
      reg_deadline: new Date(now + 1000 * 60 * 150).toISOString(),
      room_release_time: new Date(now + 1000 * 60 * 165).toISOString(),
      result_deadline: new Date(now + 1000 * 60 * 300).toISOString(),
      rules: '1. Squad leader must register all 4 FF UIDs.\n2. In-game voice chat permitted.\n3. Screenshot of final match stats must be uploaded within 20 mins of match end.',
      scoring_rules: {
        killPoints: 15,
        placementPoints: {
          '1': 200,
          '2': 140,
          '3': 100,
          '4': 60,
        },
      },
      prize_distribution: {
        '1': 2500,
        '2': 1500,
        '3': 1000,
      },
      status: 'OPEN',
      banner_url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // Tournament 3: Live Tournament
    const t3Id = '11111111-1111-1111-1111-111111111103';
    this.tournaments.set(t3Id, {
      id: t3Id,
      title: 'Kalahari Pro Solo Blitz',
      description: 'High stakes fast paced desert showdown. Spectators & live admin monitoring.',
      game: 'Free Fire MAX',
      mode: 'SOLO',
      match_type: 'Battle Royale',
      map: 'Kalahari',
      entry_fee: 50.0,
      prize_pool: 2500.0,
      platform_fee_percent: 10.0,
      max_participants: 50,
      min_participants: 20,
      current_participants: 50,
      start_time: new Date(now - 1000 * 60 * 10).toISOString(), // started 10m ago
      reg_deadline: new Date(now - 1000 * 60 * 20).toISOString(),
      room_release_time: new Date(now - 1000 * 60 * 15).toISOString(),
      result_deadline: new Date(now + 1000 * 60 * 40).toISOString(),
      rules: 'Fair play rules apply strictly. Automatic replay capture.',
      scoring_rules: {
        killPoints: 10,
        placementPoints: { '1': 100, '2': 80, '3': 60 },
      },
      prize_distribution: { '1': 1200, '2': 800, '3': 500 },
      status: 'LIVE',
      banner_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // Tournament 4: Daily Warmup (Low Entry ₹10)
    const t4Id = '11111111-1111-1111-1111-111111111104';
    this.tournaments.set(t4Id, {
      id: t4Id,
      title: 'NexTerra Daily Skill Warmup',
      description: 'Pocket-friendly practice cup for competitive aspiring players.',
      game: 'Free Fire MAX',
      mode: 'SOLO',
      match_type: 'Battle Royale',
      map: 'NexTerra',
      entry_fee: 10.0,
      prize_pool: 500.0,
      platform_fee_percent: 10.0,
      max_participants: 50,
      min_participants: 10,
      current_participants: 28,
      start_time: new Date(now + 1000 * 60 * 360).toISOString(),
      reg_deadline: new Date(now + 1000 * 60 * 330).toISOString(),
      room_release_time: new Date(now + 1000 * 60 * 345).toISOString(),
      result_deadline: new Date(now + 1000 * 60 * 420).toISOString(),
      rules: 'Open to all verified skill levels.',
      scoring_rules: {
        killPoints: 5,
        placementPoints: { '1': 50, '2': 35, '3': 20 },
      },
      prize_distribution: { '1': 250, '2': 150, '3': 100 },
      status: 'OPEN',
      banner_url: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // 4. Default App Settings
    this.appSettings.set('brand_name', 'Tournament X');
    this.appSettings.set('brand_tagline', 'Compete. Climb. Win.');
    this.appSettings.set('brand_accent_color', '#00F0FF');
    this.appSettings.set('maintenance_mode', false);
    this.appSettings.set('kyc_mandatory_for_withdrawal', true);
    this.appSettings.set('min_deposit', 50);
    this.appSettings.set('max_deposit', 10000);
    this.appSettings.set('min_withdrawal', 100);
    this.appSettings.set('max_withdrawal', 25000);
    this.appSettings.set('withdrawal_fee_percent', 2);
    this.appSettings.set('platform_fee_percent', 10);
    this.appSettings.set('min_age', 18);
    this.appSettings.set('geo_restricted_states', ['andhra pradesh', 'assam', 'nagaland', 'odisha', 'sikkim', 'telangana']);

    // 5. Default Notifications for Player 1
    this.notifications.push({
      id: uuidv4(),
      user_id: player1Id,
      title: 'Welcome to Tournament X!',
      message: 'Your elite skill-based esports journey begins now. Verify KYC to unlock instant payouts.',
      type: 'SYSTEM',
      is_read: true,
      created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    });

    this.notifications.push({
      id: uuidv4(),
      user_id: player1Id,
      title: 'KYC Document Approved ✅',
      message: 'Your PAN card verification is complete. You can now withdraw eligible winnings securely.',
      type: 'KYC',
      is_read: false,
      created_at: new Date(Date.now() - 86400000).toISOString(),
    });

    // 6. Default Support Ticket
    const ticketId = uuidv4();
    this.supportTickets.set(ticketId, {
      id: ticketId,
      ticket_number: 'TX-TCK-1082',
      user_id: player1Id,
      category: 'TOURNAMENT',
      subject: 'Inquiry regarding room release timing',
      description: 'Will room credentials be shared via push notification as well?',
      priority: 'MEDIUM',
      status: 'RESOLVED',
      messages: [
        {
          id: uuidv4(),
          sender_id: player1Id,
          sender_role: 'PLAYER',
          message: 'Will room credentials be shared via push notification as well?',
          created_at: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: uuidv4(),
          sender_id: superAdminId,
          sender_role: 'ADMIN',
          message: 'Yes! Room ID and Password will be sent via push notification and visible in "My Matches" exactly 15 minutes before the match start time.',
          created_at: new Date(Date.now() - 86400000 / 2).toISOString(),
        },
      ],
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date(Date.now() - 86400000 / 2).toISOString(),
    });

    // 7. Initial Risk Event for Admin Review Queue
    this.riskEvents.push({
      id: uuidv4(),
      user_id: player1Id,
      event_type: 'IP_GEO_CHECK',
      risk_score: 12,
      severity: 'LOW',
      details: {
        ip: '103.21.244.12',
        isp: 'Airtel Broadband',
        location: 'Mumbai, Maharashtra',
        status: 'PASSED_GEO_RESTRICTION',
      },
      is_reviewed: true,
      action_taken: 'NONE',
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    });
  }
}

export const store = new DataStore();
