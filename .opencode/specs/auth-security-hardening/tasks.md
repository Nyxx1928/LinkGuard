# Implementation Plan: Auth Security Hardening

## Overview

Implementation is organized into 5 phases — starting with the simplest, highest-impact fixes, then the risk scoring overhaul, then email verification. Each phase is independently testable and deployable. Total estimated effort: **moderate** (risk scoring + email verification are the bulk of the work).

---

## Tasks

### Phase 1: Quick Security Wins (Rate Limiting, Token Prefix, Form Requests)

These are the simplest changes — mainly config tweaks and creating validation classes. No frontend changes needed.

- [ ] **1. Add Form Request classes**
  - Create `app/Http/Requests/RegisterRequest.php` with name/email/password rules (including password complexity)
  - Create `app/Http/Requests/LoginRequest.php` with email/password rules
  - Update `AuthController@register` to type-hint `RegisterRequest` instead of inline validation
  - Update `AuthController@login` to type-hint `LoginRequest` instead of inline validation
  - Run `php artisan make:test Auth/RegisterValidationTest` and verify password complexity rejection
  - _Requirements: 10.1, 10.2, 10.3, 9.1, 9.2_

- [ ] **2. Add rate limiting to auth routes**
  - In `routes/api.php`: add `->middleware('throttle:3,60')` to register route
  - In `routes/api.php`: add `->middleware('throttle:5,1')` to login route
  - Run `php artisan make:test Auth/RateLimitTest` — verify 401/422 on normal requests and 429 after exceeding limits
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] **3. Set Sanctum token prefix**
  - In `config/sanctum.php`: change `'token_prefix'` to `'lg_'`
  - OR set `SANCTUM_TOKEN_PREFIX=lg_` in `.env`
  - Verify token format: `lg_1|abc123...`
  - _Requirements: 5.1_

- [ ] **4. Checkpoint — Phase 1 Complete**
  - Run full test suite: `php artisan test`
  - Verify: login still works, register still works, password "abc" rejected, token starts with `lg_`
  - Ask user if questions arise before proceeding

---

### Phase 2: Login Hardening (Timing Safety + Multi-Device)

This phase addresses the two most important security changes.

- [ ] **5. Implement timing-safe login**
  - In `AuthController@login`, replace:
    ```php
    if (! $user || ! Hash::check($data['password'], $user->password)) {
    ```
    with:
    ```php
    $dummyHash = '$2y$12$' . str_repeat('0', 60);
    if (! $user || ! Hash::check($request->password, $user->password ?? $dummyHash)) {
    ```
  - Write `tests/Unit/Auth/TimingSafeLoginTest.php` that verifies:
    - Non-existent email still returns "incorrect credentials"
    - Wrong password still returns "incorrect credentials"
    - Both paths call `Hash::check()` (mock assertion if possible)
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] **6. Remove automatic single-session revocation**
  - In `AuthController@login`: **delete** the line `$user->tokens()->delete();`
  - Create `app/Http/Controllers/SessionController.php` with `revokeOthers()` method:
    - Deletes all tokens for the user except `$request->user()->currentAccessToken()->id`
    - Returns `{ "message": "Other sessions revoked." }`
  - Add route `POST /api/sessions/revoke-others` inside the `auth:sanctum` group
  - Write `tests/Feature/Auth/MultiDeviceTest.php`:
    - Login twice → verify both tokens work
    - Call `revoke-others` → verify first token still works, other token dead
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] **7. Update 401 interceptor (frontend)**
  - In `frontend/src/api.js`: replace the fragile `url.includes()` check with an explicit whitelist array + `startsWith`/`===` comparison
  - Define `PUBLIC_ENDPOINTS = ['/api/login', '/api/register', '/email/verify/']`
  - Write `src/__tests__/api.test.js` with test cases for:
    - Public endpoint 401 → no session clear
    - Protected endpoint 401 → session cleared + event dispatched
    - URL edge cases (trailing slash, query params)
  - _Requirements: 4.1, 4.2, 4.3_

- [ ] **8. Checkpoint — Phase 2 Complete**
  - Run full backend test suite: `php artisan test`
  - Run frontend tests: `npm test` in `frontend/`
  - Manual verification: login from two browsers/tabs → both stay logged in
  - Ask user if questions arise before proceeding

---

### Phase 3: Multi-Signal Risk Scoring Overhaul

This phase rewrites the entire risk scoring engine from a naive 2-flag decision tree to a weighted multi-signal system with blocklist checks, domain reputation, typosquatting detection, and a known-services whitelist.

