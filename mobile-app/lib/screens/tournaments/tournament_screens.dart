import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../models/models.dart';
import '../../services/api_service.dart';
import '../../widgets/custom_widgets.dart';

class TournamentListScreen extends StatefulWidget {
  const TournamentListScreen({Key? key}) : super(key: key);

  @override
  State<TournamentListScreen> createState() => _TournamentListScreenState();
}

class _TournamentListScreenState extends State<TournamentListScreen> {
  String _selectedMode = 'ALL';
  String _selectedMap = 'ALL';
  List<TournamentModel> _tournaments = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadTournaments();
  }

  void _loadTournaments() async {
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
    var filtered = _tournaments.where((t) {
      if (_selectedMode != 'ALL' && t.mode.toUpperCase() != _selectedMode) return false;
      if (_selectedMap != 'ALL' && t.map.toUpperCase() != _selectedMap.toUpperCase()) return false;
      return true;
    }).toList();

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('TOURNAMENT ARENA'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: AppTheme.neonCyan),
            onPressed: () {
              setState(() => _isLoading = true);
              _loadTournaments();
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Filter Chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: [
                _buildFilterChip('ALL MODES', _selectedMode == 'ALL', () => setState(() => _selectedMode = 'ALL')),
                _buildFilterChip('SOLO', _selectedMode == 'SOLO', () => setState(() => _selectedMode = 'SOLO')),
                _buildFilterChip('DUO', _selectedMode == 'DUO', () => setState(() => _selectedMode = 'DUO')),
                _buildFilterChip('SQUAD', _selectedMode == 'SQUAD', () => setState(() => _selectedMode = 'SQUAD')),
                const SizedBox(width: 8),
                Container(width: 1, height: 20, color: AppTheme.surfaceBorder),
                const SizedBox(width: 8),
                _buildFilterChip('BERMUDA', _selectedMap == 'Bermuda', () => setState(() => _selectedMap = 'Bermuda')),
                _buildFilterChip('PURGATORY', _selectedMap == 'Purgatory', () => setState(() => _selectedMap = 'Purgatory')),
                _buildFilterChip('KALAHARI', _selectedMap == 'Kalahari', () => setState(() => _selectedMap = 'Kalahari')),
              ],
            ),
          ),

          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator(color: AppTheme.neonCyan))
                : filtered.isEmpty
                    ? const Center(
                        child: Text('No tournaments match your filters', style: TextStyle(color: AppTheme.textSecondary)),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        itemCount: filtered.length,
                        itemBuilder: (ctx, i) {
                          final tourn = filtered[i];
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 12),
                            child: TournamentCard(
                              tournament: tourn,
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => TournamentDetailScreen(tournament: tourn),
                                  ),
                                );
                              },
                            ),
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label, bool isSelected, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(right: 8),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? AppTheme.neonCyan.withOpacity(0.15) : AppTheme.surface,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: isSelected ? AppTheme.neonCyan : AppTheme.surfaceBorder),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? AppTheme.neonCyan : AppTheme.textSecondary,
            fontSize: 11,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }
}

// 9. TOURNAMENT DETAILS SCREEN
class TournamentDetailScreen extends StatelessWidget {
  final TournamentModel tournament;

