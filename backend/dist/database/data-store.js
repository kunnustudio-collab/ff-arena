"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.store = exports.DataStore = void 0;
const uuid_1 = require("uuid");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// In-Memory Database Store for Enterprise Performance and Fallback
class DataStore {
    users = new Map();
    profiles = new Map();
    wallets = new Map();
    ledger = [];
    tournaments = new Map();
    registrations = new Map();
    matches = new Map();
    results = new Map();
    kycProfiles = new Map();
    paymentOrders = new Map();
    withdrawals = new Map();
    supportTickets = new Map();
    disputes = new Map();
    auditLogs = [];
    riskEvents = [];
    appSettings = new Map();
    notifications = [];
    constructor() {
        this.seedDefaultData();
    }
    seedDefaultData() {
        const passwordHash = bcryptjs_1.default.hashSync('Password@123', 10);
        const adminPasswordHash = bcryptjs_1.default.hashSync('Admin@123456', 10);
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
        const player1WalletId = (0, uuid_1.v4)();
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
            id: (0, uuid_1.v4)(),
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
            id: (0, uuid_1.v4)(),
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
            id: (0, uuid_1.v4)(),
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
        const match1Id = (0, uuid_1.v4)();
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
            id: (0, uuid_1.v4)(),
            user_id: player1Id,
            title: 'Welcome to Tournament X!',
            message: 'Your elite skill-based esports journey begins now. Verify KYC to unlock instant payouts.',
            type: 'SYSTEM',
            is_read: true,
            created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
        });
        this.notifications.push({
            id: (0, uuid_1.v4)(),
            user_id: player1Id,
            title: 'KYC Document Approved ✅',
            message: 'Your PAN card verification is complete. You can now withdraw eligible winnings securely.',
            type: 'KYC',
            is_read: false,
            created_at: new Date(Date.now() - 86400000).toISOString(),
        });
        // 6. Default Support Ticket
        const ticketId = (0, uuid_1.v4)();
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
                    id: (0, uuid_1.v4)(),
                    sender_id: player1Id,
                    sender_role: 'PLAYER',
                    message: 'Will room credentials be shared via push notification as well?',
                    created_at: new Date(Date.now() - 86400000).toISOString(),
                },
                {
                    id: (0, uuid_1.v4)(),
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
            id: (0, uuid_1.v4)(),
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
exports.DataStore = DataStore;
exports.store = new DataStore();