- [ ] **9. Create config file and service DTOs**
  - Create `config/risk-scoring.php` with:
    - `weights` array: proxy=25, hosting=8, on_blocklist=40, domain_age_under_7_days=35, domain_age_under_30_days=25, domain_age_under_90_days=15, no_valid_ssl=20, suspicious_tld=10, typosquatting=35, known_service_bonus=30
    - `thresholds` array: high=65, medium=30
    - `blocklist` config section with enabled/api_key/timeout per provider
    - `whois` config section with timeout
  - Create DTOs: `RiskScoreResult`, `BlocklistResult`, `DomainReputationResult`, `TyposquattingResult`
  - Bind all new services in `AppServiceProvider`
  - _Requirements: 11.1_

- [ ] **10. Create KnownServicesWhitelist service**
  - Create `app/Services/KnownServicesWhitelist.php`
  - Loads from `storage/known-services.json`
  - Supports exact domain match + subdomain match
  - Create `storage/known-services.json` with initial list (~50 well-known services: GitHub, GitLab, Google, Resend, Stripe, AWS, Vercel, etc.)
  - Write `tests/Unit/Risk/KnownServicesWhitelistTest.php`:
    - Exact match returns true
    - Subdomain match (e.g., `app.resend.com`) returns true
    - Unknown domain returns false
  - _Requirements: 11.2, 11.9_

- [ ] **11. Create DomainReputationChecker service**
  - Create `app/Services/DomainReputationChecker.php`
  - WHOIS lookup via `fsockopen` to whois servers (extract creation date from common formats)
  - SSL check via `@stream_context_create` + `get_meta_data` or `openssl` functions
  - Suspicious TLD list: `.xyz`, `.top`, `.gq`, `.ml`, `.tk`, `.cf`, `.click`, `.download`, `.review`, `.work`, `.date`, `.faith`, `.men`, `.loan`, `.win`, `.bid`
  - All checks wrapped in try-catch, returning nulls on failure
  - Write `tests/Unit/Risk/DomainReputationCheckerTest.php`:
    - Valid SSL domain returns sslValid=true
    - Suspicious TLD detected
    - WHOIS failure returns null domainAgeDays
  - _Requirements: 11.5, 11.6, 11.7_

- [ ] **12. Create TyposquattingDetector service**
  - Create `app/Services/TyposquattingDetector.php`
  - Uses Levenshtein distance against the known services whitelist
  - Flags if distance <= 2 and domain !== target
  - Ignores common false positives (e.g., similar legitimate domain)
  - Write `tests/Unit/Risk/TyposquattingDetectorTest.php`:
    - Exact known domain → no flag
    - Typo `githab.com` → flagged as squatting `github.com`
    - `go0gle.com` → flagged as squatting `google.com`
    - Completely different domain → no flag
  - _Requirements: 11.8_

- [ ] **13. Create BlocklistChecker service**
  - Create `app/Services/BlocklistChecker.php`
  - Three checks, each with 5-second timeout, each independently failing gracefully:
    - **Google Safe Browsing**: POST to `https://safebrowsing.googleapis.com/v4/threatMatches:find?key={API_KEY}` with threatTypes=[MALWARE, SOCIAL_ENGINEERING, UNWANTED_SOFTWARE, POTENTIALLY_HARMFUL_APPLICATION]
    - **PhishTank**: POST to `https://checkurl.phishtank.com/checkurl/` with URL-encoded target
    - **VirusTotal**: GET to `https://www.virustotal.com/api/v3/domains/{domain}` with API key header
  - If ANY provider matches → `found=true` with source names in array
  - All exceptions caught → log warning, return not-found
  - Write `tests/Unit/Risk/BlocklistCheckerTest.php` with mocked HTTP responses:
    - GSB match → found=true
    - No match → found=false
    - API timeout → found=false (graceful)
  - _Requirements: 11.3, 11.4, 11.11_

- [ ] **14. Rewrite RiskScorer service**
  - Rewrite `app/Services/RiskScorer.php`:
    - Inject `BlocklistChecker`, `DomainReputationChecker`, `KnownServicesWhitelist`, `TyposquattingDetector`
    - `score(string $domain, ?string $resolvedIp, ?GeoResult $geo): RiskScoreResult`
    - Algorithm as designed in the design document (weighted multi-signal)
    - Read weights from `config('risk-scoring.weights')`
    - Clamp result to 0-100
    - Map to level using `config('risk-scoring.thresholds')`
    - Build `risk_breakdown` array with each contributing factor
  - Update `AnalyzeController@performAnalysis` to pass domain + IP + geo to the new `RiskScorer`
  - Update the API response to include `risk_score`, `risk_level`, and `risk_breakdown`
  - Write `tests/Unit/Risk/RiskScorerTest.php`:
    - Proxy flag → adds 25 points
    - Hosting flag → adds 8 points
    - Known service bonus → subtracts 30 points
    - Young domain (< 7 days) → adds 35 points
    - No SSL → adds 20 points
    - Suspicious TLD → adds 10 points
    - Typosquatting → adds 35 points
    - Blocklist match → adds 40 points
    - All good signals → LOW score
    - All bad signals → HIGH score
    - Score clamped to [0, 100]
    - Breakdown sum equals total score
    - API timeout → graceful degradation, score computed with available data
  - _Requirements: 11.1 through 11.12_

