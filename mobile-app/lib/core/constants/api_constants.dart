class ApiConstants {
  // Use 10.0.2.2 for Android Emulator, or localhost / LAN IP for physical device
  static const String baseUrl = 'http://10.0.2.2:5000/api/v1';

  // Auth
  static const String sendOtp = '$baseUrl/auth/otp/send';
  static const String register = '$baseUrl/auth/register';
  static const String login = '$baseUrl/auth/login';
  static const String me = '$baseUrl/auth/me';

  // Tournaments
  static const String tournaments = '$baseUrl/tournaments';
  static const String myMatches = '$baseUrl/tournaments/my/matches';

  // Wallet
  static const String wallet = '$baseUrl/wallet';
  static const String transactions = '$baseUrl/wallet/transactions';
  static const String depositOrder = '$baseUrl/wallet/deposit/order';
  static const String depositVerify = '$baseUrl/wallet/deposit/verify';
  static const String withdraw = '$baseUrl/wallet/withdraw';
  static const String withdrawals = '$baseUrl/wallet/withdrawals';

  // KYC
  static const String kycStatus = '$baseUrl/kyc/status';
  static const String kycSubmit = '$baseUrl/kyc/submit';

  // Leaderboard & Social
  static const String leaderboard = '$baseUrl/leaderboard';
  static const String referrals = '$baseUrl/referrals';
  static const String notifications = '$baseUrl/notifications';
  static const String supportTickets = '$baseUrl/support/tickets';
  static const String supportFaq = '$baseUrl/support/faq';
  static const String disputes = '$baseUrl/support/disputes';
  static const String settingsPublic = '$baseUrl/settings/public';
}
