import { v4 as uuidv4 } from 'uuid';
import { store, RiskEvent } from '../../database/data-store';
import { config } from '../../config';

export class AntiFraudService {
  static evaluateUserActivity(userId: string, context: {
    eventType: string;
    ip?: string;
    deviceId?: string;
    state?: string;
    age?: number;
    metadata?: any;
  }): { riskScore: number; flagged: boolean; reasons: string[] } {
    const user = store.users.get(userId);
    if (!user) return { riskScore: 0, flagged: false, reasons: [] };

    let scoreDelta = 0;
    const reasons: string[] = [];

    // 1. Geo-Restricted State Check
    if (context.state) {
      const isRestricted = config.compliance.restrictedStates.includes(context.state.trim().toLowerCase());
      if (isRestricted) {
        scoreDelta += 35;
        reasons.push(`User residing in geo-restricted state (${context.state})`);
      }
    }

    // 2. Age Eligibility Check
    if (context.age !== undefined && context.age < config.compliance.minAge) {
      scoreDelta += 40;
      reasons.push(`User age (${context.age}) is below minimum platform eligibility of ${config.compliance.minAge} years`);
    }

    // 3. Multi-Account / Device Fingerprint Correlation
    if (context.deviceId) {
      // Check if device is linked to other accounts
      let matchedOtherAccounts = 0;
      for (const [otherId, otherUser] of store.users.entries()) {
        if (otherId !== userId) {
          // If profile or metadata shares deviceId
          if ((otherUser as any).lastDeviceId === context.deviceId) {
            matchedOtherAccounts++;
          }
        }
      }
      if (matchedOtherAccounts > 0) {
        scoreDelta += 30 * matchedOtherAccounts;
        reasons.push(`Hardware Device ID linked to ${matchedOtherAccounts} other account(s)`);
      }
    }

    // Update risk score
    user.risk_score = Math.min(100, Math.max(0, user.risk_score + scoreDelta));

    let severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    if (user.risk_score >= 80) severity = 'CRITICAL';
    else if (user.risk_score >= 55) severity = 'HIGH';
    else if (user.risk_score >= 25) severity = 'MEDIUM';

    if (scoreDelta > 0) {
      const riskEvent: RiskEvent = {
        id: uuidv4(),
        user_id: userId,
        event_type: context.eventType,
        risk_score: user.risk_score,
        severity,
        details: {
          reasons,
          context,
        },
        is_reviewed: false,
        created_at: new Date().toISOString(),
      };
      store.riskEvents.unshift(riskEvent);
      console.warn(`[ANTI-FRAUD] Flagged user ${userId}: Score=${user.risk_score}, Severity=${severity}, Reasons=${reasons.join(', ')}`);
    }

    return {
      riskScore: user.risk_score,
      flagged: user.risk_score >= 50,
      reasons,
    };
  }
}
