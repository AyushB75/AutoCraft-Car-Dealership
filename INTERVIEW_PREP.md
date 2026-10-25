# Interview preparation — AutoCraft

Use these notes to explain the actual implementation and its limits. They do not certify that the owner has reviewed every change.

## Request flow and architecture

React components call `services/api.js`, which adds the Bearer token. Express routes apply authentication and role middleware, controllers validate input, services perform database operations, and Mongoose models enforce schema constraints. The database is persistent MongoDB. Test fixtures use isolated MongoDB instances; the separate legacy demo uses a JavaScript array and is not the real application.

## Configuration and authentication

`config/environment.js` loads the backend `.env` by module-relative path before exporting validated configuration. Missing/placeholder JWT secrets are rejected; production also requires explicit database and client-origin settings. This fixes the previous ES-module import-order defect: importing `app.js` before a later `dotenv.config()` let auth modules capture a fallback secret.

Passwords are hashed with bcrypt (10 rounds). API serialization removes password hashes. Public registration ignores a supplied admin role. HS256 JWT verification checks expiration and identity shape, while route middleware enforces roles. Initial admin credentials must be explicitly supplied; the seed refuses automatic promotion of an existing customer.

Trade-offs: sessions live in localStorage; server-side token revocation, immediate role-change invalidation, and rate limiting are not implemented. A known leaked secret must be rotated; Git history was preserved rather than rewritten. No production-readiness claim is made.

## Inventory and concurrency

A purchase uses a conditional atomic MongoDB update: match `_id` and `quantity > 0`, then `$inc: { quantity: -1 }`. A preliminary read provides friendly missing/out-of-stock errors, but the conditional write is what prevents overselling. Tests and real-stack verification sent ten simultaneous requests for the last unit and observed one success, nine rejections, and final stock zero.

Restocking uses an atomic increment with a positive-integer input. Admin edits validate an allowlist of fields. Search escapes regex metacharacters, so `[` searches literally instead of becoming malformed regex syntax. Price bounds must be finite/nonnegative and ordered. Invalid IDs are rejected before database lookup.

A successful request means one immediate sale. There is no payment/order workflow or idempotency key: retrying a successful purchase as a new request can buy another unit.

## Readiness and errors

Startup connects to MongoDB before listening. Health reports 503 while disconnected, and API requests are blocked while Mongoose reports unavailable. The driver detects connection loss asynchronously. Unexpected errors return a generic message; neither stack traces nor raw database failures are returned to clients.

## Frontend behavior

A request sequence discards obsolete search responses. Admin mutations refetch the active filter and total count instead of inserting records that no longer match. Totals come from a separate catalog request, which is simple but not optimal for very large inventories or perfectly atomic counts.

Dialogs have associated labels, accessible names, focus containment/restoration, and Escape support. Session-expiry events clear authentication, but an old request cannot erase a newer token. Mobile behavior was checked at 390px; broad device/accessibility certification is not claimed.

## Honest TDD history

The repository has four backend test-before-implementation commit pairs. Some RED failures were missing-module failures. Frontend tests and code were committed together in `263bd38`; do not describe that as independently proven test-first frontend work. All 15 original commits remain unchanged.

The current remediation added regression tests before fixing targeted backend and frontend defects. The initial backend run had 16 failures (including one test-harness error), and the initial frontend run had four failures. Later configuration/session tests were also added. No retroactive history or new commits were manufactured.

## Verification and limitations

Read [TEST_REPORT.md](TEST_REPORT.md) for actual current counts and measured coverage. Coverage now includes startup and seed files, unlike the historical loaded-file-only report, so percentages are not directly comparable. Live checks exercise the actual backend and disk-backed MongoDB, including shutdown/restart persistence. Browser checks cover real registration, purchase, admin changes, and screenshots.

Jest coverage does not include subprocess coverage from the live script. Frontend coverage is unmeasured. Remaining assessment questions are the absent original specification, safe complete chat-export requirements, attribution convention, and later repository publication with owner approval.

## AI disclosure

Historical logs identify Antigravity; existing commits retain its attribution. Codex performed the October 25 audit/remediation and verification. Exact historical model identity is not independently verified. Explain what you personally reviewed and learned in your own words; the documentation deliberately does not invent that experience.
