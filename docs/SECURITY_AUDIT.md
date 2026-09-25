# TOURNAMENT X • Security & Compliance Audit Checklist

This document details the enterprise defensive measures implemented across the backend, mobile app, and database.

| Threat Category | Defensive Implementation | Verification Status |
| :--- | :--- | :--- |
| **Authentication Bypass** | Signed JWTs with short-lived access tokens (1h) and rotating refresh tokens (30d). | Verified ✅ |
| **Authorization / IDOR** | Fine-grained RBAC checks on every admin and user endpoint. Players can only query their own records. | Verified ✅ |
| **SQL Injection** | Parameterized queries via `pg` driver and strict in-memory ORM type boundaries. | Verified ✅ |
| **XSS & CSRF** | Helmet security headers with strict CSP, Content-Type scoping, and sanitized JSON payloads. | Verified ✅ |
| **Double-Debit Race Conditions** | Unique idempotency keys (`idempotency_key` unique constraints) and atomic transactions. | Verified ✅ |
| **Negative Balance Exploits** | PostgreSQL `CHECK (balance >= 0)` constraints on all financial columns. | Verified ✅ |
| **Payment Webhook Forgery** | Server-side HMAC SHA256 signature verification with secret key validation. | Verified ✅ |
| **Multi-Account Fraud** | Anti-Fraud heuristic engine checking hardware device fingerprint reuse across accounts. | Verified ✅ |
| **Geo-Restricted Violations** | Pre-join state validation blocking players from restricted jurisdictions. | Verified ✅ |
| **Underage Gambling** | Mandatory DOB calculation blocking users below 18 years from real-money fee brackets. | Verified ✅ |
| **Credential / Key Leaks** | Zero hardcoded API keys. All keys loaded via `.env` with `.env.example` templates. | Verified ✅ |
| **Sensitive Data Exposure** | Government ID numbers masked (`ABCDE****F`) and encrypted at rest. Passwords hashed using bcrypt. | Verified ✅ |
| **Append-Only Auditing** | `audit_logs` table records actor ID, role, action, target entity, before/after state, and IP. | Verified ✅ |
| **DDoS & Brute Force** | OTP generation rate-limited (max 1 per 60s, max 5 attempts before invalidation). | Verified ✅ |
