import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../widgets/custom_widgets.dart';

class SupportCenterScreen extends StatelessWidget {
  const SupportCenterScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final faqs = [
      {
        'q': 'Is Tournament X skill-based and legal?',
        'a': 'Yes. Tournament X is an organized esports platform where game results depend exclusively on the strategic and tactical skills of players in Free Fire.'
      },
      {
        'q': 'When do I get my Custom Room ID and Password?',
        'a': 'Credentials unlock automatically 15 minutes prior to match start in the "My Matches" section and are sent via push notification.'
      },
      {
        'q': 'How long do withdrawals take?',
        'a': 'Withdrawals via UPI or IMPS are verified and processed within 15 to 30 minutes.'
      },
    ];

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(title: const Text('PLAYER SUPPORT & FAQ')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Quick Action Buttons
            Row(
              children: [
                Expanded(
                  child: GlassCard(
                    padding: const EdgeInsets.all(14),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Icon(Icons.headset_mic, color: AppTheme.neonCyan, size: 24),
                        SizedBox(height: 8),
                        Text('Ticket Support', style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                        Text('Response in < 2 hrs', style: TextStyle(color: AppTheme.textMuted, fontSize: 10)),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: GlassCard(
                    onTap: () {
                      Navigator.push(context, MaterialPageRoute(builder: (_) => const DisputeScreen()));
                    },
                    padding: const EdgeInsets.all(14),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Icon(Icons.scale, color: AppTheme.neonGold, size: 24),
                        SizedBox(height: 8),
                        Text('Raise Dispute', style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                        Text('Appeal match scores', style: TextStyle(color: AppTheme.textMuted, fontSize: 10)),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),

            const Text('FREQUENTLY ASKED QUESTIONS', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),

            ...faqs.map((f) => Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: GlassCard(
                    padding: const EdgeInsets.all(14),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(f['q']!, style: const TextStyle(color: AppTheme.neonCyan, fontSize: 13, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 6),
                        Text(f['a']!, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12, height: 1.4)),
                      ],
                    ),
                  ),
                )),
          ],
        ),
      ),
    );
  }
}

class DisputeScreen extends StatefulWidget {
  const DisputeScreen({Key? key}) : super(key: key);

  @override
  State<DisputeScreen> createState() => _DisputeScreenState();
}

class _DisputeScreenState extends State<DisputeScreen> {
  final _reasonController = TextEditingController();
  String _category = 'MATCH_RESULT';
  bool _isSubmitting = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(title: const Text('RAISE A DISPUTE')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('APPEAL MATCH OR PAYMENT ISSUE', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            const Text('Every dispute is adjudicated by tournament referees with video/screenshot evidence', style: TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
            const SizedBox(height: 20),

            const Text('DISPUTE CATEGORY', style: TextStyle(color: AppTheme.textMuted, fontSize: 10, fontWeight: FontWeight.bold)),
            const SizedBox(height: 6),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              decoration: BoxDecoration(color: AppTheme.surface, borderRadius: BorderRadius.circular(10), border: Border.all(color: AppTheme.surfaceBorder)),
              child: DropdownButton<String>(
                value: _category,
                isExpanded: true,
                dropdownColor: AppTheme.surface,
                underline: const SizedBox(),
                items: ['MATCH_RESULT', 'PRIZE_PAYOUT', 'ROOM_CONNECTIVITY', 'PLAYER_CHEATING'].map((cat) {
                  return DropdownMenuItem(value: cat, child: Text(cat, style: const TextStyle(color: Colors.white, fontSize: 13)));
                }).toList(),
                onChanged: (v) => setState(() => _category = v ?? 'MATCH_RESULT'),
              ),
            ),
            const SizedBox(height: 16),

            const Text('DETAILED EXPLANATION', style: TextStyle(color: AppTheme.textMuted, fontSize: 10, fontWeight: FontWeight.bold)),
            const SizedBox(height: 6),
            TextField(
              controller: _reasonController,
              maxLines: 4,
              style: const TextStyle(color: Colors.white, fontSize: 13),
              decoration: InputDecoration(
                filled: true,
                fillColor: AppTheme.surface,
                hintText: 'Describe what occurred, including match time and Free Fire player names involved...',
                hintStyle: const TextStyle(color: AppTheme.textMuted),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
              ),
            ),
            const SizedBox(height: 24),

            PremiumButton(
              label: 'SUBMIT DISPUTE FOR REFEREE REVIEW',
              isLoading: _isSubmitting,
              onPressed: () async {
                setState(() => _isSubmitting = true);
                await Future.delayed(const Duration(milliseconds: 700));
                setState(() => _isSubmitting = false);
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Dispute registered under #DSP-7712. Admin will review within 2 hours.')),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
