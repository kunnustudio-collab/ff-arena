-- TOURNAMENT X - PostgreSQL Production Schema
-- Designed for high concurrency, double-entry financial ledger, and anti-fraud auditing

-- Extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. App Configuration & Remote Settings
CREATE TABLE IF NOT EXISTS app_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users (Authentication & Core Account)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(20) UNIQUE,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    role VARCHAR(30) DEFAULT 'PLAYER', -- PLAYER, ADMIN, SUPER_ADMIN, FINANCE_ADMIN, TOURNAMENT_ADMIN, KYC_ADMIN, SUPPORT_AGENT
    status VARCHAR(30) DEFAULT 'ACTIVE', -- ACTIVE, SUSPENDED, FROZEN, CLOSED
    risk_score INT DEFAULT 0, -- 0-100 anti-fraud risk level
    is_phone_verified BOOLEAN DEFAULT FALSE,
    is_email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- 3. User Profiles & Esports Identity
CREATE TABLE IF NOT EXISTS user_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(150),
    username VARCHAR(50) UNIQUE NOT NULL,
    avatar_url TEXT,
    date_of_birth DATE,
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    ff_uid VARCHAR(30), -- Free Fire UID (e.g. 123456789)
    ff_ign VARCHAR(50), -- Free Fire In-Game Name
    preferred_language VARCHAR(10) DEFAULT 'en',
    referral_code VARCHAR(20) UNIQUE NOT NULL,
    referred_by_code VARCHAR(20),
    total_tournaments INT DEFAULT 0,
    total_wins INT DEFAULT 0,
    total_earnings NUMERIC(14, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_ff_uid ON user_profiles(ff_uid);
CREATE INDEX IF NOT EXISTS idx_user_profiles_referral_code ON user_profiles(referral_code);

-- 4. User Devices & Session Fingerprinting
CREATE TABLE IF NOT EXISTS devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    device_id VARCHAR(120) NOT NULL,
    device_model VARCHAR(100),
    os_version VARCHAR(50),
    ip_address VARCHAR(50),
    fcm_token TEXT,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_trusted BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, device_id)
);

CREATE INDEX IF NOT EXISTS idx_devices_device_id ON devices(device_id);

-- 5. Sessions & Token Rotation
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    refresh_token_hash VARCHAR(255) NOT NULL,
    device_id VARCHAR(120),
    user_agent TEXT,
    ip_address VARCHAR(50),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);

-- 6. KYC Profiles
CREATE TABLE IF NOT EXISTS kyc_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    legal_name VARCHAR(150) NOT NULL,
    date_of_birth DATE NOT NULL,
    address TEXT,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(20),
    id_type VARCHAR(50) NOT NULL, -- PAN, AADHAAR, PASSPORT, VOTER_ID, DRIVING_LICENSE
    id_number_masked VARCHAR(50) NOT NULL,
    id_number_encrypted TEXT NOT NULL,
    payout_upi_id VARCHAR(100),
    payout_bank_account_encrypted TEXT,
    payout_bank_ifsc VARCHAR(30),
    status VARCHAR(30) DEFAULT 'PENDING', -- UNVERIFIED, PENDING, VERIFIED, REJECTED, RETRY_REQUIRED
    rejection_reason TEXT,
    verified_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_kyc_status ON kyc_profiles(status);

-- 7. KYC Documents
CREATE TABLE IF NOT EXISTS kyc_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kyc_id UUID REFERENCES kyc_profiles(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL, -- FRONT, BACK, SELFIE
    storage_path TEXT NOT NULL,
    file_hash VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Wallets (Financial Aggregates)
CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    deposit_balance NUMERIC(14, 2) DEFAULT 0.00 CHECK (deposit_balance >= 0),
    winnings_balance NUMERIC(14, 2) DEFAULT 0.00 CHECK (winnings_balance >= 0),
    bonus_balance NUMERIC(14, 2) DEFAULT 0.00 CHECK (bonus_balance >= 0),
    locked_balance NUMERIC(14, 2) DEFAULT 0.00 CHECK (locked_balance >= 0),
    currency VARCHAR(10) DEFAULT 'INR',
    is_frozen BOOLEAN DEFAULT FALSE,
    freeze_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);

-- 9. Wallet Ledger (Immutable Double-Entry Style Log)
CREATE TABLE IF NOT EXISTS wallet_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID REFERENCES wallets(id) ON DELETE RESTRICT,
    user_id UUID REFERENCES users(id) ON DELETE RESTRICT,
    transaction_id VARCHAR(64) UNIQUE NOT NULL,
    entry_type VARCHAR(10) NOT NULL, -- CREDIT, DEBIT
    balance_type VARCHAR(20) NOT NULL, -- DEPOSIT, WINNINGS, BONUS, LOCKED
    amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
    balance_after NUMERIC(14, 2) NOT NULL,
    category VARCHAR(30) NOT NULL, -- DEPOSIT, TOURNAMENT_ENTRY, PRIZE, REFUND, WITHDRAWAL, REFERRAL, BONUS, ADJUSTMENT
    reference_type VARCHAR(50), -- payment_orders, tournaments, withdrawals, referrals
    reference_id VARCHAR(100),
    description TEXT,
    idempotency_key VARCHAR(100) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_wallet_ledger_user_id ON wallet_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_ledger_created_at ON wallet_ledger(created_at);
