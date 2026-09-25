import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../widgets/custom_widgets.dart';

class LeaderboardScreen extends StatefulWidget {
  const LeaderboardScreen({Key? key}) : super(key: key);

  @override
  State<LeaderboardScreen> createState() => _LeaderboardScreenState();
}

class _LeaderboardScreenState extends State<LeaderboardScreen> {
  String _period = 'ALL_TIME';

  final List<Map<String, dynamic>> _topPlayers = [
    {
      'rank': 1,
      'name': 'TX_Viper_YT',
      'kills': 342,
      'wins': 48,
      'earnings': 18500.0,
      'winRate': '68%',
    },
    {
      'rank': 2,
      'name': 'TX_Shadow_FF',
      'kills': 298,
      'wins': 39,
      'earnings': 14200.0,
      'winRate': '61%',
    },
    {
      'rank': 3,
      'name': 'TX_Blaze_OP',
      'kills': 264,
      'wins': 32,
      'earnings': 11800.0,
      'winRate': '55%',
    },
    {
      'rank': 4,
      'name': 'TX_Phantom',
      'kills': 210,
      'wins': 26,
      'earnings': 8900.0,
      'winRate': '48%',
    },
    {
      'rank': 5,
      'name': 'TX_SniperGod',
      'kills': 195,
      'wins': 22,
      'earnings': 7400.0,
      'winRate': '44%',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(title: const Text('CHAMPIONS LEADERBOARD')),
      body: Column(
        children: [
          // Period Selector Chips
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildPeriodChip('TODAY', _period == 'TODAY', () => setState(() => _period = 'TODAY')),
                _buildPeriodChip('WEEKLY', _period == 'WEEKLY', () => setState(() => _period = 'WEEKLY')),
                _buildPeriodChip('MONTHLY', _period == 'MONTHLY', () => setState(() => _period = 'MONTHLY')),
                _buildPeriodChip('ALL TIME', _period == 'ALL_TIME', () => setState(() => _period = 'ALL_TIME')),
              ],
            ),
          ),

          // Podium for Top 3
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                // 2nd Place (Silver)
                _buildPodiumSpot(_topPlayers[1], '2', 120, const Color(0xFFC0C0C0)),
                const SizedBox(width: 12),
                // 1st Place (Gold Champion)
                _buildPodiumSpot(_topPlayers[0], '1', 150, AppTheme.neonGold, isFirst: true),
                const SizedBox(width: 12),
                // 3rd Place (Bronze)
                _buildPodiumSpot(_topPlayers[2], '3', 100, const Color(0xFFCD7F32)),
              ],
            ),
          ),

          // Rest of Ranks list
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: _topPlayers.length - 3,
              itemBuilder: (ctx, i) {
                final player = _topPlayers[i + 3];
                return Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: GlassCard(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.between,
                      children: [
                        Row(
                          children: [
                            Text('#${player['rank']}', style: const TextStyle(color: AppTheme.textSecondary, fontWeight: FontWeight.bold, fontSize: 13)),
                            const SizedBox(width: 14),
                            CircleAvatar(
                              radius: 16,
                              backgroundColor: AppTheme.surfaceElevated,
                              child: Text(player['name'][0], style: const TextStyle(color: AppTheme.neonCyan, fontWeight: FontWeight.bold)),
                            ),
                            const SizedBox(width: 12),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(player['name'], style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                                Text('${player['kills']} Kills • ${player['winRate']} Win Rate', style: const TextStyle(color: AppTheme.textMuted, fontSize: 10)),
                              ],
                            ),
                          ],
                        ),
                        Text('₹${(player['earnings'] as double).toStringAsFixed(0)}', style: const TextStyle(color: AppTheme.neonGold, fontWeight: FontWeight.bold, fontSize: 14)),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPeriodChip(String label, bool active, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: active ? AppTheme.neonCyan.withOpacity(0.15) : AppTheme.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: active ? AppTheme.neonCyan : AppTheme.surfaceBorder),
        ),
        child: Text(
          label,
          style: TextStyle(color: active ? AppTheme.neonCyan : AppTheme.textSecondary, fontSize: 10, fontWeight: FontWeight.bold),
        ),
      ),
    );
  }

  Widget _buildPodiumSpot(Map<String, dynamic> player, String rank, double height, Color crownColor, {bool isFirst = false}) {
    return Column(
      children: [
        Icon(Icons.emoji_events, color: crownColor, size: isFirst ? 28 : 22),
        const SizedBox(height: 4),
        CircleAvatar(
          radius: isFirst ? 24 : 18,
          backgroundColor: AppTheme.surfaceElevated,
          child: Text(player['name'][0], style: TextStyle(color: crownColor, fontWeight: FontWeight.bold)),
        ),
        const SizedBox(height: 4),
        Text(
          player['name'],
          style: TextStyle(color: Colors.white, fontSize: isFirst ? 11 : 9, fontWeight: FontWeight.bold),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        Text('₹${(player['earnings'] as double).toStringAsFixed(0)}', style: TextStyle(color: AppTheme.neonGold, fontSize: 10, fontWeight: FontWeight.bold)),
        const SizedBox(height: 6),
        Container(
          width: isFirst ? 80 : 70,
          height: height,
          decoration: BoxDecoration(
            color: AppTheme.surfaceElevated,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(8)),
            border: Border.all(color: crownColor.withOpacity(0.4)),
          ),
          child: Center(
            child: Text(
              '#$rank',
              style: TextStyle(color: crownColor, fontSize: 20, fontWeight: FontWeight.bold),
            ),
          ),
        ),
      ],
    );
  }
}
