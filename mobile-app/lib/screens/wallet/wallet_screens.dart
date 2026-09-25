import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../services/api_service.dart';
import '../../widgets/custom_widgets.dart';

class WalletScreen extends StatefulWidget {
  const WalletScreen({Key? key}) : super(key: key);

  @override
  State<WalletScreen> createState() => _WalletScreenState();
}

class _WalletScreenState extends State<WalletScreen> {
  @override
  Widget build(BuildContext context) {
    final wallet = ApiService().currentWallet;

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(title: const Text('ESPORTS WALLET')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // Master Total Balance Glass Card
            GlassCard(
              glow: true,
              padding: const EdgeInsets.all(20),
              child: Column(
                children: [
                  const Text('TOTAL WALLET BALANCE', style: TextStyle(color: AppTheme.textMuted, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.2)),
                  const SizedBox(height: 8),
                  Text('₹${wallet.totalBalance.toStringAsFixed(2)}', style: const TextStyle(color: Colors.white, fontSize: 34, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 20),

                  // Action Buttons: Add Money & Withdraw
                  Row(
                    children: [
                      Expanded(
                        child: PremiumButton(
                          label: 'ADD MONEY',
                          icon: Icons.add_circle_outline,
                          height: 44,
                          onPressed: () {
                            Navigator.push(context, MaterialPageRoute(builder: (_) => const AddMoneyScreen()))
                                .then((_) => setState(() {}));
                          },
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: PremiumButton(
                          label: 'WITHDRAW',
                          isSecondary: true,
                          icon: Icons.arrow_downward,
                          height: 44,
                          onPressed: () {
                            Navigator.push(context, MaterialPageRoute(builder: (_) => const WithdrawScreen()))
                                .then((_) => setState(() {}));
                          },
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Balances Breakdown
            GlassCard(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  _buildBalanceTile('Deposit Balance', '₹${wallet.depositBalance.toStringAsFixed(2)}', 'Used for tournament entry fees', Colors.white),
                  const Divider(color: AppTheme.surfaceBorder, height: 20),
                  _buildBalanceTile('Winnings Balance', '₹${wallet.winningsBalance.toStringAsFixed(2)}', 'Eligible for instant withdrawal', AppTheme.neonGold),
                  const Divider(color: AppTheme.surfaceBorder, height: 20),
                  _buildBalanceTile('Bonus Balance', '₹${wallet.bonusBalance.toStringAsFixed(2)}', 'Usable up to 10% on match entries', AppTheme.neonCyan),
                  if (wallet.lockedBalance > 0) ...[
                    const Divider(color: AppTheme.surfaceBorder, height: 20),
                    _buildBalanceTile('Locked Balance', '₹${wallet.lockedBalance.toStringAsFixed(2)}', 'Under processing for payout', AppTheme.accentOrange),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Transactions Header
            Row(
              mainAxisAlignment: MainAxisAlignment.between,
              children: [
                const Text('RECENT TRANSACTIONS', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
                TextButton(
                  onPressed: () {
                    Navigator.push(context, MaterialPageRoute(builder: (_) => const TransactionsScreen()));
                  },
                  child: const Text('View All', style: TextStyle(color: AppTheme.neonCyan, fontSize: 12)),
                ),
              ],
            ),
            const SizedBox(height: 8),

            // Recent Ledger list
            ...ApiService().demoLedger.take(3).map((item) {
              final isCredit = item.entryType == 'CREDIT';
              return Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: GlassCard(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.between,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: isCredit ? AppTheme.accentGreen.withOpacity(0.15) : AppTheme.accentRed.withOpacity(0.15),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Icon(
                              isCredit ? Icons.arrow_downward : Icons.arrow_upward,
                              color: isCredit ? AppTheme.accentGreen : AppTheme.accentRed,
                              size: 16,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(item.description, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                              const SizedBox(height: 2),
                              Text(item.transactionId, style: const TextStyle(color: AppTheme.textMuted, fontSize: 10, fontFamily: 'monospace')),
                            ],
                          ),
                        ],
                      ),
                      Text(
                        '${isCredit ? '+' : '-'}₹${item.amount.toStringAsFixed(2)}',
                        style: TextStyle(
                          color: isCredit ? AppTheme.accentGreen : AppTheme.accentRed,
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }),
          ],
        ),
      ),
    );
  }

  Widget _buildBalanceTile(String title, String amount, String subtitle, Color amountColor) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.between,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600)),
            const SizedBox(height: 2),
            Text(subtitle, style: const TextStyle(color: AppTheme.textMuted, fontSize: 10)),
          ],
        ),
        Text(amount, style: TextStyle(color: amountColor, fontSize: 16, fontWeight: FontWeight.bold)),
      ],
    );
  }
}

// 19. ADD MONEY SCREEN
class AddMoneyScreen extends StatefulWidget {
  const AddMoneyScreen({Key? key}) : super(key: key);

  @override
  State<AddMoneyScreen> createState() => _AddMoneyScreenState();
}

class _AddMoneyScreenState extends State<AddMoneyScreen> {
  final _amountController = TextEditingController(text: '100');
  final List<double> _presetChips = [50, 100, 250, 500, 1000];
  bool _isLoading = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(title: const Text('ADD MONEY')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('ENTER DEPOSIT AMOUNT', style: TextStyle(color: AppTheme.textMuted, fontSize: 11, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            TextField(
              controller: _amountController,
              keyboardType: TextInputType.number,
              style: const TextStyle(color: Colors.white, fontSize: 26, fontWeight: FontWeight.bold),
              decoration: InputDecoration(
                prefixText: '₹ ',
                prefixStyle: const TextStyle(color: AppTheme.neonCyan, fontSize: 26, fontWeight: FontWeight.bold),
                filled: true,
                fillColor: AppTheme.surface,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
            const SizedBox(height: 16),

            // Chips selector
            Wrap(
              spacing: 8,
              children: _presetChips.map((chip) {
                return ActionChip(
                  label: Text('+₹${chip.toStringAsFixed(0)}'),
                  labelStyle: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
                  backgroundColor: AppTheme.surfaceElevated,
                  side: const BorderSide(color: AppTheme.surfaceBorder),
                  onPressed: () {
                    setState(() => _amountController.text = chip.toStringAsFixed(0));
                  },
                );
              }).toList(),
            ),
            const SizedBox(height: 24),

            const Text('SUPPORTED PAYMENT METHODS', style: TextStyle(color: AppTheme.textMuted, fontSize: 11, fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),
            GlassCard(
              child: Column(
                children: const [
                  ListTile(
                    leading: Icon(Icons.flash_on, color: AppTheme.neonCyan),
                    title: Text('UPI Fast Pay (GPay / PhonePe / Paytm)', style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                    subtitle: Text('Instant zero-fee deposit', style: TextStyle(color: AppTheme.textMuted, fontSize: 11)),
                    trailing: Icon(Icons.check_circle, color: AppTheme.neonCyan, size: 18),
                    contentPadding: EdgeInsets.zero,
                  ),
                  Divider(color: AppTheme.surfaceBorder),
                  ListTile(
                    leading: Icon(Icons.credit_card, color: Colors.white),
                    title: Text('Credit / Debit Cards & Net Banking', style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                    subtitle: Text('Secure 256-bit payment gateway', style: TextStyle(color: AppTheme.textMuted, fontSize: 11)),
                    contentPadding: EdgeInsets.zero,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 36),

            PremiumButton(
              label: 'PROCEED TO PAY',
              isLoading: _isLoading,
              onPressed: () async {
                final amt = double.tryParse(_amountController.text) ?? 50;
                setState(() => _isLoading = true);
                await ApiService().depositMoney(amt);
                setState(() => _isLoading = false);
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('₹$amt successfully added to your wallet!')),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}

// 24. WITHDRAW SCREEN
class WithdrawScreen extends StatefulWidget {
  const WithdrawScreen({Key? key}) : super(key: key);

  @override
  State<WithdrawScreen> createState() => _WithdrawScreenState();
}

class _WithdrawScreenState extends State<WithdrawScreen> {
  final _amountController = TextEditingController(text: '500');
  final _upiController = TextEditingController(text: 'viper.esports@okhdfcbank');
  String _payoutMethod = 'UPI';
  bool _isLoading = false;

  @override
  Widget build(BuildContext context) {
    final winnings = ApiService().currentWallet.winningsBalance;
    final amt = double.tryParse(_amountController.text) ?? 0;
    final fee = amt * 0.02;
    final net = amt > fee ? amt - fee : 0;

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(title: const Text('WITHDRAW WINNINGS')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            GlassCard(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.between,
                children: [
                  const Text('Eligible Winnings Balance', style: TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
                  Text('₹${winnings.toStringAsFixed(2)}', style: const TextStyle(color: AppTheme.neonGold, fontSize: 18, fontWeight: FontWeight.bold)),
                ],
              ),
            ),
            const SizedBox(height: 20),

            const Text('WITHDRAWAL AMOUNT', style: TextStyle(color: AppTheme.textMuted, fontSize: 11, fontWeight: FontWeight.bold)),
            const SizedBox(height: 6),
            TextField(
              controller: _amountController,
              keyboardType: TextInputType.number,
              onChanged: (_) => setState(() {}),
              style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
              decoration: InputDecoration(
                prefixText: '₹ ',
                prefixStyle: const TextStyle(color: AppTheme.neonCyan, fontSize: 20),
                filled: true,
                fillColor: AppTheme.surface,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
              ),
            ),
            const SizedBox(height: 16),

            const Text('PAYOUT DESTINATION (UPI VPA)', style: TextStyle(color: AppTheme.textMuted, fontSize: 11, fontWeight: FontWeight.bold)),
            const SizedBox(height: 6),
            TextField(
              controller: _upiController,
              style: const TextStyle(color: Colors.white, fontSize: 14),
              decoration: InputDecoration(
                filled: true,
                fillColor: AppTheme.surface,
                prefixIcon: const Icon(Icons.flash_on, color: AppTheme.neonCyan, size: 20),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
              ),
            ),
            const SizedBox(height: 20),

            // Fee Breakdown Card
            GlassCard(
              padding: const EdgeInsets.all(12),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.between,
                    children: [
                      const Text('Processing Fee (2%)', style: TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
                      Text('₹${fee.toStringAsFixed(2)}', style: const TextStyle(color: Colors.white, fontSize: 12)),
                    ],
                  ),
                  const Divider(color: AppTheme.surfaceBorder, height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.between,
                    children: [
                      const Text('Net Payout to Account', style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                      Text('₹${net.toStringAsFixed(2)}', style: const TextStyle(color: AppTheme.accentGreen, fontSize: 15, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),

            PremiumButton(
              label: 'REQUEST INSTANT WITHDRAWAL',
              isLoading: _isLoading,
              onPressed: winnings >= amt && amt >= 100
                  ? () async {
                      setState(() => _isLoading = true);
                      await ApiService().withdrawMoney(amt, _payoutMethod, _upiController.text);
                      setState(() => _isLoading = false);
                      Navigator.pop(context);
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('Withdrawal request for ₹$net submitted successfully!')),
                      );
                    }
                  : null,
            ),
          ],
        ),
      ),
    );
  }
}

// 23. TRANSACTIONS SCREEN
class TransactionsScreen extends StatelessWidget {
  const TransactionsScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final ledger = ApiService().demoLedger;

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(title: const Text('TRANSACTION LEDGER')),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: ledger.length,
        itemBuilder: (ctx, i) {
          final item = ledger[i];
          final isCredit = item.entryType == 'CREDIT';
          return Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: GlassCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.between,
                    children: [
                      Text(item.category, style: const TextStyle(color: AppTheme.neonCyan, fontSize: 11, fontWeight: FontWeight.bold)),
                      Text(
                        '${isCredit ? '+' : '-'}₹${item.amount.toStringAsFixed(2)}',
                        style: TextStyle(
                          color: isCredit ? AppTheme.accentGreen : AppTheme.accentRed,
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(item.description, style: const TextStyle(color: Colors.white, fontSize: 13)),
                  const SizedBox(height: 6),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.between,
                    children: [
                      Text(item.transactionId, style: const TextStyle(color: AppTheme.textMuted, fontSize: 10, fontFamily: 'monospace')),
                      Text('Balance after: ₹${item.balanceAfter.toStringAsFixed(2)}', style: const TextStyle(color: AppTheme.textSecondary, fontSize: 10)),
                    ],
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
