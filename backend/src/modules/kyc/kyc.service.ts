import { v4 as uuidv4 } from 'uuid';
import { store, KycProfile } from '../../database/data-store';
import { ApiError } from '../../common/errors/api-error';
import { config } from '../../config';
import { AuditService } from '../../common/utils/audit';
import { AntiFraudService } from '../../common/utils/risk-engine';

export class KycService {
  static getKycByUserId(userId: string): KycProfile | null {
    return store.kycProfiles.get(userId) || null;
  }

  static async submitKyc(userId: string, data: {
    legalName: string;
    dateOfBirth: string;
    address: string;
    state: string;
    pincode: string;
    idType: 'PAN' | 'AADHAAR' | 'PASSPORT' | 'VOTER_ID' | 'DRIVING_LICENSE';
    idNumber: string;
    payoutUpiId?: string;
    payoutBankAccount?: string;
    payoutBankIfsc?: string;
    documentUrl?: string;
  }): Promise<KycProfile> {
    const existing = store.kycProfiles.get(userId);
    if (existing && (existing.status === 'VERIFIED' || existing.status === 'PENDING')) {
      throw ApiError.badRequest(`KYC is already in ${existing.status} status`, 'KYC_DUPLICATE_SUBMISSION');
    }

    // Age validation
    const dob = new Date(data.dateOfBirth);
    const ageDiffMs = Date.now() - dob.getTime();
    const ageDate = new Date(ageDiffMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);

    if (age < config.compliance.minAge) {
      throw ApiError.badRequest(
        `You must be at least ${config.compliance.minAge} years old to complete KYC on Tournament X`,
        'AGE_NOT_ELIGIBLE'
      );
    }

    // Geo restriction check
    const isRestricted = config.compliance.restrictedStates.includes(data.state.trim().toLowerCase());
    if (isRestricted) {
      throw ApiError.badRequest(
        `Skill-based real-money tournaments are restricted in ${data.state} according to local state regulations.`,
        'STATE_RESTRICTED'
      );
    }

    // Mask ID number for safe display (e.g. ABCDE****F or ****1234)
    const rawId = data.idNumber.trim();
    const maskedId = rawId.length > 4 ? rawId.slice(0, 2) + '****' + rawId.slice(-2) : '****';
    const encryptedId = `ENC_${Buffer.from(rawId).toString('base64')}`;

    const kycProfile: KycProfile = {
      id: existing ? existing.id : uuidv4(),
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
      status: config.demoMode ? 'VERIFIED' : 'PENDING', // If in demo mode, auto-verify for instant sandbox experience!
      document_url: data.documentUrl || 'https://via.placeholder.com/600x400.png?text=KYC+Proof+Document',
      verified_at: config.demoMode ? new Date().toISOString() : undefined,
      created_at: existing ? existing.created_at : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    store.kycProfiles.set(userId, kycProfile);

    // Anti-fraud check
    AntiFraudService.evaluateUserActivity(userId, {
      eventType: 'KYC_SUBMITTED',
      state: data.state,
      age,
    });

    AuditService.log({
      actorId: userId,
      actorRole: 'PLAYER',
      action: 'SUBMIT_KYC',
      entity: 'kyc_profiles',
      entityId: kycProfile.id,
      afterState: { status: kycProfile.status, idType: kycProfile.id_type },
    });

    // Notify user
    store.notifications.unshift({
      id: uuidv4(),
      user_id: userId,
      title: config.demoMode ? 'KYC Auto-Verified (Demo Mode) ✅' : 'KYC Under Review ⏳',
      message: config.demoMode
        ? 'Your KYC documents have been verified. You can now deposit, play, and withdraw.'
        : 'Your KYC documents have been submitted and are under review by our compliance team.',
      type: 'KYC',
      is_read: false,
      created_at: new Date().toISOString(),
    });

    return kycProfile;
  }

  static async reviewKyc(
    adminId: string,
    kycId: string,
    status: 'VERIFIED' | 'REJECTED' | 'RETRY_REQUIRED',
    rejectionReason?: string
  ): Promise<KycProfile> {
    let targetProfile: KycProfile | undefined;
    for (const p of store.kycProfiles.values()) {
      if (p.id === kycId || p.user_id === kycId) {
        targetProfile = p;
        break;
      }
    }

    if (!targetProfile) {
      throw ApiError.notFound('KYC profile not found');
    }

    const beforeState = { ...targetProfile };
    targetProfile.status = status;
    targetProfile.rejection_reason = status === 'REJECTED' || status === 'RETRY_REQUIRED' ? rejectionReason : undefined;
    targetProfile.verified_at = status === 'VERIFIED' ? new Date().toISOString() : undefined;
    targetProfile.updated_at = new Date().toISOString();

    AuditService.log({
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
    store.notifications.unshift({
      id: uuidv4(),
      user_id: targetProfile.user_id,
      title: status === 'VERIFIED' ? 'KYC Approved 🎉' : 'KYC Status Update',
      message:
        status === 'VERIFIED'
          ? 'Congratulations! Your identity has been verified. Payouts and high-tier tournaments are unlocked.'
          : `KYC review update: ${status}. Reason: ${rejectionReason || 'Please resubmit valid government ID'}`,
      type: 'KYC',
      is_read: false,
      created_at: new Date().toISOString(),
    });

    return targetProfile;
  }
}
