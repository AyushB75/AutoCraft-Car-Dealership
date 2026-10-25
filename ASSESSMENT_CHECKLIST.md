# Assessment completion checklist

Basis: the requirements recorded in `PROMPTS.md`, not an independently retrieved original Incubyte attachment. The original assessment specification is absent from this workspace.

| Requirement from recorded prompt | Current evidence/status |
|---|---|
| Preserve existing project/history | Existing architecture and 15 commits retained; pre-change ZIP includes private files and uncommitted work |
| Persistent database | Real disk-backed MongoDB verified, including restart persistence |
| Registration/login/hash storage/JWT | Implemented; backend and live API/browser checks |
| Customer/admin authorization | Backend route checks and negative tests; admin seed requires explicit credentials |
| Vehicle CRUD/search | Implemented and verified via tests and real HTTP/browser flows |
| Stock decrement/zero stock/concurrency/restock | Backend tests plus real concurrent HTTP verification |
| Responsive UI and accessibility basics | Dialog regression tests, browser flows, 390px screenshot and overflow check |
| TDD workflow | Four historical backend pairs; current regression RED/GREEN observations; universal strict TDD is not claimed |
| README and exact My AI Usage heading | Updated with setup, API examples, assumptions, limitations, and truthful AI disclosure |
| Test report | Actual saved command output and current scoped coverage; no fabricated results |
| Screenshots | Real-stack set under screenshots/verified; old mock screenshot clearly identified |
| PROMPTS/raw chat deliverable | Curated extract accurately labeled; original private raw transcript preserved; safe complete user-visible export/share link remains outstanding |
| Public repository | Not configured or published; intentionally not performed under owner safeguards |
| Deployment | Not performed; optional according to recorded prompt |
| Interview preparation | Updated to describe actual design, evidence, and limitations |

## External questions not verifiable without the original specification

- Exact endpoint access expectations (this project makes create/update/delete/restock admin-only and browsing public).
- Whether single-unit immediate sales and deletion with remaining stock meet the intended business rules.
- Exact screenshot/report formats, minimum test/coverage expectations, and whether deployment is optional in the original document.
- Required AI co-author identity/trailer formatting and acceptable chat-export format.
- Submission mechanism, public-repository visibility requirements, and deadline.

## Owner actions before submission

1. Supply/review the original assessment attachment and reconcile the questions above.
2. Review the uncommitted changes and privately rotate affected credentials before publication or external use: current private values match historical README revisions. Local .env files and all commits were deliberately preserved; no values were printed. Current publishable text files had no exact matches in the final private-value scan.
3. Export/review user-visible Antigravity and Codex conversations, or provide genuine links if accepted. Do not publish the private internal transcript or system/tool secrets blindly.
4. Only after review, explicitly approve commits and any later repository publication/submission. None of those actions has been performed.

The application is locally verified. Final assessment submission readiness is conditional on these external/documentation decisions; no claim of complete rubric compliance is made.
