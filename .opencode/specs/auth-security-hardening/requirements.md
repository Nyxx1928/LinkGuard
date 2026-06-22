# Bugfix Requirements Document: Auth Security Hardening

## Introduction

This specification addresses 10 security and design issues identified in the authentication system of LinkGuard, plus adds email verification infrastructure with a free mail provider. The fixes target user enumeration vulnerabilities, missing rate limiting, destructive single-session behavior, fragile error handling, missing security hardening features, accurate multi-signal risk scoring, and email verification — all while preserving existing functionality.

## Glossary

| Term | Definition |
|---|---|
| **User Enumeration** | An attack where an attacker can determine whether an email address is registered by observing differences in response time or error messages |
| **Rate Limiting** | Restricting the number of requests a client can make to an endpoint within a time window |
| **Single-Session Policy** | The current behavior where logging in on one device invalidates all other sessions |
| **Token Prefix** | A recognizable string prepended to API tokens for identification and secret scanning |
| **Form Request** | A dedicated Laravel class that encapsulates validation logic for a request |
| **401 Interceptor** | The Axios response handler that detects unauthorized responses and logs the user out |
| **Refresh Token** | A secondary token used to obtain new access tokens without re-authentication |
| **Email Verification** | The process of confirming a user controls the email address they registered with |
| **Session Token** | A Sanctum personal access token used to authenticate API requests |
| **Brute Force Attack** | Repeated login attempts with different passwords to gain unauthorized access |
| **Timing Attack** | An attack that exploits variations in response processing time to infer information |
| **Resend** | A transactional email API with a free tier (100 emails/day, 3,000/month) that works with `@resend.dev` without needing a custom domain |
| **Mailpit** | An open-source email testing tool that runs locally via Docker — captures all emails in a web UI during development |
| **Google Safe Browsing** | A free Google API that maintains a blocklist of unsafe web resources (phishing, malware, unwanted software) — up to 10,000 queries/day free |
| **PhishTank** | A free community-driven database of phishing URLs — requires API key for programmatic access |
| **VirusTotal** | A free service that aggregates detection results from 70+ antivirus scanners and blocklists — 500 requests/day, 4 req/min free |
| **WHOIS** | A protocol for querying domain registration information including creation date, registrar, and registrant details |
| **Typosquatting** | A form of cybersquatting that relies on typographical errors (e.g., `goggle.com` instead of `google.com`) |
| **Known Services Whitelist** | A curated list of well-known legitimate domains (GitHub, Resend, Google, etc.) that receive a reputation bonus in scoring |
| **Blocklist** | A database of domains, URLs, or IPs known to be associated with malicious activity |

---

## Requirements

### Requirement 1: Timing-Attack-Resistant Login

**User Story:** As a system, I want login response times to be constant regardless of whether the email exists, so that attackers cannot enumerate valid user emails.

#### Acceptance Criteria

1.1 **WHEN** a request is made to `POST /api/login` with a non-existent email, **THEN** the system SHALL perform both a user lookup AND a bcrypt hash comparison against a dummy hash before responding.

1.2 **WHEN** a request is made to `POST /api/login` with an existing email but wrong password, **THEN** the system SHALL perform both a user lookup AND a bcrypt hash comparison against the stored hash (unchanged).

1.3 **WHEN** credentials are invalid (regardless of which field is wrong), **THEN** the system SHALL return a generic "The provided credentials are incorrect." error with no indication of which field is wrong.

**Validates Bug Categories:** Bug 1 (User Enumeration via Timing Attack)

### Requirement 2: Rate-Limited Auth Endpoints

**User Story:** As a system administrator, I want login and registration endpoints to be rate-limited, so that brute force and account creation attacks are mitigated.

#### Acceptance Criteria

2.1 **WHEN** more than 5 login attempts are made from the same IP in 1 minute, **THEN** the system SHALL return HTTP 429 Too Many Requests with a Retry-After header.

2.2 **WHEN** more than 3 registration attempts are made from the same IP in 60 minutes, **THEN** the system SHALL return HTTP 429 Too Many Requests with a Retry-After header.

2.3 **WHEN** the rate limit is exceeded, **THEN** the frontend SHALL display a user-friendly error message indicating when to retry.

