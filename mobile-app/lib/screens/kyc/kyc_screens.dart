import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../services/api_service.dart';
import '../../widgets/custom_widgets.dart';

class KycIntroScreen extends StatelessWidget {
  const KycIntroScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final kyc = ApiService().currentKyc;

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(title: const Text('STATUTORY IDENTITY (KYC)')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: kyc.status == 'VERIFIED' ? AppTheme.accentGreen.withOpacity(0.15) : AppTheme.neonCyan.withOpacity(0.15),
                border: Border.all(
                  color: kyc.status == 'VERIFIED' ? AppTheme.accentGreen : AppTheme.neonCyan,
                  width: 2,
                ),
              ),
              child: Icon(
                kyc.status == 'VERIFIED' ? Icons.verified : Icons.security,
                size: 40,
                color: kyc.status == 'VERIFIED' ? AppTheme.accentGreen : AppTheme.neonCyan,
              ),
            ),
            const SizedBox(height: 16),
            Text(
              kyc.status == 'VERIFIED' ? 'IDENTITY VERIFIED ✅' : 'COMPLETE STATUTORY KYC',
              style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 6),
            Text(
              kyc.status == 'VERIFIED'
                  ? 'Your PAN document and age eligibility are approved. You can participate in all brackets and withdraw winnings instantly.'
                  : 'Mandatory verification required by Indian regulations for skill gaming platforms.',
              textAlign: TextAlign.center,
              style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12),
            ),
            const SizedBox(height: 24),

            if (kyc.status == 'VERIFIED') ...[
              GlassCard(
                glow: true,
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    _buildKycRow('Legal Name', kyc.legalName),
                    const Divider(color: AppTheme.surfaceBorder, height: 16),
                    _buildKycRow('Document Type', kyc.idType),
                    const Divider(color: AppTheme.surfaceBorder, height: 16),
                    _buildKycRow('Masked ID', kyc.idNumberMasked),
                    const Divider(color: AppTheme.surfaceBorder, height: 16),
                    _buildKycRow('Linked UPI VPA', kyc.payoutUpiId ?? 'Not Set'),
                  ],
                ),
              ),
            ] else ...[
              GlassCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: const [
                    Text('Why is KYC mandatory?', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
                    SizedBox(height: 8),
                    Text('1. Verifies you are at least 18 years of age.', style: TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
                    SizedBox(height: 4),
                    Text('2. Blocks prohibited jurisdictions under state esports laws.', style: TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
                    SizedBox(height: 4),
                    Text('3. Protects player funds against fraud and money laundering.', style: TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
                  ],
                ),
              ),
              const SizedBox(height: 32),

              PremiumButton(
                label: 'START KYC VERIFICATION',
                onPressed: () {
                  Navigator.push(context, MaterialPageRoute(builder: (_) => const KycFormScreen()));
                },
              ),
            ],
          ],
        ),
      ),
    );
  }

  static Widget _buildKycRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.between,
      children: [
        Text(label, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
        Text(value, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
      ],
    );
  }
}

// 27. KYC FORM SCREEN
class KycFormScreen extends StatefulWidget {
  const KycFormScreen({Key? key}) : super(key: key);

  @override
  State<KycFormScreen> createState() => _KycFormScreenState();
}

class _KycFormScreenState extends State<KycFormScreen> {
  final _legalNameController = TextEditingController(text: 'Viper Raj Sharma');
  final _dobController = TextEditingController(text: '2001-05-15');
  final _addressController = TextEditingController(text: 'Bandra West, Mumbai');
  final _stateController = TextEditingController(text: 'Maharashtra');
  final _idNumberController = TextEditingController(text: 'ABCDE1234F');
  final _upiController = TextEditingController(text: 'viper.esports@okhdfcbank');
  String _idType = 'PAN';
  bool _isLoading = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(title: const Text('SUBMIT KYC DETAILS')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('GOVERNMENT ID DETAILS', style: TextStyle(color: AppTheme.textMuted, fontSize: 11, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),

            // ID Type Selector
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              decoration: BoxDecoration(color: AppTheme.surface, borderRadius: BorderRadius.circular(10), border: Border.all(color: AppTheme.surfaceBorder)),
              child: DropdownButton<String>(
                value: _idType,
                isExpanded: true,
                dropdownColor: AppTheme.surface,
                underline: const SizedBox(),
                items: ['PAN', 'AADHAAR', 'PASSPORT', 'DRIVING_LICENSE'].map((type) {
                  return DropdownMenuItem(value: type, child: Text(type, style: const TextStyle(color: Colors.white, fontSize: 13)));
                }).toList(),
                onChanged: (v) => setState(() => _idType = v ?? 'PAN'),
              ),
            ),
            const SizedBox(height: 14),

            _buildField('LEGAL NAME AS ON ID', _legalNameController),
            _buildField('DATE OF BIRTH (YYYY-MM-DD)', _dobController),
            _buildField('DOCUMENT NUMBER', _idNumberController),
            _buildField('RESIDENTIAL ADDRESS', _addressController),
            _buildField('STATE', _stateController),
            _buildField('PAYOUT UPI ID (FOR WINNINGS)', _upiController),
            const SizedBox(height: 24),

            PremiumButton(
              label: 'SUBMIT & VERIFY',
              isLoading: _isLoading,
              onPressed: () async {
                setState(() => _isLoading = true);
                await Future.delayed(const Duration(milliseconds: 900));
                setState(() => _isLoading = false);

                ApiService().currentKyc = KycModel(
                  id: 'kyc-${DateTime.now().millisecondsSinceEpoch}',
                  status: 'VERIFIED',
                  legalName: _legalNameController.text,
                  idType: _idType,
                  idNumberMasked: _idNumberController.text.length > 4
                      ? '${_idNumberController.text.substring(0, 2)}****${_idNumberController.text.substring(_idNumberController.text.length - 2)}'
                      : '****',
                  payoutUpiId: _upiController.text,
                );

                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('KYC Submitted and Verified! Payouts unlocked.')),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildField(String label, TextEditingController controller) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(color: AppTheme.textMuted, fontSize: 10, fontWeight: FontWeight.bold)),
          const SizedBox(height: 6),
          TextField(
            controller: controller,
            style: const TextStyle(color: Colors.white, fontSize: 13),
            decoration: InputDecoration(
              filled: true,
              fillColor: AppTheme.surface,
              contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppTheme.surfaceBorder)),
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppTheme.surfaceBorder)),
              focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppTheme.neonCyan)),
            ),
          ),
        ],
      ),
    );
  }
}
