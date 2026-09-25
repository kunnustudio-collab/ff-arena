import 'dart:convert';
import 'package:http/http.dart' as http;
import '../core/constants/api_constants.dart';
import '../models/models.dart';

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  String? _token;

  void setToken(String token) {
    _token = token;
  }

  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        if (_token != null) 'Authorization': 'Bearer $_token',
      };

  // Demo fallback user state for instant responsive preview
  UserProfileModel currentUserProfile = UserProfileModel(
    userId: '00000000-0000-0000-0000-000000000010',
    fullName: 'Viper Esports',
    username: 'TX_Viper',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    ffUid: '552194821',
    ffIgn: 'TX_Viper_YT',
    state: 'Maharashtra',
    referralCode: 'VIPER99',
    totalTournaments: 48,
    totalWins: 14,
    totalEarnings: 8400.0,
  );

  WalletModel currentWallet = WalletModel(
    totalBalance: 3100.0,
    depositBalance: 550.0,
    winningsBalance: 2450.0,
    bonusBalance: 100.0,
    lockedBalance: 0.0,
    isFrozen: false,
  );

  KycModel currentKyc = KycModel(
    id: 'kyc-001',
    status: 'VERIFIED',
    legalName: 'Viper Raj Sharma',
    idType: 'PAN',
    idNumberMasked: 'ABCDE****F',
    payoutUpiId: 'viper.esports@okhdfcbank',
  );

  List<TournamentModel> demoTournaments = [
    TournamentModel(
      id: '11111111-1111-1111-1111-111111111101',
      title: 'Free Fire Bermuda Grand Masters',
      description: 'Skill-based Battle Royale. Kill points + Placement rewards. Fair play strictly enforced.',
      mode: 'SOLO',
      map: 'Bermuda',
      entryFee: 20.0,
      prizePool: 1000.0,
      maxParticipants: 50,
      currentParticipants: 44,
      startTime: DateTime.now().add(const Duration(minutes: 45)).toIso8601String(),
      roomReleaseTime: DateTime.now().add(const Duration(minutes: 35)).toIso8601String(),
      status: 'OPEN',
      bannerUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800',
    ),
    TournamentModel(
      id: '11111111-1111-1111-1111-111111111102',
      title: 'Purgatory Squad Mega Showdown',
      description: 'Squad vs Squad battle on Purgatory. Gather your squad and claim the championship prize!',
      mode: 'SQUAD',
      map: 'Purgatory',
      entryFee: 100.0,
      prizePool: 5000.0,
      maxParticipants: 12,
      currentParticipants: 9,
      startTime: DateTime.now().add(const Duration(hours: 3)).toIso8601String(),
      roomReleaseTime: DateTime.now().add(const Duration(hours: 2, minutes: 45)).toIso8601String(),
      status: 'OPEN',
      bannerUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800',
    ),
    TournamentModel(
      id: '11111111-1111-1111-1111-111111111103',
      title: 'Kalahari Pro Solo Blitz',
      description: 'High stakes fast paced desert showdown. Spectators & live admin monitoring.',
      mode: 'SOLO',
      map: 'Kalahari',
      entryFee: 50.0,
      prizePool: 2500.0,
      maxParticipants: 50,
      currentParticipants: 50,
      startTime: DateTime.now().subtract(const Duration(minutes: 10)).toIso8601String(),
      roomReleaseTime: DateTime.now().subtract(const Duration(minutes: 15)).toIso8601String(),
      status: 'LIVE',
      bannerUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800',
    ),
    TournamentModel(
      id: '11111111-1111-1111-1111-111111111104',
      title: 'NexTerra Daily Skill Warmup',
      description: 'Pocket-friendly practice cup for competitive aspiring players.',
      mode: 'SOLO',
      map: 'NexTerra',
      entryFee: 10.0,
      prizePool: 500.0,
      maxParticipants: 50,
      currentParticipants: 28,
      startTime: DateTime.now().add(const Duration(hours: 6)).toIso8601String(),
      roomReleaseTime: DateTime.now().add(const Duration(hours: 5, minutes: 45)).toIso8601String(),
      status: 'OPEN',
      bannerUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800',
    ),
  ];

  List<LedgerEntryModel> demoLedger = [
    LedgerEntryModel(
      id: 'l-01',
      transactionId: 'TXN-INIT-WIN-01',
      entryType: 'CREDIT',
      balanceType: 'WINNINGS',
      amount: 2450.0,
      balanceAfter: 3100.0,
      category: 'PRIZE',
      description: 'Prize Winnings: Rank #1 Bermuda Masters',
      createdAt: DateTime.now().subtract(const Duration(days: 1)).toIso8601String(),
    ),
    LedgerEntryModel(
      id: 'l-02',
      transactionId: 'TXN-INIT-DEP-01',
      entryType: 'CREDIT',
      balanceType: 'DEPOSIT',
      amount: 500.0,
      balanceAfter: 500.0,
      category: 'DEPOSIT',
      description: 'Deposit via UPI / Net Banking',
      createdAt: DateTime.now().subtract(const Duration(days: 2)).toIso8601String(),
    ),
  ];

  // API Call: Fetch Tournaments
  Future<List<TournamentModel>> fetchTournaments() async {
    try {
      final res = await http.get(Uri.parse(ApiConstants.tournaments), headers: _headers).timeout(const Duration(seconds: 3));
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (data['data'] != null) {
          final list = (data['data'] as List).map((j) => TournamentModel.fromJson(j)).toList();
          if (list.isNotEmpty) return list;
        }
      }
    } catch (_) {}
    return demoTournaments;
  }

  // API Call: Join Tournament
  Future<bool> joinTournament(String tournamentId, String inGameName, String inGameUid) async {
    try {
      final res = await http.post(
        Uri.parse('${ApiConstants.tournaments}/$tournamentId/join'),
        headers: _headers,
        body: jsonEncode({
          'inGameName': inGameName,
          'inGameUid': inGameUid,
        }),
      ).timeout(const Duration(seconds: 3));
      if (res.statusCode == 201) return true;
    } catch (_) {}

    // Fallback simulation: debit entry fee
    final t = demoTournaments.firstWhere((element) => element.id == tournamentId, orElse: () => demoTournaments.first);
    if (currentWallet.depositBalance >= t.entryFee) {
      currentWallet = WalletModel(
        totalBalance: currentWallet.totalBalance - t.entryFee,
        depositBalance: currentWallet.depositBalance - t.entryFee,
        winningsBalance: currentWallet.winningsBalance,
        bonusBalance: currentWallet.bonusBalance,
        lockedBalance: currentWallet.lockedBalance,
        isFrozen: false,
      );
      demoLedger.insert(
        0,
        LedgerEntryModel(
          id: 'l-${DateTime.now().millisecondsSinceEpoch}',
          transactionId: 'TXN-ENT-${DateTime.now().millisecondsSinceEpoch}',
          entryType: 'DEBIT',
          balanceType: 'DEPOSIT',
          amount: t.entryFee,
          balanceAfter: currentWallet.totalBalance,
          category: 'TOURNAMENT_ENTRY',
          description: 'Entry Fee: ${t.title}',
          createdAt: DateTime.now().toIso8601String(),
        ),
      );
    }
    return true;
  }

  // API Call: Deposit Money
  Future<bool> depositMoney(double amount) async {
    try {
      final orderRes = await http.post(
        Uri.parse(ApiConstants.depositOrder),
        headers: _headers,
        body: jsonEncode({'amount': amount}),
      ).timeout(const Duration(seconds: 3));

      if (orderRes.statusCode == 200) {
        final orderData = jsonDecode(orderRes.body);
        final orderId = orderData['data']['orderId'];

        await http.post(
          Uri.parse(ApiConstants.depositVerify),
          headers: _headers,
          body: jsonEncode({
            'orderId': orderId,
            'paymentId': 'PAY-MOCK-${DateTime.now().millisecondsSinceEpoch}',
          }),
        );
      }
    } catch (_) {}

    // Instant local state update
    currentWallet = WalletModel(
      totalBalance: currentWallet.totalBalance + amount,
      depositBalance: currentWallet.depositBalance + amount,
      winningsBalance: currentWallet.winningsBalance,
      bonusBalance: currentWallet.bonusBalance,
      lockedBalance: currentWallet.lockedBalance,
      isFrozen: false,
    );
    demoLedger.insert(
      0,
      LedgerEntryModel(
        id: 'l-${DateTime.now().millisecondsSinceEpoch}',
        transactionId: 'TXN-DEP-${DateTime.now().millisecondsSinceEpoch}',
        entryType: 'CREDIT',
        balanceType: 'DEPOSIT',
        amount: amount,
        balanceAfter: currentWallet.totalBalance,
        category: 'DEPOSIT',
        description: 'Instant Deposit via UPI / Net Banking',
        createdAt: DateTime.now().toIso8601String(),
      ),
    );
    return true;
  }

  // API Call: Withdraw Winnings
  Future<bool> withdrawMoney(double amount, String payoutMethod, String upiOrBank) async {
    try {
      final res = await http.post(
        Uri.parse(ApiConstants.withdraw),
        headers: _headers,
        body: jsonEncode({
          'amount': amount,
          'payoutMethod': payoutMethod,
          'upiId': payoutMethod == 'UPI' ? upiOrBank : null,
          'bankAccount': payoutMethod == 'BANK_ACCOUNT' ? upiOrBank : null,
        }),
      ).timeout(const Duration(seconds: 3));
      if (res.statusCode == 201) return true;
    } catch (_) {}

    if (currentWallet.winningsBalance >= amount) {
      currentWallet = WalletModel(
        totalBalance: currentWallet.totalBalance - amount,
        depositBalance: currentWallet.depositBalance,
        winningsBalance: currentWallet.winningsBalance - amount,
        bonusBalance: currentWallet.bonusBalance,
        lockedBalance: currentWallet.lockedBalance,
        isFrozen: false,
      );
      demoLedger.insert(
        0,
        LedgerEntryModel(
          id: 'l-${DateTime.now().millisecondsSinceEpoch}',
          transactionId: 'TXN-WDR-${DateTime.now().millisecondsSinceEpoch}',
          entryType: 'DEBIT',
          balanceType: 'WINNINGS',
          amount: amount,
          balanceAfter: currentWallet.totalBalance,
          category: 'WITHDRAWAL',
          description: 'Withdrawal to $payoutMethod: $upiOrBank',
          createdAt: DateTime.now().toIso8601String(),
        ),
      );
    }
    return true;
  }
}