CREATE INDEX IF NOT EXISTS idx_wallet_ledger_category ON wallet_ledger(category);

-- 10. Payment Orders (Add Money)
CREATE TABLE IF NOT EXISTS payment_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE RESTRICT,
    order_id VARCHAR(64) UNIQUE NOT NULL,
    amount NUMERIC(14, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    gateway VARCHAR(30) NOT NULL, -- MOCK, RAZORPAY, CASHFREE
    gateway_order_id VARCHAR(100),
    status VARCHAR(30) DEFAULT 'PENDING', -- PENDING, SUCCESS, FAILED, EXPIRED
    idempotency_key VARCHAR(100) UNIQUE,
    raw_payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payment_orders_user_id ON payment_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_order_id ON payment_orders(order_id);

-- 11. Payment Transactions (Webhook confirmation)
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id VARCHAR(64) REFERENCES payment_orders(order_id) ON DELETE RESTRICT,
    user_id UUID REFERENCES users(id) ON DELETE RESTRICT,
    gateway_payment_id VARCHAR(100) UNIQUE NOT NULL,
    amount NUMERIC(14, 2) NOT NULL,
    payment_method VARCHAR(50),
    signature VARCHAR(255),
    status VARCHAR(30) NOT NULL, -- SUCCESS, FAILED, REVERSED
    raw_response JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Withdrawals
CREATE TABLE IF NOT EXISTS withdrawals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE RESTRICT,
    payout_id VARCHAR(64) UNIQUE NOT NULL,
    amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
    fee NUMERIC(14, 2) DEFAULT 0.00,
    net_amount NUMERIC(14, 2) NOT NULL,
    payout_method VARCHAR(30) NOT NULL, -- UPI, BANK_ACCOUNT
    payout_details JSONB NOT NULL,
    status VARCHAR(30) DEFAULT 'REQUESTED', -- REQUESTED, UNDER_REVIEW, APPROVED, PROCESSING, PAID, FAILED, REJECTED
    gateway_reference VARCHAR(100),
    admin_notes TEXT,
    processed_by UUID,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);

-- 13. Tournaments
CREATE TABLE IF NOT EXISTS tournaments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    game VARCHAR(50) DEFAULT 'Free Fire MAX',
    mode VARCHAR(20) NOT NULL, -- SOLO, DUO, SQUAD
    match_type VARCHAR(50) DEFAULT 'Battle Royale',
    map VARCHAR(50) DEFAULT 'Bermuda', -- Bermuda, Purgatory, Kalahari, Alpine, NexTerra
    entry_fee NUMERIC(10, 2) DEFAULT 0.00 CHECK (entry_fee >= 0),
    prize_pool NUMERIC(14, 2) NOT NULL CHECK (prize_pool >= 0),
    platform_fee_percent NUMERIC(5, 2) DEFAULT 10.00,
    max_participants INT NOT NULL CHECK (max_participants > 0),
    min_participants INT DEFAULT 10,
    current_participants INT DEFAULT 0,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    reg_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    room_release_time TIMESTAMP WITH TIME ZONE NOT NULL,
    result_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    rules TEXT,
    scoring_rules JSONB NOT NULL, -- placement points + kill points config
    prize_distribution JSONB NOT NULL, -- rank prize mapping
    status VARCHAR(30) DEFAULT 'DRAFT', -- DRAFT, PUBLISHED, OPEN, FULL, REGISTRATION_CLOSED, LIVE, RESULT_PENDING, RESULT_VERIFICATION, COMPLETED, CANCELLED, REFUNDED
    banner_url TEXT,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournaments_start_time ON tournaments(start_time);

-- 14. Tournament Registrations
CREATE TABLE IF NOT EXISTS tournament_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE RESTRICT,
    reg_number VARCHAR(30) UNIQUE NOT NULL,
    slot_number INT,
    in_game_name VARCHAR(60) NOT NULL,
    in_game_uid VARCHAR(40) NOT NULL,
    team_name VARCHAR(60),
    entry_fee_paid NUMERIC(10, 2) NOT NULL,
    paid_from_balance_type VARCHAR(20) DEFAULT 'DEPOSIT', -- DEPOSIT, WINNINGS, BONUS
    status VARCHAR(30) DEFAULT 'CONFIRMED', -- CONFIRMED, CANCELLED, REFUNDED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tournament_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_tourn_reg_user_id ON tournament_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_tourn_reg_tourn_id ON tournament_registrations(tournament_id);

-- 15. Matches & Custom Rooms
CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    match_number INT DEFAULT 1,
    status VARCHAR(30) DEFAULT 'SCHEDULED', -- SCHEDULED, ROOM_OPEN, IN_PROGRESS, FINISHED, CANCELLED
    room_id VARCHAR(50),
    room_password VARCHAR(50),
    room_released_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_matches_tournament_id ON matches(tournament_id);

