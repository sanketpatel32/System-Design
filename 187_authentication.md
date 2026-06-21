# Authentication

> **Category:** Security

---

Authentication = **verifying who a user is.** "Are you really Alice?"

### Common methods
- **Passwords**: classic, store hashed (bcrypt/scrypt/argon2).
- **TOTP** (Authenticator apps): time-based codes.
- **SMS OTP**: texted codes (less secure, SIM-swap risk).
- **Hardware keys** (YubiKey, FIDO2): phishing-resistant.
- **Biometrics**: fingerprint, face.
- **OAuth / SSO**: log in with Google, GitHub.
- **Certificates** (mTLS): for service-to-service.

### Multi-factor (MFA)
- Combine something you **know** (password) with something you **have** (phone) or
  **are** (biometric).
- Reduces account takeover risk dramatically.

### Password storage
- **Never store plaintext.**
- Hash with **bcrypt / scrypt / argon2** (slow hashes, designed for passwords).
- Add **salt** (random per-user).
- Don't use MD5/SHA — fast hashes = easy cracking.

### Session after auth
- Server issues a **session token** (cookie, JWT).
- Client includes it on every request.
- Server validates token → identifies user.

### Threats
- **Phishing**: user gives creds to fake site.
- **Credential stuffing**: bots try leaked passwords.
- **Brute force**: try every password.
- **Session theft**: steal the token (XSS, MITM).

### Defenses
- Rate limit login attempts.
- Lockout after N failures.
- MFA.
- CAPTCHA on suspicious activity.
- Monitor for anomalous logins.
- Use hardware keys for high-risk users (admins).

### Key takeaway
Authentication = "who are you?". Use modern hashes (argon2), require MFA, monitor for
anomalies. For high-security, use hardware keys (FIDO2) which are phishing-resistant.
