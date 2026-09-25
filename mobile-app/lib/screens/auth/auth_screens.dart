import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../widgets/custom_widgets.dart';
import '../main_navigation_screen.dart';

// 1. SPLASH SCREEN
class SplashScreen extends StatefulWidget {
  const SplashScreen({Key? key}) : super(key: key);

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;
  late Animation<double> _opacityAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: const Duration(milliseconds: 1400));
    _scaleAnimation = Tween<double>(begin: 0.7, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeOutBack),
    );
    _opacityAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeIn),
    );

    _controller.forward();

    Future.delayed(const Duration(milliseconds: 2200), () {
      if (mounted) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => const OnboardingScreen()),
        );
      }
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      body: Center(
        child: FadeTransition(
          opacity: _opacityAnimation,
          child: ScaleTransition(
            scale: _scaleAnimation,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 90,
                  height: 90,
                  decoration: BoxDecoration(
                    gradient: AppTheme.primaryGradient,
                    borderRadius: BorderRadius.circular(24),
                    boxShadow: [
                      BoxShadow(
                        color: AppTheme.neonCyan.withOpacity(0.5),
                        blurRadius: 30,
                        spreadRadius: 2,
                      ),
                    ],
                  ),
                  child: const Center(
                    child: Text(
                      'X',
                      style: TextStyle(color: Colors.black, fontSize: 50, fontWeight: FontWeight.w900),
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                const Text(
                  'TOURNAMENT X',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 3.0,
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  'COMPETE • CLIMB • WIN',
                  style: TextStyle(
                    color: AppTheme.neonCyan,
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    letterSpacing: 2.0,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// 2. ONBOARDING SCREEN
class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({Key? key}) : super(key: key);

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  final List<Map<String, String>> _slides = [
    {
      'title': 'SKILL-BASED ESPORTS',
      'desc': 'Compete in organized tactical Battle Royale tournaments. Victory is decided solely by your skill, aim, and strategy.',
      'tag': '100% LEGAL & SKILL TESTED',
    },
    {
      'title': 'VERIFIED PLAYERS ONLY',
      'desc': 'Fair play backed by statutory KYC verification, anti-emulator detection, and active referee review.',
      'tag': 'ANTI-CHEAT PROTECTED',
    },
    {
      'title': 'INSTANT WALLET PAYOUTS',
      'desc': 'Track prize winnings on an immutable ledger. Withdraw your earnings straight to your UPI ID or Bank account.',
      'tag': 'FAST UPI & IMPS TRANSFERS',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
          child: Column(
            children: [
              Align(
                alignment: Alignment.topRight,
                child: TextButton(
                  onPressed: () {
                    Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const LoginScreen()));
                  },
                  child: const Text('SKIP', style: TextStyle(color: AppTheme.textSecondary, fontWeight: FontWeight.bold)),
                ),
              ),
              Expanded(
                child: PageView.builder(
                  controller: _pageController,
                  onPageChanged: (i) => setState(() => _currentPage = i),
                  itemCount: _slides.length,
                  itemBuilder: (_, i) {
                    final slide = _slides[i];
                    return Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                          decoration: BoxDecoration(
                            color: AppTheme.neonCyan.withOpacity(0.12),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: AppTheme.neonCyan.withOpacity(0.3)),
                          ),
                          child: Text(
                            slide['tag']!,
                            style: const TextStyle(color: AppTheme.neonCyan, fontSize: 11, fontWeight: FontWeight.bold),
                          ),
                        ),
                        const SizedBox(height: 32),
                        Container(
                          width: 140,
                          height: 140,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: AppTheme.surfaceElevated,
                            border: Border.all(color: AppTheme.surfaceBorder, width: 2),
                            boxShadow: [
                              BoxShadow(color: AppTheme.neonCyan.withOpacity(0.1), blurRadius: 20),
                            ],
                          ),
                          child: Icon(
                            i == 0 ? Icons.military_tech : i == 1 ? Icons.verified_user : Icons.account_balance_wallet,
                            size: 64,
                            color: AppTheme.neonCyan,
                          ),
                        ),
                        const SizedBox(height: 36),
                        Text(
                          slide['title']!,
                          textAlign: TextAlign.center,
                          style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold, letterSpacing: 1.0),
                        ),
                        const SizedBox(height: 14),
                        Text(
                          slide['desc']!,
                          textAlign: TextAlign.center,
                          style: const TextStyle(color: AppTheme.textSecondary, fontSize: 14, height: 1.5),
                        ),
                      ],
                    );
                  },
                ),
              ),
              // Dots indicator
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(
                  _slides.length,
                  (index) => Container(
                    margin: const EdgeInsets.symmetric(horizontal: 4),
                    width: _currentPage == index ? 24 : 8,
                    height: 8,
                    decoration: BoxDecoration(
                      color: _currentPage == index ? AppTheme.neonCyan : AppTheme.surfaceBorder,
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 32),
              PremiumButton(
                label: _currentPage == _slides.length - 1 ? 'GET STARTED' : 'CONTINUE',
                onPressed: () {
                  if (_currentPage < _slides.length - 1) {
                    _pageController.nextPage(duration: const Duration(milliseconds: 300), curve: Curves.ease);
                  } else {
                    Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const LoginScreen()));
                  }
                },
              ),
              const SizedBox(height: 12),
            ],
          ),
        ),
      ),
    );
  }
}

