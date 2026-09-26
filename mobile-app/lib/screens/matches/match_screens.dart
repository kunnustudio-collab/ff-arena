import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../core/theme/app_theme.dart';
import '../../models/models.dart';
import '../../services/api_service.dart';
import '../../widgets/custom_widgets.dart';

class MyMatchesScreen extends StatefulWidget {
  const MyMatchesScreen({Key? key}) : super(key: key);

  @override
  State<MyMatchesScreen> createState() => _MyMatchesScreenState();
}

class _MyMatchesScreenState extends State<MyMatchesScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('MY MATCHES'),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppTheme.neonCyan,
          labelColor: AppTheme.neonCyan,
          unselectedLabelColor: AppTheme.textMuted,
          labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
          tabs: const [
            Tab(text: 'UPCOMING (1)'),
            Tab(text: 'LIVE (1)'),
            Tab(text: 'COMPLETED (2)'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildUpcomingTab(),
          _buildLiveTab(),
          _buildCompletedTab(),
        ],
      ),
    );
  }

  Widget _buildUpcomingTab() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        GlassCard(
          glow: true,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: const [
                  StatusBadge(status: 'OPEN'),
                  Text('SOLO • BERMUDA', style: TextStyle(color: AppTheme.neonCyan, fontSize: 11, fontWeight: FontWeight.bold)),
                ],
              ),
              const SizedBox(height: 10),
              const Text('Free Fire Bermuda Grand Masters', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
              const SizedBox(height: 6),
              const Text('Match starts in 42 minutes', style: TextStyle(color: AppTheme.neonGold, fontSize: 12, fontWeight: FontWeight.bold)),
              const SizedBox(height: 14),

              Row(
                children: [
                  Expanded(
                    child: PremiumButton(
                      label: 'VIEW ROOM CREDENTIALS',
                      icon: Icons.key,
                      height: 44,
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => const RoomCredentialsScreen(
                              tournamentTitle: 'Free Fire Bermuda Grand Masters',
                              roomId: '9921448',
                              roomPassword: 'TX2026BERMUDA',
                              isUnlocked: true,
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildLiveTab() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        GlassCard(
          glow: true,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: const [
                  StatusBadge(status: 'LIVE'),
                  Text('SOLO • KALAHARI', style: TextStyle(color: AppTheme.accentRed, fontSize: 11, fontWeight: FontWeight.bold)),
                ],
              ),
              const SizedBox(height: 10),
              const Text('Kalahari Pro Solo Blitz', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
              const SizedBox(height: 6),
              const Text('Match is in progress • Upload proof once finished', style: TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
              const SizedBox(height: 14),

              Row(
                children: [
                  Expanded(
                    child: PremiumButton(
                      label: 'SUBMIT MATCH PROOF',
                      icon: Icons.upload_file,
                      height: 44,
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => const SubmitResultScreen(
                              tournamentTitle: 'Kalahari Pro Solo Blitz',
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildCompletedTab() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        GlassCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: const [
                  StatusBadge(status: 'COMPLETED'),
                  Text('RANK #1 • ₹400 WON', style: TextStyle(color: AppTheme.neonGold, fontSize: 12, fontWeight: FontWeight.bold)),
                ],
              ),
              const SizedBox(height: 8),
              const Text('Free Fire Bermuda Masters #101', style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold)),
              const SizedBox(height: 4),
              const Text('8 Kills • Booyah Placement • Score: 180 Pts', style: TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
            ],
          ),
        ),
      ],
    );
  }
}

// 14. ROOM CREDENTIALS SCREEN
class RoomCredentialsScreen extends StatelessWidget {
  final String tournamentTitle;
  final String roomId;
  final String roomPassword;
  final bool isUnlocked;

  const RoomCredentialsScreen({
    Key? key,
    required this.tournamentTitle,
    required this.roomId,
    required this.roomPassword,
    required this.isUnlocked,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(title: const Text('CUSTOM ROOM ACCESS')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            GlassCard(
              glow: true,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: const [
                      Icon(Icons.lock_open, color: AppTheme.neonCyan, size: 20),
                      SizedBox(width: 8),
                      Text('ROOM CREDENTIALS UNLOCKED', style: TextStyle(color: AppTheme.neonCyan, fontSize: 13, fontWeight: FontWeight.bold)),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(tournamentTitle, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 20),

                  // Room ID Box
                  _buildCredentialBox(context, 'CUSTOM ROOM ID', roomId),
                  const SizedBox(height: 12),
                  // Room Password Box
                  _buildCredentialBox(context, 'ROOM PASSWORD', roomPassword),
                ],
              ),
            ),
            const SizedBox(height: 24),

            const Text('HOW TO JOIN IN FREE FIRE', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),
            GlassCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  Text('1. Open Free Fire / Free Fire MAX on your device.', style: TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
                  SizedBox(height: 6),
                  Text('2. Tap the Mode Selector and switch to "Custom" tab.', style: TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
                  SizedBox(height: 6),
                  Text('3. In the search box, paste the Room ID and tap Search.', style: TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
                  SizedBox(height: 6),
                  Text('4. Enter the Room Password, enter your designated slot number, and tap Join.', style: TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCredentialBox(BuildContext context, String title, String value) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: AppTheme.surfaceElevated,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppTheme.surfaceBorder),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: const TextStyle(color: AppTheme.textMuted, fontSize: 9, fontWeight: FontWeight.bold)),
              const SizedBox(height: 2),
              Text(value, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold, letterSpacing: 1.5)),
            ],
          ),
          IconButton(
            icon: const Icon(Icons.copy, color: AppTheme.neonCyan, size: 18),
            onPressed: () {
              Clipboard.setData(ClipboardData(text: value));
              ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Copied $title: $value')));
            },
          ),
        ],
      ),
    );
  }
}

// 15. SUBMIT RESULT SCREEN
class SubmitResultScreen extends StatefulWidget {
  final String tournamentTitle;

  const SubmitResultScreen({Key? key, required this.tournamentTitle}) : super(key: key);

  @override
  State<SubmitResultScreen> createState() => _SubmitResultScreenState();
}

class _SubmitResultScreenState extends State<SubmitResultScreen> {
  final _killsController = TextEditingController(text: '6');
  final _placementController = TextEditingController(text: '1');
  final _notesController = TextEditingController();
  bool _proofUploaded = true;
  bool _isSubmitting = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(title: const Text('SUBMIT MATCH RESULT')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(widget.tournamentTitle, style: const TextStyle(color: AppTheme.neonCyan, fontSize: 14, fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            const Text('Upload post-match stats screenshot showing kills & placement', style: TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
            const SizedBox(height: 20),

            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('KILLS ACHIEVED', style: TextStyle(color: AppTheme.textMuted, fontSize: 10, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 6),
                      TextField(
                        controller: _killsController,
                        keyboardType: TextInputType.number,
                        style: const TextStyle(color: Colors.white),
                        decoration: InputDecoration(
                          filled: true,
                          fillColor: AppTheme.surface,
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('FINAL PLACEMENT (RANK)', style: TextStyle(color: AppTheme.textMuted, fontSize: 10, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 6),
                      TextField(
                        controller: _placementController,
                        keyboardType: TextInputType.number,
                        style: const TextStyle(color: Colors.white),
                        decoration: InputDecoration(
                          filled: true,
                          fillColor: AppTheme.surface,
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            const Text('MATCH RESULT SCREENSHOT PROOF', style: TextStyle(color: AppTheme.textMuted, fontSize: 10, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            GestureDetector(
              onTap: () {
                setState(() => _proofUploaded = true);
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Screenshot attached successfully')));
              },
              child: Container(
                height: 140,
                width: double.infinity,
                decoration: BoxDecoration(
                  color: AppTheme.surface,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: _proofUploaded ? AppTheme.accentGreen : AppTheme.surfaceBorder, width: 1.5),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(_proofUploaded ? Icons.check_circle : Icons.cloud_upload_outlined, size: 40, color: _proofUploaded ? AppTheme.accentGreen : AppTheme.neonCyan),
                    const SizedBox(height: 8),
                    Text(_proofUploaded ? 'Screenshot Attached (ff_match_end.png)' : 'Tap to Upload Screenshot', style: TextStyle(color: _proofUploaded ? AppTheme.accentGreen : Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),

            const Text('PLAYER NOTES (OPTIONAL)', style: TextStyle(color: AppTheme.textMuted, fontSize: 10, fontWeight: FontWeight.bold)),
            const SizedBox(height: 6),
            TextField(
              controller: _notesController,
              maxLines: 2,
              style: const TextStyle(color: Colors.white, fontSize: 13),
              decoration: InputDecoration(
                filled: true,
                fillColor: AppTheme.surface,
                hintText: 'e.g. Booyah achieved in final zone',
                hintStyle: const TextStyle(color: AppTheme.textMuted),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
              ),
            ),
            const SizedBox(height: 30),

            PremiumButton(
              label: 'SUBMIT PROOF FOR VERIFICATION',
              isLoading: _isSubmitting,
              onPressed: () async {
                setState(() => _isSubmitting = true);
                await Future.delayed(const Duration(milliseconds: 700));
                setState(() => _isSubmitting = false);
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Match result submitted! Pending referee review.')),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