  const TournamentDetailScreen({Key? key, required this.tournament}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(title: const Text('MATCH BRIEFING')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Hero Tournament Header Card
            GlassCard(
              glow: true,
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.between,
                    children: [
                      StatusBadge(status: tournament.status),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(color: AppTheme.surfaceElevated, borderRadius: BorderRadius.circular(6)),
                        child: Text('${tournament.mode} • ${tournament.map}', style: const TextStyle(color: AppTheme.neonCyan, fontSize: 11, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(tournament.title, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 6),
                  Text(tournament.description, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _buildStatBox('ENTRY FEE', '₹${tournament.entryFee.toStringAsFixed(0)}', Colors.white),
                      _buildStatBox('PRIZE POOL', '₹${tournament.prizePool.toStringAsFixed(0)}', AppTheme.neonGold),
                      _buildStatBox('SLOTS FILLED', '${tournament.currentParticipants}/${tournament.maxParticipants}', AppTheme.neonCyan),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Prize Distribution Table
            const Text('PRIZE POOL DISTRIBUTION', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            GlassCard(
              padding: const EdgeInsets.all(12),
              child: Column(
                children: [
                  _buildPrizeRow('Rank #1 (Champion)', '₹${(tournament.prizePool * 0.40).toStringAsFixed(0)}', AppTheme.neonGold, true),
                  const Divider(color: AppTheme.surfaceBorder, height: 16),
                  _buildPrizeRow('Rank #2 (Runner-Up)', '₹${(tournament.prizePool * 0.25).toStringAsFixed(0)}', Colors.white, false),
                  const Divider(color: AppTheme.surfaceBorder, height: 16),
                  _buildPrizeRow('Rank #3 (3rd Place)', '₹${(tournament.prizePool * 0.15).toStringAsFixed(0)}', Colors.white, false),
                  const Divider(color: AppTheme.surfaceBorder, height: 16),
                  _buildPrizeRow('Rank #4 - #10 (Top 10)', '₹${(tournament.prizePool * 0.20).toStringAsFixed(0)}', AppTheme.neonCyan, false),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Scoring Formula Box
            const Text('SKILL SCORING FORMULA', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            GlassCard(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  Text('• Each Kill: +10 Points', style: TextStyle(color: AppTheme.neonCyan, fontSize: 13, fontWeight: FontWeight.bold)),
                  SizedBox(height: 4),
                  Text('• 1st Place (Booyah): +100 Placement Points', style: TextStyle(color: Colors.white, fontSize: 12)),
                  Text('• 2nd Place: +80 Placement Points', style: TextStyle(color: Colors.white, fontSize: 12)),
                  Text('• 3rd Place: +60 Placement Points', style: TextStyle(color: Colors.white, fontSize: 12)),
                  Text('• Final Score = Kill Points + Placement Points', style: TextStyle(color: AppTheme.textSecondary, fontSize: 11, fontStyle: FontStyle.italic)),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Rules
            const Text('OFFICIAL TOURNAMENT RULES', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            GlassCard(
              padding: const EdgeInsets.all(12),
              child: const Text(
                '1. No emulators allowed in mobile brackets.\n'
                '2. Room ID & Password will be unlocked 15 minutes before match start.\n'
                '3. Teaming/collusion in Solo matches results in permanent hardware ban.\n'
                '4. Screenshot proof must be uploaded within 20 minutes of match completion.',
                style: TextStyle(color: AppTheme.textSecondary, fontSize: 12, height: 1.5),
              ),
            ),
            const SizedBox(height: 30),

            PremiumButton(
              label: tournament.status == 'OPEN' ? 'JOIN TOURNAMENT (₹${tournament.entryFee.toStringAsFixed(0)})' : 'REGISTRATION CLOSED',
              onPressed: tournament.status == 'OPEN'
                  ? () {
                      _showJoinConfirmation(context, tournament);
                    }
                  : null,
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  static Widget _buildStatBox(String label, String value, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      decoration: BoxDecoration(color: AppTheme.surfaceElevated, borderRadius: BorderRadius.circular(8)),
      child: Column(
        children: [
          Text(label, style: const TextStyle(color: AppTheme.textMuted, fontSize: 9, fontWeight: FontWeight.bold)),
          const SizedBox(height: 2),
          Text(value, style: TextStyle(color: color, fontSize: 16, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  static Widget _buildPrizeRow(String rank, String prize, Color prizeColor, bool isFirst) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.between,
      children: [
        Row(
          children: [
            if (isFirst) const Icon(Icons.emoji_events, color: AppTheme.neonGold, size: 16) else const SizedBox(width: 4),
            const SizedBox(width: 6),
            Text(rank, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600)),
          ],
        ),
        Text(prize, style: TextStyle(color: prizeColor, fontSize: 14, fontWeight: FontWeight.bold)),
      ],
    );
  }

  void _showJoinConfirmation(BuildContext context, TournamentModel t) {
    final uidController = TextEditingController(text: ApiService().currentUserProfile.ffUid);
    final ignController = TextEditingController(text: ApiService().currentUserProfile.ffIgn);

    showModalBottomSheet(
      context: context,
      backgroundColor: AppTheme.surface,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      isScrollControlled: true,
      builder: (ctx) {
        return Padding(
          padding: EdgeInsets.only(
            left: 20,
            right: 20,
            top: 20,
            bottom: MediaQuery.of(ctx).viewInsets.bottom + 20,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('CONFIRM REGISTRATION', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 4),
              Text(t.title, style: const TextStyle(color: AppTheme.neonCyan, fontSize: 12)),
              const SizedBox(height: 16),

              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: AppTheme.surfaceElevated, borderRadius: BorderRadius.circular(10)),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.between,
                  children: [
                    const Text('Wallet Balance Available', style: TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
                    Text('₹${ApiService().currentWallet.totalBalance.toStringAsFixed(2)}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  ],
                ),
              ),
              const SizedBox(height: 12),

              TextField(
                controller: ignController,
                style: const TextStyle(color: Colors.white, fontSize: 13),
                decoration: InputDecoration(
                  labelText: 'Free Fire In-Game Name (IGN)',
                  labelStyle: const TextStyle(color: AppTheme.textSecondary),
                  filled: true,
                  fillColor: AppTheme.background,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                ),
              ),
              const SizedBox(height: 10),

              TextField(
                controller: uidController,
                style: const TextStyle(color: Colors.white, fontSize: 13),
                decoration: InputDecoration(
                  labelText: 'Free Fire UID',
                  labelStyle: const TextStyle(color: AppTheme.textSecondary),
                  filled: true,
                  fillColor: AppTheme.background,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                ),
              ),
              const SizedBox(height: 20),

              PremiumButton(
                label: 'PAY ₹${t.entryFee.toStringAsFixed(0)} & CONFIRM SLOT',
                onPressed: () async {
                  await ApiService().joinTournament(t.id, ignController.text, uidController.text);
                  Navigator.pop(ctx);
                  Navigator.pushReplacement(
                    context,
                    MaterialPageRoute(
                      builder: (_) => JoinSuccessScreen(tournament: t, slotNumber: t.currentParticipants + 1),
                    ),
                  );
                },
              ),
            ],
          ),
        );
      },
    );
  }
}

// 11. JOIN SUCCESS SCREEN
class JoinSuccessScreen extends StatelessWidget {
  final TournamentModel tournament;
  final int slotNumber;

  const JoinSuccessScreen({Key? key, required this.tournament, required this.slotNumber}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Container(
                width: 90,
                height: 90,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppTheme.accentGreen.withOpacity(0.15),
                  border: Border.all(color: AppTheme.accentGreen, width: 2),
                ),
                child: const Icon(Icons.check, color: AppTheme.accentGreen, size: 50),
              ),
              const SizedBox(height: 24),
              const Text('SLOT CONFIRMED! 🎉', style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              Text('You have successfully entered ${tournament.title}', textAlign: TextAlign.center, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
              const SizedBox(height: 24),

              GlassCard(
                glow: true,
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Assigned Slot Number', style: TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
                        Text('#$slotNumber', style: const TextStyle(color: AppTheme.neonCyan, fontSize: 16, fontWeight: FontWeight.bold)),
                      ],
                    ),
                    const Divider(color: AppTheme.surfaceBorder, height: 20),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: const [
                        Text('Room Credentials Unlock', style: TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
                        Text('15 Mins Before Start', style: TextStyle(color: AppTheme.neonGold, fontSize: 12, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 36),

              PremiumButton(
                label: 'GO TO MY MATCHES',
                onPressed: () {
                  Navigator.pop(context);
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}