**Validates Bug Categories:** Bug 2 (No Rate Limiting)

### Requirement 3: Multi-Device Session Support

**User Story:** As a user, I want to stay logged in on my laptop when I log in on my phone, so that I don't lose my work or have to re-authenticate constantly.

#### Acceptance Criteria

3.1 **WHEN** a user logs in, **THEN** the system SHALL create a new token without deleting existing tokens (multi-device support).

3.2 **WHEN** a user wants to revoke all other sessions, **THEN** the system SHALL provide an explicit `POST /api/sessions/revoke-others` endpoint for that action.

3.3 **WHEN** a user calls `POST /api/sessions/revoke-others`, **THEN** the system SHALL revoke all tokens except the one used for the current request.

**Validates Bug Categories:** Bug 3 (Destructive Single-Session Without Warning)

### Requirement 4: Robust 401 Interceptor

**User Story:** As a developer, I want the 401 session expiry handler to use a whitelist of public routes instead of fragile string matching, so that renaming or adding endpoints doesn't silently break session cleanup.

#### Acceptance Criteria

4.1 **WHEN** any API request returns a 401, **THEN** the Axios interceptor SHALL check against a whitelist of known public endpoints by comparing the request URL against a defined list (not a substring `includes()` check).

4.2 **WHEN** a 401 is received on an endpoint NOT in the public whitelist, **THEN** the interceptor SHALL clear localStorage and dispatch the `auth:session-expired` event.

4.3 **WHEN** a 401 is received on an endpoint IN the public whitelist, **THEN** the interceptor SHALL NOT clear the session.

**Validates Bug Categories:** Bug 4 (Fragile 401 Interceptor)

### Requirement 5: Token Prefix for Secret Scanning

**User Story:** As a developer, I want API tokens to have a recognizable prefix, so that accidental leaks in code or logs are detectable by GitHub secret scanning.

#### Acceptance Criteria

5.1 **WHEN** a Sanctum token is created, **THEN** it SHALL be prefixed with `lg_` (e.g., `lg_1|abc123...`).

**Validates Bug Categories:** Bug 5 (Empty Token Prefix)

### Requirement 6: Email Verification (Backend Infrastructure)

**User Story:** As a system, I want to verify user email addresses, so that fake accounts are harder to create and users can recover their accounts.

#### Acceptance Criteria

6.1 **WHEN** a user registers, **THEN** the system SHALL create the account with `email_verified_at` set to `null`.

6.2 **WHEN** a user registers, **THEN** the system SHALL dispatch a verification email containing a signed URL.

6.3 **WHEN** a user clicks the verification link, **THEN** the system SHALL set `email_verified_at` to the current timestamp and return a success response.

6.4 **WHEN** a user clicks an expired or invalid verification link, **THEN** the system SHALL return an appropriate error response.

6.5 **WHEN** an authenticated user requests a new verification email (`POST /api/email/resend`), **THEN** the system SHALL resend the verification email (throttled to once per minute).

6.6 **WHEN** a verified user tries to verify again, **THEN** the system SHALL return a message indicating the email is already verified.

**Validates Bug Categories:** Bug 6 (No Email Verification)

### Requirement 7: Email Provider Configuration

**User Story:** As a developer, I want a clear, working email configuration using a free provider that doesn't require a custom domain, so that verification emails work immediately.

#### Acceptance Criteria

7.1 **WHEN** the application is in development mode, **THEN** the mail driver SHALL use `log` (emails written to `storage/logs/laravel.log`) for zero-configuration testing.

7.2 **WHEN** the application is in production, **THEN** the mail driver SHALL use **Resend** with the `@resend.dev` testing domain (no custom domain required).

7.3 **WHEN** the `.env` file is configured with Resend credentials, **THEN** the system SHALL send actual emails through Resend's API.

7.4 **WHEN** running locally via Docker, **THEN** Mailpit SHALL be available at `http://localhost:8025` to capture and inspect emails during development.

#### Recommended Provider: Resend