// 3. LOGIN SCREEN
class LoginScreen extends StatefulWidget {
  const LoginScreen({Key? key}) : super(key: key);

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _phoneOrEmailController = TextEditingController(text: '9876543210');
  final _passwordController = TextEditingController(text: 'Password@123');
  bool _isOtpMode = false;
  bool _isLoading = false;

  void _handleLogin() async {
    setState(() => _isLoading = true);
    await Future.delayed(const Duration(milliseconds: 700));
    setState(() => _isLoading = false);

    if (_isOtpMode) {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => OtpVerificationScreen(phone: _phoneOrEmailController.text),
        ),
      );
    } else {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const MainNavigationScreen()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 20),
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  gradient: AppTheme.primaryGradient,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Center(
                  child: Text('X', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 24)),
                ),
              ),
              const SizedBox(height: 24),
              const Text('WELCOME BACK', style: TextStyle(color: Colors.white, fontSize: 26, fontWeight: FontWeight.bold)),
              const SizedBox(height: 6),
              const Text('Enter credentials to enter the tournament arena', style: TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
              const SizedBox(height: 32),

              // Mode toggle (Password / OTP)
              Container(
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: AppTheme.surface,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppTheme.surfaceBorder),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: GestureDetector(
                        onTap: () => setState(() => _isOtpMode = false),
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 8),
                          decoration: BoxDecoration(
                            color: !_isOtpMode ? AppTheme.surfaceElevated : Colors.transparent,
                            borderRadius: BorderRadius.circular(8),
                            border: !_isOtpMode ? Border.all(color: AppTheme.neonCyan.withOpacity(0.4)) : null,
                          ),
                          child: Center(
                            child: Text(
                              'Password',
                              style: TextStyle(
                                color: !_isOtpMode ? AppTheme.neonCyan : AppTheme.textSecondary,
                                fontWeight: FontWeight.bold,
                                fontSize: 13,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                    Expanded(
                      child: GestureDetector(
                        onTap: () => setState(() => _isOtpMode = true),
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 8),
                          decoration: BoxDecoration(
                            color: _isOtpMode ? AppTheme.surfaceElevated : Colors.transparent,
                            borderRadius: BorderRadius.circular(8),
                            border: _isOtpMode ? Border.all(color: AppTheme.neonCyan.withOpacity(0.4)) : null,
                          ),
                          child: Center(
                            child: Text(
                              'Mobile OTP',
                              style: TextStyle(
                                color: _isOtpMode ? AppTheme.neonCyan : AppTheme.textSecondary,
                                fontWeight: FontWeight.bold,
                                fontSize: 13,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Input: Phone or Email
              Text(_isOtpMode ? 'MOBILE NUMBER' : 'PHONE OR EMAIL', style: const TextStyle(color: AppTheme.textMuted, fontSize: 11, fontWeight: FontWeight.bold)),
              const SizedBox(height: 6),
              TextField(
                controller: _phoneOrEmailController,
                style: const TextStyle(color: Colors.white, fontSize: 14),
                decoration: InputDecoration(
                  filled: true,
                  fillColor: AppTheme.surface,
                  prefixIcon: const Icon(Icons.phone_iphone, color: AppTheme.neonCyan, size: 20),
                  hintText: _isOtpMode ? 'Enter 10-digit mobile' : 'Enter email or phone',
                  hintStyle: const TextStyle(color: AppTheme.textMuted),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppTheme.surfaceBorder)),
                  enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppTheme.surfaceBorder)),
                  focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppTheme.neonCyan)),
                ),
              ),
              const SizedBox(height: 16),

              if (!_isOtpMode) ...[
                const Text('PASSWORD', style: TextStyle(color: AppTheme.textMuted, fontSize: 11, fontWeight: FontWeight.bold)),
                const SizedBox(height: 6),
                TextField(
                  controller: _passwordController,
                  obscureText: true,
                  style: const TextStyle(color: Colors.white, fontSize: 14),
                  decoration: InputDecoration(
                    filled: true,
                    fillColor: AppTheme.surface,
                    prefixIcon: const Icon(Icons.lock_outline, color: AppTheme.neonCyan, size: 20),
                    hintText: 'Enter your password',
                    hintStyle: const TextStyle(color: AppTheme.textMuted),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppTheme.surfaceBorder)),
                    enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppTheme.surfaceBorder)),
                    focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppTheme.neonCyan)),
                  ),
                ),
                Align(
                  alignment: Alignment.centerRight,
                  child: TextButton(
                    onPressed: () {
                      Navigator.push(context, MaterialPageRoute(builder: (_) => const ForgotPasswordScreen()));
                    },
                    child: const Text('Forgot Password?', style: TextStyle(color: AppTheme.neonCyan, fontSize: 12)),
                  ),
                ),
              ],

              const SizedBox(height: 24),
              PremiumButton(
                label: _isOtpMode ? 'SEND OTP' : 'LOGIN TO ARENA',
                isLoading: _isLoading,
                onPressed: _handleLogin,
              ),

              const SizedBox(height: 30),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text("Don't have an account? ", style: TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
                  GestureDetector(
                    onTap: () {
                      Navigator.push(context, MaterialPageRoute(builder: (_) => const RegisterScreen()));
                    },
                    child: const Text('Register Now', style: TextStyle(color: AppTheme.neonCyan, fontWeight: FontWeight.bold, fontSize: 13)),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// 4. REGISTER SCREEN
class RegisterScreen extends StatefulWidget {
  const RegisterScreen({Key? key}) : super(key: key);

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _nameController = TextEditingController();
  final _usernameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _emailController = TextEditingController();
  final _stateController = TextEditingController(text: 'Maharashtra');
  final _referralController = TextEditingController();
  bool _agreedToTerms = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(title: const Text('CREATE ACCOUNT')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('PLAYER REGISTRATION', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            const Text('Skill tournaments strictly require 18+ age verification', style: TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
            const SizedBox(height: 20),

            _buildField('FULL LEGAL NAME (AS PER GOVT ID)', _nameController, 'e.g. Rahul Sharma', Icons.person),
            _buildField('USERNAME (PUBLIC DISPLAY)', _usernameController, 'e.g. TX_Phantom', Icons.sports_esports),
            _buildField('MOBILE NUMBER', _phoneController, '10-digit mobile number', Icons.phone),
            _buildField('EMAIL ADDRESS', _emailController, 'name@example.com', Icons.email),
            _buildField('STATE OF RESIDENCE', _stateController, 'e.g. Maharashtra', Icons.location_on),
            _buildField('REFERRAL CODE (OPTIONAL)', _referralController, 'Get ₹25 Bonus Cash', Icons.card_giftcard),

            Row(
              children: [
                Checkbox(
                  value: _agreedToTerms,
                  activeColor: AppTheme.neonCyan,
                  onChanged: (v) => setState(() => _agreedToTerms = v ?? false),
                ),
                const Expanded(
                  child: Text(
                    'I confirm I am 18+ years of age and not residing in Andhra Pradesh, Assam, Nagaland, Odisha, Sikkim, or Telangana.',
                    style: TextStyle(color: AppTheme.textSecondary, fontSize: 10),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),

            PremiumButton(
              label: 'PROCEED & VERIFY MOBILE',
              onPressed: _agreedToTerms
                  ? () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => OtpVerificationScreen(phone: _phoneController.text.isEmpty ? '9876543210' : _phoneController.text)),
                      );
                    }
                  : null,
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  Widget _buildField(String label, TextEditingController controller, String hint, IconData icon) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(color: AppTheme.textMuted, fontSize: 10, fontWeight: FontWeight.bold)),
          const SizedBox(height: 6),
          TextField(
            controller: controller,
            style: const TextStyle(color: Colors.white, fontSize: 14),
            decoration: InputDecoration(
              filled: true,
              fillColor: AppTheme.surface,
              prefixIcon: Icon(icon, color: AppTheme.neonCyan, size: 18),
              hintText: hint,
              hintStyle: const TextStyle(color: AppTheme.textMuted, fontSize: 13),
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

// 5. OTP VERIFICATION SCREEN
class OtpVerificationScreen extends StatefulWidget {
  final String phone;
  const OtpVerificationScreen({Key? key, required this.phone}) : super(key: key);

  @override
  State<OtpVerificationScreen> createState() => _OtpVerificationScreenState();
}

class _OtpVerificationScreenState extends State<OtpVerificationScreen> {
  final _otpController = TextEditingController(text: '123456');
  bool _isLoading = false;

  void _verifyOtp() async {
    setState(() => _isLoading = true);
    await Future.delayed(const Duration(milliseconds: 700));
    setState(() => _isLoading = false);

    Navigator.pushAndRemoveUntil(
      context,
      MaterialPageRoute(builder: (_) => const MainNavigationScreen()),
      (route) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(title: const Text('VERIFICATION')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            const SizedBox(height: 20),
            const Icon(Icons.mark_email_read, size: 64, color: AppTheme.neonCyan),
            const SizedBox(height: 24),
            const Text('ENTER 6-DIGIT OTP', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Text('Verification code sent to ${widget.phone}', style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(color: AppTheme.surfaceElevated, borderRadius: BorderRadius.circular(6)),
              child: const Text('Sandbox Demo OTP: 123456', style: TextStyle(color: AppTheme.neonGold, fontSize: 11, fontWeight: FontWeight.bold)),
            ),
            const SizedBox(height: 32),
            TextField(
              controller: _otpController,
              keyboardType: TextInputType.number,
              textAlign: TextAlign.center,
              maxLength: 6,
              style: const TextStyle(color: AppTheme.neonCyan, fontSize: 24, fontWeight: FontWeight.bold, letterSpacing: 8),
              decoration: InputDecoration(
                filled: true,
                fillColor: AppTheme.surface,
                counterText: '',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppTheme.surfaceBorder)),
                focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppTheme.neonCyan, width: 2)),
              ),
            ),
            const SizedBox(height: 32),
            PremiumButton(
              label: 'VERIFY & ENTER',
              isLoading: _isLoading,
              onPressed: _verifyOtp,
            ),
            const SizedBox(height: 20),
            TextButton(
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('New OTP sent: 123456')));
              },
              child: const Text('Resend Code in 45s', style: TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
            ),
          ],
        ),
      ),
    );
  }
}

// 6. FORGOT PASSWORD SCREEN
class ForgotPasswordScreen extends StatelessWidget {
  const ForgotPasswordScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final controller = TextEditingController();
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(title: const Text('RECOVER PASSWORD')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('RESET YOUR CREDENTIALS', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            const Text('Enter your registered mobile or email to receive password reset link', style: TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
            const SizedBox(height: 24),
            TextField(
              controller: controller,
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                filled: true,
                fillColor: AppTheme.surface,
                hintText: 'Enter phone or email',
                hintStyle: const TextStyle(color: AppTheme.textMuted),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppTheme.surfaceBorder)),
              ),
            ),
            const SizedBox(height: 24),
            PremiumButton(
              label: 'SEND RESET CODE',
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Reset OTP sent to your contact')));
                Navigator.pop(context);
              },
            ),
          ],
        ),
      ),
    );
  }
}
