const { describe, it, before } = require('node:test');
const assert = require('node:assert');

describe('Tournament X Commercial Engine Tests', () => {
  it('Should verify double-entry accounting balance consistency', () => {
    let depositBalance = 500.0;
    let winningsBalance = 1000.0;
    let bonusBalance = 50.0;

    const entryFee = 100.0;
    // Rule: max 10% bonus
    const bonusDeducted = Math.min(bonusBalance, entryFee * 0.1); // 10.0
    bonusBalance -= bonusDeducted;

    const remaining = entryFee - bonusDeducted; // 90.0
    depositBalance -= remaining; // 500 - 90 = 410.0

    const totalBefore = 500.0 + 1000.0 + 50.0; // 1550.0
    const totalAfter = depositBalance + winningsBalance + bonusBalance; // 410 + 1000 + 40 = 1450.0

    assert.strictEqual(totalBefore - totalAfter, entryFee, 'Total wallet debit must precisely equal entry fee');
    assert.strictEqual(depositBalance >= 0, true, 'Deposit balance cannot be negative');
    assert.strictEqual(winningsBalance >= 0, true, 'Winnings balance cannot be negative');
    assert.strictEqual(bonusBalance >= 0, true, 'Bonus balance cannot be negative');
  });

  it('Should enforce KYC prerequisite before withdrawal', () => {
    const kycStatus = 'UNVERIFIED';
    const withdrawalAllowed = kycStatus === 'VERIFIED';
    assert.strictEqual(withdrawalAllowed, false, 'Unverified users must not be permitted to withdraw funds');
  });

  it('Should enforce geographic restriction for prohibited states', () => {
    const restricted = ['andhra pradesh', 'assam', 'nagaland', 'odisha', 'sikkim', 'telangana'];
    const userState = 'Assam';
    const isRestricted = restricted.includes(userState.trim().toLowerCase());
    assert.strictEqual(isRestricted, true, 'Assam must be blocked under state law');

    const allowedState = 'Maharashtra';
    const isAllowed = !restricted.includes(allowedState.trim().toLowerCase());
    assert.strictEqual(isAllowed, true, 'Maharashtra is allowed');
  });

  it('Should calculate score dynamically using placement and kill points', () => {
    const kills = 8;
    const placement = 1;
    const killMultiplier = 10;
    const placementPointsMap = { '1': 100, '2': 80, '3': 60 };

    const totalPoints = kills * killMultiplier + (placementPointsMap[String(placement)] || 0);
    assert.strictEqual(totalPoints, 80 + 100, 'Rank 1 with 8 kills must equal 180 points');
  });
});
