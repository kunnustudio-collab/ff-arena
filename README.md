# 🏆 TOURNAMENT X • Complete User & Admin Guide (सब कुछ कैसे यूज़ करें)

> **"Compete. Climb. Win."**  
> Free Fire Skill-Based Esports Tournament Platform with Double-Entry Wallet, KYC, Room Management, and Web Admin Panel.

---

## 📌 Quick Access & Important Credentials (जरूरी जानकारी)

| Service | Local URL | Default Login | Password / OTP |
| :--- | :--- | :--- | :--- |
| **Android Release APK** | `release-apk/app-release.apk` | - | [Download from GitHub Actions](https://github.com/kunnustudio-collab/ff-arena/actions/runs/36261919380) |
| **Backend API** | `http://localhost:5000` | - | Health: `http://localhost:5000/health` |
| **Admin Web Panel** | `http://localhost:3000` (or `http://localhost:5173`) | `admin@tournamentx.com` | Password: `Admin@123456`<br>2FA OTP: `123456` |
| **Demo Player 1** | Mobile App | `9876543210` / `player1@tournamentx.com` | Password: `Password@123`<br>OTP: `123456` |
| **Demo Player 2** | Mobile App | `9876543211` / `player2@tournamentx.com` | Password: `Password@123`<br>OTP: `123456` |

---

### 📲 Ready-to-Install Android App (.APK)
Aapka Android APK successfully ban chuka hai! Aap ise 2 jagah se le sakte hain:
1. **Direct Local Folder me:**  
   `C:\Users\Awara\Desktop\ff arena\release-apk\app-release.apk`  
   *(Ise direct apne Android phone me copy karke install kar sakte hain!)*
2. **GitHub Actions se Download:**  
   👉 [Download TournamentX-Android-APK (Run #36261919380)](https://github.com/kunnustudio-collab/ff-arena/actions/runs/36261919380)  
   *(Page ke bottom me **Artifacts** section me `TournamentX-Android-APK` par click karein)*

---

## 🚀 1. How to Run Everything (सब कुछ कैसे चालू करें)

### Step 1: Backend API Server चालू करना
Backend Node.js API server database, wallet ledger aur tournaments ko handle karta hai.

```powershell
# 1. Backend folder me jayein
cd "C:\Users\Awara\Desktop\ff arena\backend"

# 2. Server start karein
node dist/server.js
```
✅ Server live ho jayega: **`http://localhost:5000`** par.

---

### Step 2: Admin Panel (Web Dashboard) चालू करना
Ye website tournament organize karne, prize baantne, KYC approve karne aur withdrawals approve karne ke liye hai.

```powershell
# 1. Admin panel folder me jayein
cd "C:\Users\Awara\Desktop\ff arena\admin-panel"

# 2. Development server run karein
npm.cmd run dev
```
✅ Browser me open karein: **`http://localhost:3000`** ya terminal me dikhaye gaye link par (jaise `http://localhost:5173`).  
- **Email:** `admin@tournamentx.com`
- **Password:** `Admin@123456`
- **2FA OTP:** `123456`

---

### Step 3: Android App Run / Build करना (Flutter)

```powershell
# 1. Mobile app folder me jayein
cd "C:\Users\Awara\Desktop\ff arena\mobile-app"

# 2. Dependencies install karein
flutter pub get

# 3. Android phone ya emulator me run karein
flutter run

# 4. Release APK banane ke liye:
flutter build apk --release --split-per-abi
```
✅ APK file yahan ban jayegi:  
`mobile-app/build/app/outputs/flutter-apk/app-release.apk`

---

### Step 4: Docker se ek sath sab chalana (Optional)
Agar aapke system me Docker installed hai, to ek hi command me pura system chal jayega:
```powershell
cd "C:\Users\Awara\Desktop\ff arena"
docker-compose up -d
```

---

## 📱 2. How to Use Mobile App (Player Guide - यूज़र कैसे इस्तेमाल करेगा)

### 1. Registration & Login (अकाउंट बनाना)
1. App open karein. Onboarding screens dekh kar **GET STARTED** par tap karein.
2. Apna Mobile Number daalein aur **SEND OTP** dabayein.
3. Demo mode me OTP `123456` auto-fill hota hai. **VERIFY & ENTER** dabayein.
4. Apna Free Fire In-Game Name (IGN) aur UID daal kar account activate karein.

---

### 2. Complete KYC (KYC कैसे करें)
Withdrawal lene ke liye KYC jaruri hai:
1. Bottom navigation me **Profile** par jayein.
2. **KYC Verification** option par tap karein.
3. Apna Legal Name, Date of Birth (18+ jaruri hai), State, aur PAN/Aadhaar number daalein.
4. Payout lene ke liye apna **UPI ID** (jaise `user@okhdfcbank` ya `9876543210@paytm`) enter karein.
5. **Submit** karein — Demo Mode me KYC instantly **VERIFIED** ho jati hai!

---

### 3. Add Money to Wallet (वॉलेट में पैसे कैसे डालें)
Tournament join karne ke liye Deposit Balance hona chahiye:
1. Bottom bar me **Wallet** icon par tap karein.
2. **ADD MONEY** button dabayein.
3. Preset chip select karein (₹50, ₹100, ₹250, ₹500, ₹1000) ya custom amount daalein.
4. **PROCEED TO PAY** dabayein.
5. Amount turant aapke **Deposit Balance** me add ho jayegi aur Ledger entry create ho jayegi.

---

### 4. Join a Free Fire Tournament (टूर्नामेंट में कैसे शामिल हों)
1. **Tournaments** tab me jayein.
2. Filter karein: **SOLO**, **DUO**, **SQUAD**, ya Map select karein (**Bermuda**, **Purgatory**, etc.).
3. Apni pasand ke tournament par tap karein. Details dekhein (Entry fee, Prize pool, Rules, Scoring points).
4. **JOIN TOURNAMENT** button dabayein.
5. Apna Free Fire IGN aur UID confirm karein aur pay karein.
6. Aapko ek **Slot Number** aur **Registration ID** mil jayegi.

---

### 5. Custom Room ID & Password कैसे मिलेगा
Match start hone se **15 minute pehle** credentials unlock hote hain:
1. Bottom bar me **My Matches** tab me jayein.
2. **Upcoming** tab me apna tournament select karein.
3. **VIEW ROOM CREDENTIALS** par tap karein.
4. Wahan **Room ID** aur **Password** dikhai dega.
5. **Copy** icon dabayein, Free Fire open karein $\to$ Custom Mode me jayein $\to$ Room ID search karke Password daalein aur apne allotted Slot me baith jayein.

---

### 6. Submit Match Proof (मैच खत्म होने के बाद रिजल्ट भेजना)
Match khelne ke baad:
1. Free Fire ke match summary screen ka **Screenshot** lein.
2. Tournament X app me **My Matches** $\to$ **Live** tab me jayein.
3. **SUBMIT MATCH PROOF** par tap karein.
4. Apne Kills aur Placement (Rank) enter karein.
5. Screenshot upload karein aur **Submit** kar dein.
6. Admin team isko check karke prize release karegi.

---

### 7. Withdraw Winnings (जीते हुए पैसे कैसे निकालें)
1. **Wallet** tab me jayein. Wahan **Winnings Balance** check karein.
2. **WITHDRAW** button par tap karein.
3. Amount enter karein (Minimum ₹100).
4. Apna **UPI ID** confirm karein. 2% standard processing fee show hogi aur Net amount calculate hoga.
5. **REQUEST INSTANT WITHDRAWAL** dabayein.
6. Payout aapke UPI account me transfer ho jayega!

---

### 8. Refer & Earn (दोस्तों को invite karke kamana)
1. **Profile** me jayein aur **Referral Program** open karein.
2. Apna unique code (jaise `VIPER99`) copy karein ya WhatsApp/Telegram par share karein.
3. Jab aapka friend register karega, to usko **₹25 Welcome Bonus** milega aur aapko bhi **₹25 Bonus Cash** milega!

---

## 🛠️ 3. How to Use Admin Panel (एडमिन पैनल कैसे चलाएं)

Admin panel se pura platform control hota hai:

### 1. Dashboard Overview
- **Total Users & Verified Players:** Kitne players registered hain.
- **Active Tournaments:** Kitne matches abhi open ya live hain.
- **Total Revenue:** Entry fees se kitna collection hua.
- **Prizes Disbursed:** Players ke wallet me kitna prize transfer kiya gaya.

---

### 2. Tournaments Manage & Create Karna
1. Left sidebar me **Tournaments** par click karein.
2. Naya match banane ke liye top-right me **Create Tournament** dabayein:
   - Match Title (e.g. *Bermuda Grand Masters Solo*)
   - Mode: Solo / Duo / Squad
   - Map: Bermuda / Purgatory / Kalahari
   - Entry Fee (e.g. ₹20) aur Prize Pool (e.g. ₹1000)
   - Max Slots (e.g. 50 players)
   - **Publish Tournament** dabayein. Match players ke app me turant live ho jayega!

---

### 3. Room ID & Password Release Karna
Jab match start hone ka time ho:
1. Tournament card par **Room Credentials** button dabayein.
2. Free Fire me banaye gaye Custom Room ka **Room ID** aur **Password** yahan daalein.
3. **Publish Room** dabayein.
4. Ye details sirf un players ko dikhegi jinhone fees de kar join kiya hai!

---

### 4. Result Verify Karna & Winners ko Prize Baantna
Match khatam hone ke baad:
1. Tournament card par **Verify & Pay** button dabayein.
2. Player ki ID aur uski jeeti hui Prize Amount (e.g. Rank 1 = ₹400) daalein.
3. **Confirm & Credit Prize** dabayein.
4. **Result:** Player ke **Winnings Balance** me turant paise credit ho jayenge aur usko Notification chali jayegi!

---

### 5. Tournament Cancel Karna & Full Refund Dena
Agar match me kam players aaye ya room me glitch ho gaya:
1. Tournament card par **Cancel & Refund All Entries** dabayein.
2. Cancellation reason likhein (jaise *Room technical error*).
3. System har registered player ki entry fee turant unke **Deposit Balance** me 100% refund kar dega!

---

### 6. KYC Review Queue
1. Sidebar me **KYC Approvals** par jayein.
2. Players ke Legal Name, Age, aur Documents dekhein.
3. Agar details sahi hain, to **Approve** dabayein.
4. Agar document me gadbad hai, to **Reject** dabayein aur reason likhein (jaise *Blurry image*).

---

### 7. Payout / Withdrawal Requests Approve Karna
1. Sidebar me **Payout Requests** par jayein.
2. Player ka UPI ID aur requested withdrawal amount dekhein.
3. Payment send karne ke baad **Mark Paid** dabayein.
4. Agar UPI ID galat hai to **Reject & Refund** dabayein — paise player ke winnings wallet me wapas laut jayenge.

---

### 8. Anti-Fraud & Risk Center
1. Sidebar me **Anti-Fraud Shield** par jayein.
2. System automatically un accounts ko flag karta hai jo:
   - Ek hi device se multiple account bana rahe hain.
   - Banned states (Assam, Odisha, Telangana, etc.) se khelne ki koshish kar rahe hain.
   - Underage (18 saal se kam) hain.
3. Admin yahan se suspicious accounts ka wallet **Freeze** kar sakta hai ya account **Suspend** kar sakta hai.

---

### 9. Platform Configuration & Branding
1. Sidebar me **Platform Config** par jayein.
2. Yahan se admin bina app update kiye live change kar sakta hai:
   - App Name & Tagline
   - Brand Accent Color
   - Minimum / Maximum Deposit (₹50 - ₹10,000)
   - Minimum / Maximum Withdrawal (₹100 - ₹25,000)
   - Platform Fee Commission (e.g. 10%)
   - Maintenance Mode on/off
   - Geo-Restricted States list

---

## 🧪 4. Testing & Verification Commands

Backend ke financial logic aur wallet safety ko test karne ke liye:

```powershell
cd "C:\Users\Awara\Desktop\ff arena\backend"
node --test tests/flows.test.js
```

Test results output:
```
▶ Tournament X Commercial Engine Tests
  ✔ Should verify double-entry accounting balance consistency
  ✔ Should enforce KYC prerequisite before withdrawal
  ✔ Should enforce geographic restriction for prohibited states
  ✔ Should calculate score dynamically using placement and kill points
✔ Tournament X Commercial Engine Tests (4 passed, 0 failed)
```

---

## 🔒 5. Production Financial Checklist

Production me real paise ke sath live karne se pehle ye steps complete karein:

1. `.env` file me `PRODUCTION_FINANCIAL_MODE=true` set karein.
2. Apne payment gateway (Razorpay ya Cashfree) ki Live API Keys aur Webhook Secret `.env` me dalein.
3. Payout provider (RazorpayX ya Cashfree Payouts) configure karein.
4. Statutory legal opinion verify karein ki skill-based esports aapke target states me compliant hai.
5. Restricted states (`Andhra Pradesh, Assam, Nagaland, Odisha, Sikkim, Telangana`) ki geo-blocking active rakhein.
