"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KycService = void 0;
const uuid_1 = require("uuid");
const data_store_1 = require("../../database/data-store");
const api_error_1 = require("../../common/errors/api-error");
const config_1 = require("../../config");
const audit_1 = require("../../common/utils/audit");
const risk_engine_1 = require("../../common/utils/risk-engine");
class KycService {
    static getKycByUserId(userId) {
        return data_store_1.store.kycProfiles.get(userId) || null;
    }
    static async submitKyc(userId, data) {
        const existing = data_store_1.store.kycProfiles.get(userId);
        if (existing && (existing.status === 'VERIFIED' || existing.status === 'PENDING')) {
            throw api_error_1.ApiError.badRequest(`KYC is already in ${existing.status} status`, 'KYC_DUPLICATE_SUBMISSION');
        }
        // Age validation
        const dob = new Date(data.dateOfBirth);
        const ageDiffMs = Date.now() - dob.getTime();
        const ageDate = new Date(ageDiffMs);
        const age = Math.abs(ageDate.getUTCFullYear() - 1970);
        if (age < config_1.config.compliance.minAge) {
            throw api_error_1.ApiError.badRequest(`You must be at least ${config_1.config.compliance.minAge} years old to complete KYC on Tournament X`, 'AGE_NOT_ELIGIBLE');
        }
        // Geo restriction check
        const isRestricted = config_1.config.compliance.restrictedStates.includes(data.state.trim().toLowerCase());
        if (isRestricted) {
            throw api_error_1.ApiError.badRequest(`Skill-based real-money tournaments are restricted in ${data.state} according to local state regulations.`, 'STATE_RESTRICTED');
        }
        // Mask ID number for safe display (e.g. ABCDE****F or ****1234)
        const rawId = data.idNumber.trim();
        const maskedId = rawId.length > 4 ? rawId.slice(0, 2) + '****' + rawId.slice(-2) : '****';
        const encryptedId = `ENC_${Buffer.from(rawId).toString('base64')}`;
        const kycProfile = {
            id: existing ? existing.id : (0, uuid_1.v4)(),
            user_id: userId,
            legal_name: data.legalName.trim(),
            date_of_birth: data.dateOfBirth,
            address: data.address.trim(),
            state: data.state.trim(),
            pincode: data.pincode.trim(),
            id_type: data.idType,
            id_number_masked: maskedId,
            id_number_encrypted: encryptedId,
            payout_upi_id: data.payoutUpiId?.trim(),
            payout_bank_account: data.payoutBankAccount?.trim(),
            payout_bank_ifsc: data.payoutBankIfsc?.trim(),
            status: config_1.config.demoMode ? 'VERIFIED' : 'PENDING', // If in demo mode, auto-verify for instant sandbox experience!
            document_url: data.documentUrl || 'https://via.placeholder.com/600x400.png?text=KYC+Proof+Document',
            verified_at: config_1.config.demoMode ? new Date().toISOString() : undefined,
            created_at: existing ? existing.created_at : new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        data_store_1.store.kycProfiles.set(userId, kycProfile);
        // Anti-fraud check
        risk_engine_1.AntiFraudService.evaluateUserActivity(userId, {
            eventType: 'KYC_SUBMITTED',
            state: data.state,
            age,
        });
        audit_1.AuditService.log({
            actorId: userId,
            actorRole: 'PLAYER',
            action: 'SUBMIT_KYC',
            entity: 'kyc_profiles',
            entityId: kycProfile.id,
            afterState: { status: kycProfile.status, idType: kycProfile.id_type },
        });
        // Notify user
        data_store_1.store.notifications.unshift({
            id: (0, uuid_1.v4)(),
            user_id: userId,
            title: config_1.config.demoMode ? 'KYC Auto-Verified (Demo Mode) ✅' : 'KYC Under Review ⏳',
            message: config_1.config.demoMode
                ? 'Your KYC documents have been verified. You can now deposit, play, and withdraw.'
                : 'Your KYC documents have been submitted and are under review by our compliance team.',
            type: 'KYC',
            is_read: false,
            created_at: new Date().toISOString(),
        });
        return kycProfile;
    }
    static async reviewKyc(adminId, kycId, status, rejectionReason) {
        let targetProfile;
        for (const p of data_store_1.store.kycProfiles.values()) {
            if (p.id === kycId || p.user_id === kycId) {
                targetProfile = p;
                break;
            }
        }
        if (!targetProfile) {
            throw api_error_1.ApiError.notFound('KYC profile not found');
        }
        const beforeState = { ...targetProfile };
        targetProfile.status = status;
        targetProfile.rejection_reason = status === 'REJECTED' || status === 'RETRY_REQUIRED' ? rejectionReason : undefined;
        targetProfile.verified_at = status === 'VERIFIED' ? new Date().toISOString() : undefined;
        targetProfile.updated_at = new Date().toISOString();
        audit_1.AuditService.log({
            actorId: adminId,
            actorRole: 'ADMIN',
            action: `KYC_${status}`,
            entity: 'kyc_profiles',
            entityId: targetProfile.id,
            beforeState: { status: beforeState.status },
            afterState: { status: targetProfile.status, reason: rejectionReason },
            reason: rejectionReason,
        });
        // Notify player
        data_store_1.store.notifications.unshift({
            id: (0, uuid_1.v4)(),
            user_id: targetProfile.user_id,
            title: status === 'VERIFIED' ? 'KYC Approved 🎉' : 'KYC Status Update',
            message: status === 'VERIFIED'
                ? 'Congratulations! Your identity has been verified. Payouts and high-tier tournaments are unlocked.'
                : `KYC review update: ${status}. Reason: ${rejectionReason || 'Please resubmit valid government ID'}`,
            type: 'KYC',
            is_read: false,
            created_at: new Date().toISOString(),
        });
        return targetProfile;
    }
}
exports.KycService = KycService;