-- 16. Match Results
CREATE TABLE IF NOT EXISTS match_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE RESTRICT,
    kills INT DEFAULT 0 CHECK (kills >= 0),
    placement INT DEFAULT 0 CHECK (placement >= 0),
    kill_points NUMERIC(10, 2) DEFAULT 0.00,
    placement_points NUMERIC(10, 2) DEFAULT 0.00,
    bonus_points NUMERIC(10, 2) DEFAULT 0.00,
    total_points NUMERIC(10, 2) DEFAULT 0.00,
    prize_amount NUMERIC(14, 2) DEFAULT 0.00,
    status VARCHAR(30) DEFAULT 'SUBMITTED', -- SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED, DISPUTED
    admin_notes TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID,
    UNIQUE(match_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_match_results_tournament ON match_results(tournament_id);
CREATE INDEX IF NOT EXISTS idx_match_results_user ON match_results(user_id);

-- 17. Result Evidence (Screenshots & Proofs)
CREATE TABLE IF NOT EXISTS result_evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    result_id UUID REFERENCES match_results(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    screenshot_url TEXT NOT NULL,
    player_comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 18. Leaderboards Cache & Aggregate
CREATE TABLE IF NOT EXISTS leaderboards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    period VARCHAR(20) NOT NULL, -- TODAY, WEEKLY, MONTHLY, ALL_TIME
    rank INT NOT NULL,
    total_points NUMERIC(12, 2) DEFAULT 0.00,
    total_kills INT DEFAULT 0,
    total_wins INT DEFAULT 0,
    total_matches INT DEFAULT 0,
    total_earnings NUMERIC(14, 2) DEFAULT 0.00,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, period)
);

CREATE INDEX IF NOT EXISTS idx_leaderboards_period_rank ON leaderboards(period, rank);

-- 19. Referrals & Rewards
CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    referee_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    referral_code VARCHAR(30) NOT NULL,
    status VARCHAR(30) DEFAULT 'REGISTERED', -- REGISTERED, FIRST_DEPOSIT, FIRST_MATCH, REWARDED, FRAUD_REJECTED
    reward_amount NUMERIC(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    rewarded_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);

-- 20. Promo Codes
CREATE TABLE IF NOT EXISTS promo_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type VARCHAR(20) NOT NULL, -- FLAT, PERCENTAGE
    discount_value NUMERIC(10, 2) NOT NULL,
    min_entry_fee NUMERIC(10, 2) DEFAULT 0.00,
    max_discount NUMERIC(10, 2) DEFAULT 100.00,
    usage_limit INT DEFAULT 1000,
    per_user_limit INT DEFAULT 1,
    current_uses INT DEFAULT 0,
    valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
    valid_to TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS promo_usages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    promo_id UUID REFERENCES promo_codes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    discount_applied NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(promo_id, user_id, tournament_id)
);

-- 21. Support Tickets & Messaging
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_number VARCHAR(30) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL, -- ACCOUNT, KYC, TOURNAMENT, PAYMENT, WITHDRAWAL, RESULTS, TECHNICAL
    subject VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH, URGENT
    status VARCHAR(30) DEFAULT 'OPEN', -- OPEN, IN_PROGRESS, WAITING_FOR_USER, RESOLVED, CLOSED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ticket_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
    sender_role VARCHAR(30) NOT NULL, -- PLAYER, SUPPORT_AGENT, ADMIN
    message TEXT NOT NULL,
    attachment_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket ON ticket_messages(ticket_id);

-- 22. Disputes
CREATE TABLE IF NOT EXISTS disputes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dispute_number VARCHAR(30) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL, -- MATCH_RESULT, PRIZE, PAYMENT, WITHDRAWAL, REGISTRATION
    tournament_id UUID REFERENCES tournaments(id) ON DELETE SET NULL,
    match_id UUID REFERENCES matches(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    evidence_url TEXT,
    status VARCHAR(30) DEFAULT 'OPEN', -- OPEN, INVESTIGATING, RESOLVED, DISMISSED
    resolution_notes TEXT,
    resolved_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 23. Anti-Fraud & Risk Events
CREATE TABLE IF NOT EXISTS risk_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL, -- MULTI_ACCOUNT, DEVICE_REUSE, SUSPICIOUS_IP, RAPID_JOIN, COLLUSION_SUSPECT
    risk_score INT NOT NULL,
    severity VARCHAR(20) NOT NULL, -- LOW, MEDIUM, HIGH, CRITICAL
    details JSONB NOT NULL,
    is_reviewed BOOLEAN DEFAULT FALSE,
    action_taken VARCHAR(50), -- NONE, WARNING, SUSPEND, FREEZE_WALLET
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_risk_events_user ON risk_events(user_id);
CREATE INDEX IF NOT EXISTS idx_risk_events_severity ON risk_events(severity);

-- 24. Immutable Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    actor_role VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    before_state JSONB,
    after_state JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- 25. Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- TOURNAMENT, WALLET, KYC, SYSTEM, REFERRAL
    data JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
