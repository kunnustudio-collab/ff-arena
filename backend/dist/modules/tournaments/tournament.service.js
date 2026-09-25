"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TournamentService = void 0;
const uuid_1 = require("uuid");
const data_store_1 = require("../../database/data-store");
const wallet_service_1 = require("../wallet/wallet.service");
const api_error_1 = require("../../common/errors/api-error");
const config_1 = require("../../config");
const audit_1 = require("../../common/utils/audit");
class TournamentService {
    static getAllTournaments(filters) {
        let list = Array.from(data_store_1.store.tournaments.values());
        if (filters?.mode && filters.mode !== 'ALL') {
            list = list.filter((t) => t.mode.toUpperCase() === filters.mode?.toUpperCase());
        }
        if (filters?.map && filters.map !== 'ALL') {
            list = list.filter((t) => t.map.toLowerCase() === filters.map?.toLowerCase());
        }
        if (filters?.status && filters.status !== 'ALL') {
            list = list.filter((t) => t.status === filters.status);
        }
        if (filters?.maxEntryFee !== undefined) {
            list = list.filter((t) => t.entry_fee <= filters.maxEntryFee);
        }
        return list.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
    }
    static getTournamentById(id) {
        const tournament = data_store_1.store.tournaments.get(id);
        if (!tournament)
            throw api_error_1.ApiError.notFound('Tournament not found');
        return tournament;
    }
    /**
     * Flow B: Join Tournament with Atomic Wallet Debit & Concurrency Validation
     */
    static async joinTournament(userId, tournamentId, playerInfo) {
        const user = data_store_1.store.users.get(userId);
        if (!user || user.status === 'SUSPENDED') {
            throw api_error_1.ApiError.forbidden('User account is suspended or invalid');
        }
        const profile = data_store_1.store.profiles.get(userId);
        if (profile?.state) {
            const isRestricted = config_1.config.compliance.restrictedStates.includes(profile.state.trim().toLowerCase());
            if (isRestricted) {
                throw api_error_1.ApiError.forbidden(`Participation in real-money esports tournaments is restricted in ${profile.state} under local law.`, 'GEO_RESTRICTED');
            }
        }
        const tournament = data_store_1.store.tournaments.get(tournamentId);
        if (!tournament)
            throw api_error_1.ApiError.notFound('Tournament not found');
        if (tournament.status !== 'OPEN') {
            throw api_error_1.ApiError.badRequest(`Tournament registration is currently ${tournament.status}. Only OPEN tournaments can be joined.`, 'TOURNAMENT_NOT_OPEN');
        }
        if (tournament.current_participants >= tournament.max_participants) {
            tournament.status = 'FULL';
            throw api_error_1.ApiError.badRequest('Tournament is already full', 'TOURNAMENT_FULL');
        }
        if (new Date() >= new Date(tournament.reg_deadline)) {
            throw api_error_1.ApiError.badRequest('Tournament registration deadline has passed', 'REGISTRATION_CLOSED');
        }
        // Check duplicate registration
        for (const reg of data_store_1.store.registrations.values()) {
            if (reg.tournament_id === tournamentId && reg.user_id === userId && reg.status === 'CONFIRMED') {
                throw api_error_1.ApiError.conflict('You are already registered for this tournament', 'ALREADY_REGISTERED');
            }
            if (reg.tournament_id === tournamentId && reg.in_game_uid === playerInfo.inGameUid && reg.status === 'CONFIRMED') {
                throw api_error_1.ApiError.conflict(`In-game UID ${playerInfo.inGameUid} is already registered in this match.`, 'DUPLICATE_UID');
            }
        }
        const slotNumber = tournament.current_participants + 1;
        const regNumber = `TX-REG-${Date.now().toString().slice(-6)}-${slotNumber}`;
        // Atomic debit of entry fee
        if (tournament.entry_fee > 0) {
            await wallet_service_1.WalletService.debit({
                userId,
                amount: tournament.entry_fee,
                category: 'TOURNAMENT_ENTRY',
                referenceType: 'tournaments',
                referenceId: tournament.id,
                description: `Entry Fee for ${tournament.title}`,
                idempotencyKey: `REG-${tournament.id}-${userId}`,
            });
        }
        // Create confirmed registration
        const registration = {
            id: (0, uuid_1.v4)(),
            tournament_id: tournament.id,
            user_id: userId,
            reg_number: regNumber,
            slot_number: slotNumber,
            in_game_name: playerInfo.inGameName,
            in_game_uid: playerInfo.inGameUid,
            team_name: playerInfo.teamName,
            entry_fee_paid: tournament.entry_fee,
            paid_from_balance_type: 'WALLET',
            status: 'CONFIRMED',
            created_at: new Date().toISOString(),
        };
        data_store_1.store.registrations.set(registration.id, registration);
        tournament.current_participants++;
        if (tournament.current_participants >= tournament.max_participants) {
            tournament.status = 'FULL';
        }
        // Update player profile statistics
        if (profile) {
            profile.total_tournaments++;
        }
        audit_1.AuditService.log({
            actorId: userId,
            actorRole: 'PLAYER',
            action: 'JOIN_TOURNAMENT',
            entity: 'tournaments',
            entityId: tournament.id,
            afterState: { regNumber, slotNumber, entryFee: tournament.entry_fee },
        });
        data_store_1.store.notifications.unshift({
            id: (0, uuid_1.v4)(),
            user_id: userId,
            title: 'Tournament Joined! 🎯',
            message: `You are registered for "${tournament.title}". Slot #${slotNumber}. Room credentials will be released at ${new Date(tournament.room_release_time).toLocaleTimeString()}.`,
            type: 'TOURNAMENT',
            is_read: false,
            created_at: new Date().toISOString(),
        });
        return registration;
    }
    /**
     * Flow C: Retrieve Room Credentials securely
     */
    static getRoomCredentials(userId, tournamentId) {
        // 1. Verify user is registered
        let isRegistered = false;
        for (const reg of data_store_1.store.registrations.values()) {
            if (reg.tournament_id === tournamentId && reg.user_id === userId && reg.status === 'CONFIRMED') {
                isRegistered = true;
                break;
            }
        }
        if (!isRegistered) {
            throw api_error_1.ApiError.forbidden('You are not registered for this tournament', 'NOT_REGISTERED');
        }
        const tournament = data_store_1.store.tournaments.get(tournamentId);
        if (!tournament)
            throw api_error_1.ApiError.notFound('Tournament not found');
        // 2. Check room release time
        const now = new Date();
        const releaseTime = new Date(tournament.room_release_time);
        if (now < releaseTime && !config_1.config.demoMode) {
            throw api_error_1.ApiError.forbidden(`Room credentials will be unlocked at ${releaseTime.toLocaleTimeString()}. Please check back then.`, 'ROOM_NOT_RELEASED');
        }
        // Find match room
        let match;
        for (const m of data_store_1.store.matches.values()) {
            if (m.tournament_id === tournamentId) {
                match = m;
                break;
            }
        }
        if (!match || !match.room_id) {
            return {
                roomId: 'TX-PENDING',
                roomPassword: 'Room being prepared by admin',
                releaseTime: tournament.room_release_time,
            };
        }
        return {
            roomId: match.room_id,
            roomPassword: match.room_password,
            releaseTime: tournament.room_release_time,
        };
    }
    /**
     * Flow C: Result Submission with Screenshot Evidence
     */
    static async submitMatchResult(userId, tournamentId, data) {
        const tournament = data_store_1.store.tournaments.get(tournamentId);
        if (!tournament)
            throw api_error_1.ApiError.notFound('Tournament not found');
        // Find user's registration
        let userReg;
        for (const reg of data_store_1.store.registrations.values()) {
            if (reg.tournament_id === tournamentId && reg.user_id === userId && reg.status === 'CONFIRMED') {
                userReg = reg;
                break;
            }
        }
        if (!userReg)
            throw api_error_1.ApiError.forbidden('You did not participate in this tournament');
        // Calculate score using tournament's dynamic scoring formula
        const killPoints = data.kills * (tournament.scoring_rules.killPoints || 10);
        const placementPoints = tournament.scoring_rules.placementPoints[String(data.placement)] || 0;
        const totalPoints = killPoints + placementPoints;
        const resultId = (0, uuid_1.v4)();
        const resultRecord = {
            id: resultId,
            match_id: tournamentId,
            tournament_id: tournamentId,
            user_id: userId,
            kills: data.kills,
            placement: data.placement,
            kill_points: killPoints,
            placement_points: placementPoints,
            bonus_points: 0,
            total_points: totalPoints,
            prize_amount: 0.0,
            status: 'SUBMITTED',
            screenshot_url: data.screenshotUrl,
            admin_notes: data.notes,
            submitted_at: new Date().toISOString(),
        };
        data_store_1.store.results.set(resultId, resultRecord);
        tournament.status = 'RESULT_VERIFICATION';
        audit_1.AuditService.log({
            actorId: userId,
            actorRole: 'PLAYER',
            action: 'SUBMIT_RESULT',
            entity: 'match_results',
            entityId: resultId,
            afterState: { kills: data.kills, placement: data.placement, totalPoints },
        });
        data_store_1.store.notifications.unshift({
            id: (0, uuid_1.v4)(),
            user_id: userId,
            title: 'Match Proof Submitted 📸',
            message: `Your match result (${data.kills} kills, Rank #${data.placement}) has been received and is in verification queue.`,
            type: 'TOURNAMENT',
            is_read: false,
            created_at: new Date().toISOString(),
        });
        return resultRecord;
    }
    /**
     * Flow C: Admin Final Result Verification & Automated Prize Ledger Disbursement
     */
    static async verifyAndDisbursePrizes(adminId, tournamentId, approvedResults) {
        const tournament = data_store_1.store.tournaments.get(tournamentId);
        if (!tournament)
            throw api_error_1.ApiError.notFound('Tournament not found');
        for (const item of approvedResults) {
            // Find result record
            for (const res of data_store_1.store.results.values()) {
                if (res.tournament_id === tournamentId && res.user_id === item.userId) {
                    res.status = 'APPROVED';
                    res.placement = item.rank;
                    res.prize_amount = item.prizeAmount;
                    res.verified_at = new Date().toISOString();
                }
            }
            // Credit Prize to User's Winnings balance via immutable ledger
            if (item.prizeAmount > 0) {
                await wallet_service_1.WalletService.credit({
                    userId: item.userId,
                    amount: item.prizeAmount,
                    balanceType: 'WINNINGS',
                    category: 'PRIZE',
                    referenceType: 'tournaments',
                    referenceId: tournamentId,
                    description: `Prize for Rank #${item.rank} in ${tournament.title}`,
                    idempotencyKey: `PRIZE-${tournamentId}-${item.userId}`,
                });
                // Update profile statistics
                const profile = data_store_1.store.profiles.get(item.userId);
                if (profile) {
                    profile.total_earnings = Number((profile.total_earnings + item.prizeAmount).toFixed(2));
                    if (item.rank === 1)
                        profile.total_wins++;
                }
                data_store_1.store.notifications.unshift({
                    id: (0, uuid_1.v4)(),
                    user_id: item.userId,
                    title: 'Prize Winnings Credited! 🏆',
                    message: `Congratulations! You placed Rank #${item.rank} in "${tournament.title}". ₹${item.prizeAmount.toFixed(2)} has been credited to your Winnings Balance.`,
                    type: 'WALLET',
                    is_read: false,
                    created_at: new Date().toISOString(),
                });
            }
        }
        tournament.status = 'COMPLETED';
        tournament.updated_at = new Date().toISOString();
        audit_1.AuditService.log({
            actorId: adminId,
            actorRole: 'ADMIN',
            action: 'APPROVE_RESULTS_AND_DISBURSE',
            entity: 'tournaments',
            entityId: tournamentId,
            afterState: { prizeDisbursedCount: approvedResults.length },
        });
        return { success: true, message: 'Tournament completed and prizes disbursed successfully.' };
    }
    /**
     * Automatic Tournament Cancellation & Refund Engine
     */
    static async cancelAndRefundTournament(adminId, tournamentId, reason) {
        const tournament = data_store_1.store.tournaments.get(tournamentId);
        if (!tournament)
            throw api_error_1.ApiError.notFound('Tournament not found');
        if (tournament.status === 'COMPLETED' || tournament.status === 'CANCELLED') {
            throw api_error_1.ApiError.badRequest(`Cannot cancel tournament in ${tournament.status} state`);
        }
        tournament.status = 'CANCELLED';
        tournament.updated_at = new Date().toISOString();
        // Process refunds for all confirmed registrations
        let refundCount = 0;
        for (const reg of data_store_1.store.registrations.values()) {
            if (reg.tournament_id === tournamentId && reg.status === 'CONFIRMED') {
                reg.status = 'REFUNDED';
                if (reg.entry_fee_paid > 0) {
                    await wallet_service_1.WalletService.credit({
                        userId: reg.user_id,
                        amount: reg.entry_fee_paid,
                        balanceType: 'DEPOSIT',
                        category: 'REFUND',
                        referenceType: 'tournaments',
                        referenceId: tournamentId,
                        description: `Refund for Cancelled Tournament: ${tournament.title}`,
                        idempotencyKey: `REFUND-${tournamentId}-${reg.user_id}`,
                    });
                    refundCount++;
                    data_store_1.store.notifications.unshift({
                        id: (0, uuid_1.v4)(),
                        user_id: reg.user_id,
                        title: 'Tournament Cancelled - Full Refund Issued',
                        message: `"${tournament.title}" was cancelled (${reason}). Your entry fee of ₹${reg.entry_fee_paid} has been refunded to your deposit balance.`,
                        type: 'WALLET',
                        is_read: false,
                        created_at: new Date().toISOString(),
                    });
                }
            }
        }
        audit_1.AuditService.log({
            actorId: adminId,
            actorRole: 'ADMIN',
            action: 'CANCEL_AND_REFUND_TOURNAMENT',
            entity: 'tournaments',
            entityId: tournamentId,
            reason,
            afterState: { refundCount },
        });
        return { success: true, message: `Tournament cancelled. ${refundCount} player refunds processed.` };
    }
}
exports.TournamentService = TournamentService;
