import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../models/models.dart';
import '../../services/api_service.dart';
import '../../widgets/custom_widgets.dart';
import '../tournaments/tournament_screens.dart';
import '../wallet/wallet_screens.dart';
import '../leaderboard/leaderboard_screen.dart';
import '../referral/referral_screen.dart';

class HomeScreen extends StatefulWidget {
  final Function(int) onTabChange;

  const HomeScreen({Key? key, required this.onTabChange}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<TournamentModel> _tournaments = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  void _loadData() async {
    final list = await ApiService().fetchTournaments();
    if (mounted) {
      setState(() {
        _tournaments = list;
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final profile = ApiService().currentUserProfile;
    final wallet = ApiService().currentWallet;

    return Scaffold(
      backgroundColor: AppTheme.background,
      body: SafeArea(
        child: RefreshIndicator(
          color: AppTheme.neonCyan,
          onRefresh: () async {
            _loadData();
          },
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Top Header Row
                Row(
                  mainAxisAlignment: MainAxisAlignment.between,
                  children: [
                    Row(
                      children: [
                        CircleAvatar(
                          radius: 20,
                          backgroundColor: AppTheme.surfaceElevated,
                          child: Text(profile.username[0], style: const TextStyle(color: AppTheme.neonCyan, fontWeight: FontWeight.bold)),
                        ),
                        const SizedBox(width: 10),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('WELCOME BACK,', style: const TextStyle(color: AppTheme.textMuted, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1.0)),
                            Text(profile.username, style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold)),
                          ],
                        ),
                      ],
                    ),
                    // Wallet Balance Chip
                    GestureDetector(
                      onTap: () => widget.onTabChange(3), // Switch to Wallet Tab
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: AppTheme.surface,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: AppTheme.neonCyan.withOpacity(0.4)),
                          boxShadow: [
                            BoxShadow(color: AppTheme.neonCyan.withOpacity(0.1), blurRadius: 10),
                          ],
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.account_balance_wallet, color: AppTheme.neonCyan, size: 16),
                            const SizedBox(width: 6),
                            Text('₹${wallet.totalBalance.toStringAsFixed(0)}', style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                            const SizedBox(width: 4),
                            const Icon(Icons.add_circle, color: AppTheme.neonCyan, size: 14),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 18),

                // Hero Banner
                GlassCard(
                  glow: true,
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(color: AppTheme.neonCyan.withOpacity(0.15), borderRadius: BorderRadius.circular(4)),
                        child: const Text('OFFICIAL ESPORTS ARENA', style: TextStyle(color: AppTheme.neonCyan, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1.2)),
                      ),
                      const SizedBox(height: 10),
                      const Text(
                        'PLAY • COMPETE • WIN',
                        style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold, letterSpacing: 1.0),
                      ),
                      const SizedBox(height: 6),
                      const Text(
                        'Daily Free Fire skill-based Battle Royale brackets with instant verified withdrawals.',
                        style: TextStyle(color: AppTheme.textSecondary, fontSize: 12),
                      ),
                      const SizedBox(height: 16),
                      SizedBox(
                        height: 40,
                        child: ElevatedButton(
                          onPressed: () => widget.onTabChange(1), // Switch to Tournaments Tab
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppTheme.neonCyan,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                          ),
                          child: const Text('JOIN TOURNAMENTS', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 12)),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                // Quick Shortcuts Row
                Row(
                  children: [
                    Expanded(
                      child: _buildQuickTile(Icons.emoji_events, 'Leaderboard', 'Top Champions', AppTheme.neonGold, () {
                        Navigator.push(context, MaterialPageRoute(builder: (_) => const LeaderboardScreen()));
                      }),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: _buildQuickTile(Icons.card_giftcard, 'Invite Friends', 'Earn ₹25 Bonus', AppTheme.neonCyan, () {
                        Navigator.push(context, MaterialPageRoute(builder: (_) => const ReferralScreen()));
                      }),
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                // Featured Live Tournaments
                Row(
                  mainAxisAlignment: MainAxisAlignment.between,
                  children: [
                    const Text('LIVE & FEATURED MATCHES', style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold, letterSpacing: 0.5)),
                    TextButton(
                      onPressed: () => widget.onTabChange(1),
                      child: const Text('View All', style: TextStyle(color: AppTheme.neonCyan, fontSize: 12)),
                    ),
                  ],
                ),
                const SizedBox(height: 8),

                _isLoading
                    ? const Center(child: CircularProgressIndicator(color: AppTheme.neonCyan))
                    : Column(
                        children: _tournaments.take(3).map((t) {
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 12),
                            child: TournamentCard(
                              tournament: t,
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(builder: (_) => TournamentDetailScreen(tournament: t)),
                                );
                              },
                            ),
                          );
                        }).toList(),
                      ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildQuickTile(IconData icon, String title, String subtitle, Color color, VoidCallback onTap) {
    return GlassCard(
      onTap: onTap,
      padding: const EdgeInsets.all(12),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(color: color.withOpacity(0.12), borderRadius: BorderRadius.circular(8)),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(width: 10),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
              Text(subtitle, style: const TextStyle(color: AppTheme.textMuted, fontSize: 10)),
            ],
          ),
        ],
      ),
    );
  }
}