- [ ] **15. Add .env variables for blocklist APIs**
  - Update `.env.example` with:
    ```env
    GSB_ENABLED=false
    GSB_API_KEY=
    PHISHTANK_ENABLED=false
    PHISHTANK_API_KEY=
    VIRUSTOTAL_ENABLED=false
    VIRUSTOTAL_API_KEY=
    ```
  - All blocklist features default to `false` (opt-in)
  - _Requirements: 11.11_

- [ ] **16. Checkpoint — Phase 3 Complete**
  - `php artisan test` — all 15+ new risk scoring tests pass
  - Existing analysis tests still pass (regression)
  - Manual test: analyze `resend.com` → LOW score with breakdown showing hosting + known_service_bonus
  - Manual test: analyze a fresh `.xyz` domain → MEDIUM or HIGH with breakdown showing domain_age + suspicious_tld
  - Verify `risk_breakdown` is present in API response and human-readable
  - Ask user if questions arise before proceeding

---

### Phase 4: Email Verification Backend (Provider + Laravel Integration)

This phase sets up Resend, adds the `MustVerifyEmail` interface, and creates verification routes.

- [ ] **14. Configure Resend mail provider**
  - Install: `composer require resend/resend-php`
  - Sign up at [resend.com](https://resend.com) → get API key
  - Add to `.env`:
    ```env
    MAIL_MAILER=resend
    RESEND_API_KEY=re_xxxxxxxxx
    MAIL_FROM_ADDRESS=onboarding@resend.dev
    MAIL_FROM_NAME="LinkGuard"
    ```
  - For development: keep `MAIL_MAILER=log` in local `.env` (emails go to `storage/logs/laravel.log`)
  - Optionally: add Mailpit service to `docker-compose.yml` for dev email UI
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] **15. Update User model for email verification**
  - Add `implements MustVerifyEmail` to `User` class:
    ```php
    use Illuminate\Contracts\Auth\MustVerifyEmail;
    class User extends Authenticatable implements MustVerifyEmail
    ```
  - This enables Laravel's built-in `SendEmailVerificationNotification` and `VerifyEmail` notification
  - _Requirements: 6.1, 6.2_

- [ ] **16. Create EmailVerificationController**
  - Create `app/Http/Controllers/EmailVerificationController.php` with:

    **`__invoke(Request $request, $id, $hash)`** — handles verification link click
    - Find user by `$id`
    - Validate `$hash` against `sha1($user->getEmailForVerification())`
    - Check `expires` timestamp from signed URL
    - If valid: mark `email_verified_at = now()`, return success JSON
    - If invalid: return error JSON
    - Redirect-based approach: return redirect to frontend URL with status param

    **`resend(Request $request)`** — resends verification email
    - Check `$request->user()->hasVerifiedEmail()` → 400 if already verified
    - Send `VerifyEmail` notification
    - Return `{ "message": "Verification email sent." }`
    - Route throttled: `throttle:1,1`

  - Add routes:
    ```php
    Route::get('/email/verify/{id}/{hash}', [EmailVerificationController::class, '__invoke'])
        ->name('verification.verify');
    Route::middleware('auth:sanctum')->post('/api/email/resend', [EmailVerificationController::class, 'resend'])
        ->middleware('throttle:1,1');
    ```
  - _Requirements: 6.3, 6.4, 6.5, 6.6_

- [ ] **17. Update AuthController@register to send verification email**
  - After user creation, send the verification notification:
    ```php
    $user->sendEmailVerificationNotification();
    ```
  - This wraps the dispatch in a try-catch to ensure registration succeeds even if mail fails (fail-safe principle)
  - _Requirements: 6.2_

- [ ] **18. Write email verification backend tests**
  - `tests/Feature/Auth/EmailVerificationTest.php`:
    - Register → user has `email_verified_at = null`
    - Hit verification link with valid hash → `email_verified_at` set
    - Hit verification link with invalid hash → 400 error
    - Hit verification link after already verified → 400 "already verified"
    - Resend endpoint → throttled to 1 per minute
    - Resend when already verified → 400
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [ ] **19. Checkpoint — Phase 4 Complete**
  - `php artisan test` — all pass
  - Manual: register a user with `MAIL_MAILER=log`, check `storage/logs/laravel.log` for the verification email content
  - Verify link works: copy the signed URL from logs, hit it in browser → verified
  - Ask user if questions arise before proceeding

---