| Aspect | Detail |
|---|---|
| **Provider** | [Resend](https://resend.com) |
| **Free tier** | 100 emails/day, 3,000 emails/month |
| **Domain requirement** | None — use `onboarding@resend.dev` for testing |
| **Laravel support** | Native driver in Laravel 12 (`config/mail.php` already has `resend` transport) |
| **Setup time** | ~5 minutes |
| **Alternative (dev)** | Mailpit via Docker — captures all emails in local web UI, zero email sent externally |

#### Setup Steps

1. Sign up at [resend.com](https://resend.com) (free, no credit card)
2. Get your API key from the dashboard
3. Add to `.env`:
   ```env
   MAIL_MAILER=resend
   RESEND_API_KEY=re_xxxxxxxxx
   MAIL_FROM_ADDRESS=onboarding@resend.dev
   MAIL_FROM_NAME="LinkGuard"
   ```
4. Install the PHP SDK: `composer require resend/resend-php`
5. For Docker dev: add Mailpit to `docker-compose.yml` with SMTP port 1025 and UI port 8025

**Validates Bug Categories:** Bug 6 (Infrastructure)

### Requirement 8: Email Verification (Frontend UI)

**User Story:** As a user, I want to see a clear verification status and be able to resend the verification email, so that I can complete my email verification easily.

#### Acceptance Criteria

8.1 **WHEN** a user registers successfully, **THEN** the frontend SHALL show a success notice: *"Account created! Please check your email to verify your account. Didn't receive it? [Resend]"*

8.2 **WHEN** a user is logged in but has not verified their email, **THEN** a non-dismissible banner SHALL appear at the top of all pages: *"Please verify your email address. [Resend verification email]"*

8.3 **WHEN** the user clicks "Resend verification email", **THEN** the frontend SHALL call `POST /api/email/resend` and show a success message or error.

8.4 **WHEN** a user clicks the verification link in their email, **THEN** they SHALL be redirected to a frontend page `/email/verify?status=success` or `/email/verify?status=invalid` that shows:
   - **Success:** "Email verified! Redirecting to dashboard..." (auto-redirect after 3 seconds)
   - **Invalid/expired:** "Verification link expired or invalid. [Request new link]"

8.5 **WHEN** the user's email is successfully verified, **THEN** the verification banner SHALL disappear on the next page load.

**Validates Bug Categories:** Bug 6 (Frontend UI)

### Requirement 9: Strengthened Password Policy

**User Story:** As a system, I want passwords to meet complexity requirements, so that user accounts are more resistant to brute force attacks.

#### Acceptance Criteria

9.1 **WHEN** a user registers, **THEN** the password SHALL be required to contain at least: 8 characters, 1 uppercase letter, 1 lowercase letter, 1 digit, and 1 special character.

9.2 **WHEN** a password doesn't meet complexity requirements, **THEN** the system SHALL return a clear validation error listing all missing requirements.

**Validates Bug Categories:** Bug 7 (Weak Password Policy)

### Requirement 10: Form Request Validation Classes

**User Story:** As a developer, I want validation logic to be in dedicated Form Request classes, so that it is reusable, testable, and maintainable.

#### Acceptance Criteria

10.1 **WHEN** a registration request is received, **THEN** the system SHALL validate it using `App\Http\Requests\RegisterRequest`.

10.2 **WHEN** a login request is received, **THEN** the system SHALL validate it using `App\Http\Requests\LoginRequest`.

10.3 **WHEN** a form request validation fails, **THEN** the system SHALL return the same error structure as before (422 with validation errors).

**Validates Bug Categories:** Bug 8 (Inline Validation)

### Requirement 11: Accurate Multi-Signal Risk Scoring

**User Story:** As a user, I want the risk score to reflect the actual threat level of a target, so that legitimate websites (like `resend.com`, `github.com`) are not incorrectly flagged as medium or high risk just because they use cloud hosting.

#### Acceptance Criteria

11.1 **WHEN** a target is analyzed, **THEN** the risk score SHALL be calculated using a weighted combination of multiple signals, not just the `proxy` and `hosting` flags.

11.2 **WHEN** a target resolves to a known legitimate service (e.g., `github.com`, `resend.com`, `google.com`), **THEN** the risk score SHALL be reduced by a reputation bonus.

11.3 **WHEN** a target is found on Google Safe Browsing's blocklist, **THEN** the risk score SHALL be significantly increased (minimum HIGH).

11.4 **WHEN** a target is found on PhishTank's database, **THEN** the risk score SHALL be significantly increased (minimum HIGH).

11.5 **WHEN** a target has a suspiciously young domain (registered less than 30 days ago), **THEN** the risk score SHALL be increased proportionally to the recency.

11.6 **WHEN** a target does not have a valid SSL certificate, **THEN** the risk score SHALL be increased.

11.7 **WHEN** a target uses a suspicious TLD (e.g., `.xyz`, `.top`, `.gq`, `.ml`, `.tk`), **THEN** the risk score SHALL be increased.

11.8 **WHEN** a target appears to be typosquatting a known legitimate domain (e.g., `googIe.com` with a lowercase L instead of `google.com`), **THEN** the risk score SHALL be significantly increased.

11.9 **WHEN** a target passes all checks (cloud hosting, valid SSL, old domain, not on any blocklist, known legitimate service), **THEN** the risk score SHALL be LOW.

11.10 **WHEN** the geo provider fails or returns no data, **THEN** the system SHALL still attempt to score using the remaining signals and return a result with a note about partial data.

11.11 **WHEN** any external blocklist API is unreachable or times out, **THEN** the system SHALL degrade gracefully (skip that signal) and continue scoring with available data — never fail the entire request.

11.12 **WHEN** the analysis response is returned, **THEN** it SHALL include a `risk_breakdown` object explaining the contribution of each scoring factor, so users understand why a score was assigned.

**Validates Bug Categories:** Bug 9 (Inaccurate Risk Scoring)

---

### Unchanged Behavior (Regression Prevention)

RP.1 **WHEN** valid credentials are provided to `POST /api/login`, **THEN** the system SHALL CONTINUE TO return a token and user object with HTTP 200.

RP.2 **WHEN** valid registration data is provided to `POST /api/register`, **THEN** the system SHALL CONTINUE TO create a user and return a token with HTTP 201.

RP.3 **WHEN** a valid token is provided to `GET /api/me`, **THEN** the system SHALL CONTINUE TO return the authenticated user.

RP.4 **WHEN** a valid token is provided to `POST /api/logout`, **THEN** the system SHALL CONTINUE TO revoke the token.

RP.5 **WHEN** no token is provided to protected routes, **THEN** the system SHALL CONTINUE TO return HTTP 401.

RP.6 **WHEN** a user submits the login form from the frontend, **THEN** the system SHALL CONTINUE TO store the token in localStorage and redirect to `/home`.

RP.7 **WHEN** a user submits the registration form from the frontend, **THEN** the system SHALL CONTINUE TO store the token in localStorage and redirect to `/home`.

RP.8 **WHEN** a user's token expires server-side, **THEN** the system SHALL CONTINUE TO handle it via the 401 interceptor as before.

---

## Scope

### In-Scope

1. Timing-safe login (dummy hash comparison)
2. Rate limiting on `/api/login` and `/api/register`
3. Multi-device session support (remove automatic token revocation)
4. Dedicated "revoke other sessions" endpoint
5. Robust 401 interceptor (URL whitelist-based instead of string match)
6. Sanctum token prefix (`lg_`)
7. Email verification backend (Laravel `MustVerifyEmail`, verification routes, notification)
8. Email provider configuration (Resend for production, `log` for dev, Mailpit for Docker)
9. Frontend email verification UI (banner, verify page, resend button)
10. Strengthened password validation rules
11. Form Request classes for login and registration
12. Multi-signal risk scoring algorithm (network flags, blocklists, domain reputation, SSL, typosquatting, known services whitelist)
13. Known services whitelist configuration file
14. Google Safe Browsing / PhishTank / VirusTotal integration (graceful degradation on failure)
15. Risk score breakdown in API response
16. Configurable scoring weights in `config/risk-scoring.php`
17. Corresponding tests for all of the above

### Out-of-Scope

- Password reset flow (needs its own spec)
- Frontend session management page (can be done in a follow-up)
- OAuth / social login
- Two-factor authentication
- Refresh token mechanism (more extensive architecture changes — candidate for a follow-up spec)
- Email template customization (using Laravel's default Mail notification templates)
