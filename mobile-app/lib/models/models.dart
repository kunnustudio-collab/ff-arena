class UserModel {
  final String id;
  final String phone;
  final String email;
  final String role;
  final String status;
  final int riskScore;

  UserModel({
    required this.id,
    required this.phone,
    required this.email,
    required this.role,
    required this.status,
    required this.riskScore,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] ?? '',
      phone: json['phone'] ?? '',
      email: json['email'] ?? '',
      role: json['role'] ?? 'PLAYER',
      status: json['status'] ?? 'ACTIVE',
      riskScore: json['risk_score'] ?? json['riskScore'] ?? 0,
    );
  }
}

class UserProfileModel {
  final String userId;
  final String fullName;
  final String username;
  final String avatarUrl;
  final String ffUid;
  final String ffIgn;
  final String state;
  final String referralCode;
  final int totalTournaments;
  final int totalWins;
  final double totalEarnings;

  UserProfileModel({
    required this.userId,
    required this.fullName,
    required this.username,
    required this.avatarUrl,
    required this.ffUid,
    required this.ffIgn,
    required this.state,
    required this.referralCode,
    required this.totalTournaments,
    required this.totalWins,
    required this.totalEarnings,
  });

  factory UserProfileModel.fromJson(Map<String, dynamic> json) {
    return UserProfileModel(
      userId: json['user_id'] ?? json['userId'] ?? '',
      fullName: json['full_name'] ?? json['fullName'] ?? '',
      username: json['username'] ?? '',
      avatarUrl: json['avatar_url'] ?? json['avatarUrl'] ?? '',
      ffUid: json['ff_uid'] ?? json['ffUid'] ?? '',
      ffIgn: json['ff_ign'] ?? json['ffIgn'] ?? '',
      state: json['state'] ?? '',
      referralCode: json['referral_code'] ?? json['referralCode'] ?? '',
      totalTournaments: json['total_tournaments'] ?? json['totalTournaments'] ?? 0,
      totalWins: json['total_wins'] ?? json['totalWins'] ?? 0,
      totalEarnings: (json['total_earnings'] ?? json['totalEarnings'] ?? 0).toDouble(),
    );
  }
}

class WalletModel {
  final double totalBalance;
  final double depositBalance;
  final double winningsBalance;
  final double bonusBalance;
  final double lockedBalance;
  final bool isFrozen;

  WalletModel({
    required this.totalBalance,
    required this.depositBalance,
    required this.winningsBalance,
    required this.bonusBalance,
    required this.lockedBalance,
    required this.isFrozen,
  });

  factory WalletModel.fromJson(Map<String, dynamic> json) {
    final dep = (json['deposit_balance'] ?? json['depositBalance'] ?? 0).toDouble();
    final win = (json['winnings_balance'] ?? json['winningsBalance'] ?? 0).toDouble();
    final bon = (json['bonus_balance'] ?? json['bonusBalance'] ?? 0).toDouble();
    final lock = (json['locked_balance'] ?? json['lockedBalance'] ?? 0).toDouble();
    final total = json['totalBalance'] != null ? (json['totalBalance']).toDouble() : (dep + win + bon);

    return WalletModel(
      totalBalance: total,
      depositBalance: dep,
      winningsBalance: win,
      bonusBalance: bon,
      lockedBalance: lock,
      isFrozen: json['is_frozen'] ?? json['isFrozen'] ?? false,
    );
  }
}

class LedgerEntryModel {
  final String id;
  final String transactionId;
  final String entryType;
  final String balanceType;
  final double amount;
  final double balanceAfter;
  final String category;
  final String description;
  final String createdAt;

  LedgerEntryModel({
    required this.id,
    required this.transactionId,
    required this.entryType,
    required this.balanceType,
    required this.amount,
    required this.balanceAfter,
    required this.category,
    required this.description,
    required this.createdAt,
  });

  factory LedgerEntryModel.fromJson(Map<String, dynamic> json) {
    return LedgerEntryModel(
      id: json['id'] ?? '',
      transactionId: json['transaction_id'] ?? json['transactionId'] ?? '',
      entryType: json['entry_type'] ?? json['entryType'] ?? 'CREDIT',
      balanceType: json['balance_type'] ?? json['balanceType'] ?? 'DEPOSIT',
      amount: (json['amount'] ?? 0).toDouble(),
      balanceAfter: (json['balance_after'] ?? json['balanceAfter'] ?? 0).toDouble(),
      category: json['category'] ?? 'DEPOSIT',
      description: json['description'] ?? '',
      createdAt: json['created_at'] ?? json['createdAt'] ?? '',
    );
  }
}

class TournamentModel {
  final String id;
  final String title;
  final String description;
  final String mode; // SOLO, DUO, SQUAD
  final String map; // Bermuda, Purgatory, etc.
  final double entryFee;
  final double prizePool;
  final int maxParticipants;
  final int currentParticipants;
  final String startTime;
  final String roomReleaseTime;
  final String status;
  final String bannerUrl;

  TournamentModel({
    required this.id,
    required this.title,
    required this.description,
    required this.mode,
    required this.map,
    required this.entryFee,
    required this.prizePool,
    required this.maxParticipants,
    required this.currentParticipants,
    required this.startTime,
    required this.roomReleaseTime,
    required this.status,
    required this.bannerUrl,
  });

  factory TournamentModel.fromJson(Map<String, dynamic> json) {
    return TournamentModel(
      id: json['id'] ?? '',
      title: json['title'] ?? 'Free Fire Tournament',
      description: json['description'] ?? '',
      mode: json['mode'] ?? 'SOLO',
      map: json['map'] ?? 'Bermuda',
      entryFee: (json['entry_fee'] ?? json['entryFee'] ?? 0).toDouble(),
      prizePool: (json['prize_pool'] ?? json['prizePool'] ?? 0).toDouble(),
      maxParticipants: json['max_participants'] ?? json['maxParticipants'] ?? 50,
      currentParticipants: json['current_participants'] ?? json['currentParticipants'] ?? 0,
      startTime: json['start_time'] ?? json['startTime'] ?? '',
      roomReleaseTime: json['room_release_time'] ?? json['roomReleaseTime'] ?? '',
      status: json['status'] ?? 'OPEN',
      bannerUrl: json['banner_url'] ?? json['bannerUrl'] ?? '',
    );
  }
}

class KycModel {
  final String id;
  final String status; // UNVERIFIED, PENDING, VERIFIED, REJECTED
  final String legalName;
  final String idType;
  final String idNumberMasked;
  final String? payoutUpiId;
  final String? rejectionReason;

  KycModel({
    required this.id,
    required this.status,
    required this.legalName,
    required this.idType,
    required this.idNumberMasked,
    this.payoutUpiId,
    this.rejectionReason,
  });

  factory KycModel.fromJson(Map<String, dynamic> json) {
    return KycModel(
      id: json['id'] ?? '',
      status: json['status'] ?? 'UNVERIFIED',
      legalName: json['legal_name'] ?? json['legalName'] ?? '',
      idType: json['id_type'] ?? json['idType'] ?? '',
      idNumberMasked: json['id_number_masked'] ?? json['idNumberMasked'] ?? '',
      payoutUpiId: json['payout_upi_id'] ?? json['payoutUpiId'],
      rejectionReason: json['rejection_reason'] ?? json['rejectionReason'],
    );
  }
}
