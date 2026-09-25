import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../core/theme/app_theme.dart';
import '../../services/api_service.dart';
import '../../widgets/custom_widgets.dart';

class ReferralScreen extends StatelessWidget {
  const ReferralScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final profile = ApiService().currentUserProfile;

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(title: const Text('INVITE & EARN')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppTheme.neonGold.withOpacity(0.15),
                border: Border.all(color: AppTheme.neonGold, width: 2),
              ),
              child: const Icon(Icons.card_giftcard, size: 40, color: AppTheme.neonGold),
            ),
            const SizedBox(height: 16),
            const Text('EARN ₹25 PER FRIEND', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 6),
            const Text(
              'Share your code with fellow Free Fire players. When they join their first tournament, both of you earn ₹25 bonus cash!',
              textAlign: TextAlign.center,
              style: TextStyle(color: AppTheme.textSecondary, fontSize: 12),
            ),
            const SizedBox(height: 24),

            // Referral Code Glass Card
            GlassCard(
              glow: true,
              child: Column(
                children: [
                  const Text('YOUR UNIQUE REFERRAL CODE', style: TextStyle(color: AppTheme.textMuted, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1.2)),
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    decoration: BoxDecoration(
                      color: AppTheme.surfaceElevated,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: AppTheme.neonCyan.withOpacity(0.5)),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(profile.referralCode, style: const TextStyle(color: AppTheme.neonCyan, fontSize: 20, fontWeight: FontWeight.bold, letterSpacing: 3.0)),
                        IconButton(
                          icon: const Icon(Icons.copy, color: AppTheme.neonCyan, size: 20),
                          onPressed: () {
                            Clipboard.setData(ClipboardData(text: profile.referralCode));
                            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Referral code copied to clipboard!')));
                          },
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Stats Card
            GlassCard(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  Column(
                    children: const [
                      Text('TOTAL INVITED', style: TextStyle(color: AppTheme.textMuted, fontSize: 10, fontWeight: FontWeight.bold)),
                      SizedBox(height: 4),
                      Text('8 Players', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                    ],
                  ),
                  Container(width: 1, height: 30, color: AppTheme.surfaceBorder),
                  Column(
                    children: const [
                      Text('TOTAL REWARDS', style: TextStyle(color: AppTheme.textMuted, fontSize: 10, fontWeight: FontWeight.bold)),
                      SizedBox(height: 4),
                      Text('₹200.00', style: TextStyle(color: AppTheme.neonGold, fontSize: 16, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),

            PremiumButton(
              label: 'SHARE INVITE LINK',
              icon: Icons.share,
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Sharing invite link via WhatsApp/Telegram...')),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
