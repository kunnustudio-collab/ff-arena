import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../services/api_service.dart';
import '../../widgets/custom_widgets.dart';
import '../auth/auth_screens.dart';
import '../kyc/kyc_screens.dart';
import '../referral/referral_screen.dart';
import '../support/support_screens.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({Key? key}) : super(key: key);

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  @override
  Widget build(BuildContext context) {
    final profile = ApiService().currentUserProfile;
    final kyc = ApiService().currentKyc;

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(title: const Text('PLAYER PROFILE')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // Esports Identity Card
            GlassCard(
              glow: true,
              padding: const EdgeInsets.all(20),
              child: Column(
                children: [
                  Row(
                    children: [
                      CircleAvatar(
                        radius: 32,
                        backgroundColor: AppTheme.surfaceElevated,
                        child: Text(profile.username[0], style: const TextStyle(color: AppTheme.neonCyan, fontSize: 26, fontWeight: FontWeight.bold)),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Text(profile.username, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                                const SizedBox(width: 6),
                                if (kyc.status == 'VERIFIED')
                                  const Icon(Icons.verified, color: AppTheme.neonCyan, size: 16),
                              ],
                            ),
                            const SizedBox(height: 4),
                            Text('FF IGN: ${profile.ffIgn}', style: const TextStyle(color: AppTheme.neonGold, fontSize: 12, fontWeight: FontWeight.w600)),
                            Text('UID: ${profile.ffUid}', style: const TextStyle(color: AppTheme.textSecondary, fontSize: 11, fontFamily: 'monospace')),
                          ],
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.edit_note, color: AppTheme.neonCyan),
                        onPressed: () {
                          Navigator.push(context, MaterialPageRoute(builder: (_) => const EditProfileScreen()))
                              .then((_) => setState(() {}));
                        },
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // Player Statistics Row
                  Container(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    decoration: BoxDecoration(color: AppTheme.surfaceElevated, borderRadius: BorderRadius.circular(12)),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        _buildStatCol('TOURNAMENTS', '${profile.totalTournaments}'),
                        Container(width: 1, height: 24, color: AppTheme.surfaceBorder),
                        _buildStatCol('TOTAL WINS', '${profile.totalWins}'),
                        Container(width: 1, height: 24, color: AppTheme.surfaceBorder),
                        _buildStatCol('EARNINGS', '₹${profile.totalEarnings.toStringAsFixed(0)}', color: AppTheme.neonGold),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Navigation Options
            GlassCard(
              padding: EdgeInsets.zero,
              child: Column(
                children: [
                  _buildNavTile(Icons.verified_user, 'KYC Verification', kyc.status, AppTheme.accentGreen, () {
                    Navigator.push(context, MaterialPageRoute(builder: (_) => const KycIntroScreen()));
                  }),
                  const Divider(color: AppTheme.surfaceBorder, height: 1),
                  _buildNavTile(Icons.card_giftcard, 'Referral Program', 'Earn ₹25', AppTheme.neonGold, () {
                    Navigator.push(context, MaterialPageRoute(builder: (_) => const ReferralScreen()));
                  }),
                  const Divider(color: AppTheme.surfaceBorder, height: 1),
                  _buildNavTile(Icons.headset_mic, 'Help & Support', 'Tickets / FAQ', AppTheme.neonCyan, () {
                    Navigator.push(context, MaterialPageRoute(builder: (_) => const SupportCenterScreen()));
                  }),
                  const Divider(color: AppTheme.surfaceBorder, height: 1),
                  _buildNavTile(Icons.policy, 'Legal Policies & Fair Play', 'Terms / Rules', AppTheme.textSecondary, () {
                    Navigator.push(context, MaterialPageRoute(builder: (_) => const LegalPoliciesScreen()));
                  }),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Logout Button
            OutlinedButton(
              onPressed: () {
                Navigator.pushAndRemoveUntil(context, MaterialPageRoute(builder: (_) => const LoginScreen()), (route) => false);
              },
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: AppTheme.accentRed),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                minimumSize: const Size.fromHeight(48),
              ),
              child: const Text('LOGOUT OF ARENA', style: TextStyle(color: AppTheme.accentRed, fontWeight: FontWeight.bold, fontSize: 13)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatCol(String label, String value, {Color color = Colors.white}) {
    return Column(
      children: [
        Text(label, style: const TextStyle(color: AppTheme.textMuted, fontSize: 9, fontWeight: FontWeight.bold)),
        const SizedBox(height: 2),
        Text(value, style: TextStyle(color: color, fontSize: 16, fontWeight: FontWeight.bold)),
      ],
    );
  }

  Widget _buildNavTile(IconData icon, String title, String subtitle, Color iconColor, VoidCallback onTap) {
    return ListTile(
      onTap: onTap,
      leading: Icon(icon, color: iconColor, size: 20),
      title: Text(title, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600)),
      trailing: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(subtitle, style: TextStyle(color: iconColor, fontSize: 11, fontWeight: FontWeight.bold)),
          const SizedBox(width: 4),
          const Icon(Icons.chevron_right, color: AppTheme.textMuted, size: 18),
        ],
      ),
    );
  }
}

// 39. EDIT PROFILE SCREEN
class EditProfileScreen extends StatefulWidget {
  const EditProfileScreen({Key? key}) : super(key: key);

  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  final _ignController = TextEditingController(text: ApiService().currentUserProfile.ffIgn);
  final _uidController = TextEditingController(text: ApiService().currentUserProfile.ffUid);
  final _stateController = TextEditingController(text: ApiService().currentUserProfile.state);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(title: const Text('EDIT ESPORTS IDENTITY')),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            TextField(
              controller: _ignController,
              style: const TextStyle(color: Colors.white),
              decoration: const InputDecoration(
                labelText: 'Free Fire In-Game Name (IGN)',
                labelStyle: TextStyle(color: AppTheme.textSecondary),
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _uidController,
              style: const TextStyle(color: Colors.white),
              decoration: const InputDecoration(
                labelText: 'Free Fire UID',
                labelStyle: TextStyle(color: AppTheme.textSecondary),
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _stateController,
              style: const TextStyle(color: Colors.white),
              decoration: const InputDecoration(
                labelText: 'State of Residence',
                labelStyle: TextStyle(color: AppTheme.textSecondary),
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 32),
            PremiumButton(
              label: 'SAVE CHANGES',
              onPressed: () {
                final cur = ApiService().currentUserProfile;
                ApiService().currentUserProfile = UserProfileModel(
                  userId: cur.userId,
                  fullName: cur.fullName,
                  username: cur.username,
                  avatarUrl: cur.avatarUrl,
                  ffUid: _uidController.text,
                  ffIgn: _ignController.text,
                  state: _stateController.text,
                  referralCode: cur.referralCode,
                  totalTournaments: cur.totalTournaments,
                  totalWins: cur.totalWins,
                  totalEarnings: cur.totalEarnings,
                );
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Profile updated successfully!')));
              },
            ),
          ],
        ),
      ),
    );
  }
}

// 42. LEGAL POLICIES SCREEN
class LegalPoliciesScreen extends StatelessWidget {
  const LegalPoliciesScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(title: const Text('LEGAL & COMPLIANCE')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: const [
          GlassCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Skill Gaming Declaration', style: TextStyle(color: AppTheme.neonCyan, fontSize: 14, fontWeight: FontWeight.bold)),
                SizedBox(height: 6),
                Text(
                  'Tournament X operates skill-based competitive brackets for Free Fire. The outcome depends predominantly on individual aiming, movement, reflexes, map awareness, and squad coordination.',
                  style: TextStyle(color: AppTheme.textSecondary, fontSize: 12, height: 1.5),
                ),
              ],
            ),
          ),
          SizedBox(height: 12),
          GlassCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('100% Cancellation Refund Guarantee', style: TextStyle(color: AppTheme.neonGold, fontSize: 14, fontWeight: FontWeight.bold)),
                SizedBox(height: 6),
                Text(
                  'In the event of a match room cancellation by organizers or technical failure, 100% of the tournament entry fee is credited back immediately to player deposit wallets.',
                  style: TextStyle(color: AppTheme.textSecondary, fontSize: 12, height: 1.5),
                ),
              ],
            ),
          ),
          SizedBox(height: 12),
          GlassCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Responsible Play & Age Eligibility', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
                SizedBox(height: 6),
                Text(
                  'Players must be at least 18 years old. Users from restricted states (Andhra Pradesh, Assam, Nagaland, Odisha, Sikkim, Telangana) are barred from participating in real-money fee brackets.',
                  style: TextStyle(color: AppTheme.textSecondary, fontSize: 12, height: 1.5),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