### Phase 5: Email Verification Frontend (Verification Banner + Pages)

This phase adds the React components for the email verification user experience.

- [ ] **20. Create VerificationBanner component**
  - Create `frontend/src/components/auth/VerificationBanner.js`
  - Props: `user` (with `email_verified_at`), `onVerify`
  - Renders a yellow info banner: "Please verify your email address."
  - Includes "Resend verification email" button → calls `POST /api/email/resend`
  - Shows success/error feedback inline
  - Only renders when `user?.email_verified_at === null`
  - Write `src/__tests__/VerificationBanner.test.js`:
    - Renders when unverified
    - Hidden when verified
    - Resend button calls correct API
  - _Requirements: 8.2, 8.3, 8.5_

- [ ] **21. Integrate VerificationBanner into App.js**
  - Import `VerificationBanner` and render it between the session-warning banner and the page content
  - Pass `user` data (needs to be stored in state — see next task)
  - _Requirements: 8.2_

- [ ] **22. Store user data in App.js state**
  - Currently `App.js` only stores `isLoggedIn` — it needs the full user object to check `email_verified_at`
  - Update `GET /api/me` handler to store `user` in state: `const [user, setUser] = useState(null)`
  - Pass `user` down to `VerificationBanner`
  - Pass `user` to `PageHeader` and `MobileNav` (for existing name display — currently working via prop drilling)
  - _Requirements: 8.2, 8.5_

- [ ] **23. Create VerifyEmail page**
  - Create `frontend/src/pages/VerifyEmail.js`
  - Two states handled via URL query params (e.g., `/email/verify?status=success` or `/email/verify?status=invalid`):

    **Success state:**
    - Icon + heading: "Email verified!"
    - Subtext: "Redirecting to dashboard..."
    - Auto-redirect to `/home` after 3 seconds

    **Invalid/Expired state:**
    - Icon + heading: "Verification link invalid"
    - Subtext: "This link has expired or is invalid."
    - "Request new link" button → calls resend endpoint
    - On success: "A new verification email has been sent."

  - Add route to `App.js`:
    ```jsx
    <Route path="/email/verify" element={<VerifyEmail />} />
    ```
  - In `EmailVerificationController.__invoke`, after processing the verification, return a redirect URL like:
    ```php
    return redirect(env('FRONTEND_URL') . '/email/verify?status=success');
    // or ?status=invalid
    ```
  - Write `src/__tests__/VerifyEmail.test.js`:
    - Success state renders correct text
    - Invalid state renders correct text
    - "Request new link" button works
  - _Requirements: 8.4_

- [ ] **24. Update Register.js post-registration flow**
  - Currently: immediate redirect to `/home` after registration
  - New behavior: show success notice "Account created! Please check your email." for 3 seconds, **then** redirect to `/home`
  - This is important so users see the email verification message before being sent to the dashboard where the banner will also show
  - Write test verifying the notice appears before redirect
  - _Requirements: 8.1_

- [ ] **25. Checkpoint — Phase 5 Complete**
  - Run all frontend tests: `npm test`
  - Run all backend tests: `php artisan test`
  - Manual E2E walkthrough:
    1. Register → see post-registration notice → redirected to home → verification banner visible
    2. Open verification email (from logs if using `log` driver) → click link → see verify success page → auto-redirect to home → banner gone
    3. Try expired/invalid link → see error page → click resend → new email sent
  - Ask user if questions arise before proceeding

---

### Phase 6: Final Validation

- [ ] **26. Full regression test suite**
  - `php artisan test` — all backend tests pass
  - `npm test` — all frontend tests pass
  - Review all modified files for any missed edge cases
  - Verify no breaking changes to the API contract (compare with pre-fix Postman collection if available)
  - _Requirements: RP.1 through RP.8_

- [ ] **27. Documentation update**
  - Update `.env.example` with new variables:
    ```env
    SANCTUM_TOKEN_PREFIX=lg_
    MAIL_MAILER=log
    RESEND_API_KEY=
    MAIL_FROM_ADDRESS=onboarding@resend.dev
    MAIL_FROM_NAME=LinkGuard
    FRONTEND_URL=http://localhost:3000
    ```
  - Note in `REPO_DOCUMENTATION.md` or `README.md`:
    - New endpoints added (`POST /api/sessions/revoke-others`, `POST /api/email/resend`)
    - Rate limiting rules
    - Email verification setup
  - _Requirements: 7.3_

- [ ] **28. Final checkpoint — All complete**
  - All 10 bug categories addressed
  - Email verification end-to-end working
  - All tests green
  - Ask user for final confirmation

---

## Notes

- Tasks marked with `*` are optional/skip-for-MVP (none in this plan — all are required)
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation throughout development
- Phases can be deployed independently after their checkpoint
