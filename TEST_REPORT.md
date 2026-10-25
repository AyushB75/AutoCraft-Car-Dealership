# Verification report — October 25, 2026

This report distinguishes checks executed in the remediation session from historical claims. Source-of-truth command output is saved under `evidence/`; screenshots do not replace those logs.

## Current executed checks

| Command / check | Observed result | Evidence |
|---|---|---|
| Backend `npm test` | 69 passed, 5 suites; 43.525 s | Observed terminal run before coverage |
| Backend `npm run test:coverage` | 69 passed, 5 suites; 70.046 s | [backend-coverage.txt](evidence/backend-coverage.txt) |
| Frontend `npm test` | 16 passed, 7 files; 21.75 s | [frontend-tests.txt](evidence/frontend-tests.txt) |
| Frontend `npm run lint` | Exit 0; no warnings/errors | [frontend-lint.txt](evidence/frontend-lint.txt) |
| Frontend `npm run build` | Exit 0; Vite build completed in 4.03 s | [frontend-build.txt](evidence/frontend-build.txt) |
| Local `.env` signing diagnostic | Configured secret verified successfully; values withheld | Observed database-free diagnostic |
| Real API, persistence, browser checks | See machine-readable check list | [live-verification.json](evidence/live-verification.json) |

No typecheck script is configured (this is a JavaScript project). Frontend coverage was not measured. No CI/public repository run is claimed.

Environment: Windows, Node 24.14.0, npm 11.9.0, Jest 29.7.0, Vitest 5.0.5, Vite 8.3.5, Mongoose 8.24.7. Backend integration tests use isolated MongoDB Memory Server instances with a real mongod process. Live verification instead starts a dedicated MongoDB 7.0.24 process with a retained disk data directory and the normal application entrypoint.

## Coverage scope

| Metric | Measured |
|---|---:|
| Statements | 76.55% |
| Branches | 82.00% |
| Functions | 78.57% |
| Lines | 76.80% |

The current configuration includes **all backend source files except the explicitly excluded legacy mock server**, including startup and seed scripts. The old 87.23% statement figure counted only loaded files and is not directly comparable. Startup and seed subprocesses are exercised by live verification but their coverage is not merged into Jest. Low measured startup/seed coverage remains visible; it has not been hidden to improve the percentage. Frontend coverage is unmeasured.

## What the tests establish

- Original 39 backend tests: registration/hash storage, duplicate email, login, protected routes, admin CRUD, search criteria/combinations, purchase/zero stock, ten simultaneous last-unit purchases, and restocking.
- 22 regression cases: configured signing secret, expired JWT, public role injection, non-string login input, invalid numeric vehicle input, invalid IDs, literal regex characters, invalid search ranges/types, invalid updates, database readiness, and safe internal errors.
- 8 configuration/startup cases: missing/placeholder secret, required production settings, port/duration validation, missing/weak/legacy admin credentials, and failed database startup.
- 16 frontend cases: original card/filter/alert tests plus stale response ordering, true total counts, filtered add refresh, error-vs-empty state, labeled/focusable admin dialog and Escape, authentication errors, and session-expiry handling including an old request arriving after a newer login.

## Real-stack verification

`scripts/verify-live.mjs` uses dedicated ports 27028/5055/5175 and an ignored disk directory under `.local-verification/`. It generates credentials in memory, provisions an admin through the actual seed script, starts `backend/src/server.js`, and invokes real HTTP endpoints. It does not use `startDemoServer.js`, mock API responses, or an in-memory application catalog.

Observed checks include normal startup/readiness; registration/login/profile and wrong-password rejection; role denial; admin create/update/get/search/delete; purchase decrement; zero-stock rejection; ten concurrent last-unit purchases (one HTTP 200, nine HTTP 400); restocking; HTTP 503 on database loss; and successful login/stock recovery after restarting MongoDB against the same disk directory.

Browser automation registers a customer, purchases a Toyota (8 → 7 stock), verifies the sold-out button is disabled, logs in as admin, adds/edits/restocks/deletes a vehicle, and checks a 390px mobile viewport for horizontal overflow. The passing run reported no browser runtime errors. Screenshot paths and provenance are listed in [screenshots/README.md](screenshots/README.md).

## Failures observed and resolved

- The initial backend regression run had **16 failures and 6 passes**. Fifteen failures exposed application behavior; one was an invalid attempt to spy on Mongoose's non-configurable readiness property. That test was corrected to disconnect/reconnect the isolated test database.
- The first frontend regression run had **4 failures** (two files), then all passed after fixes.
- The first test command was mistakenly invoked from the repository root, which has no package.json; it returned ENOENT. It was rerun in `backend/`.
- An initial live screenshot run completed API/persistence checks but timed out because the verification script expected three SUVs; the seed contains two. The expectation was corrected to two; the completed rerun passed. [Initial attempt](evidence/live-initial-attempt.json) is retained.
- The initial lint check reported a request-sequence cleanup warning. The code documents and narrowly suppresses that false positive; final lint is clean. The API synchronization effect also has a narrow, explained suppression. Warnings are not globally disabled.

Remaining tool notices: Node reports experimental VM Modules for Jest; Vitest prints an environment-performance suggestion; the build may print plugin timing information. These are recorded tool notices, not failed checks.

Final preservation/review checks: protected local environment files, raw transcript, original screenshot, and Git HEAD matched their pre-change backup hashes. All 15 commits remain, HEAD `90f8ef0`, with no staged changes. `git diff --check` passed (Git emitted line-ending conversion notices only). The private-value scan found no exact matches in current publishable text files, but did find current private values in three historical README revisions. Rotate affected credentials privately before publication; history and private files were intentionally not rewritten.

## Historical evidence and limits

The preserved private transcript corroborates earlier 39/39 backend and 9/9 frontend passes, an earlier build, and the old measured coverage. The previous frontend report included individual timings not present in the saved aggregate output; those uncorroborated timings have been removed. The old screenshot was captured against a mock server and is not treated as real-stack evidence.

The current checks do not constitute penetration testing, production-load testing, full browser/device compatibility testing, or an accessibility certification. The original assessment attachment is absent, so exact rubric compliance is not established. No remote publication, deployment, submission, or new Git commit occurred.
