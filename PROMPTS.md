# AI Interaction Prompts & Raw Session Records

This document contains the raw, unedited prompts provided during the Incubyte Software Craftsman Internship assessment for the Car Dealership Inventory System.

Session Conversation ID: `25a346cf-3b33-433a-9dfa-65fd3e9d0ca0`
System Transcript Source: `C:\Users\HP\.gemini\antigravity\brain\25a346cf-3b33-433a-9dfa-65fd3e9d0ca0\.system_generated\logs\transcript.jsonl`

---

## Prompt 1: Initial Master Assessment Prompt
**Timestamp**: 2026-10-24T12:35:19Z (Local: 18:05:19+05:30)

```markdown
# MASTER PROMPT — Incubyte Software Craftsman Internship Assessment

Act as my senior software engineer, technical architect, TDD coach, code reviewer, and implementation partner. Help me build a complete, professional, working Car Dealership Inventory System from scratch for my Incubyte Software Craftsman Internship assessment.

I am starting with no project code. I need a working application, maintainable architecture, meaningful automated tests, a genuine TDD workflow, Git history, documentation, and every required submission artifact.

## 1. Source of truth

Follow the attached document titled “TDD Kata: Car Dealership Inventory System” as the primary specification.

Do not silently omit, weaken, or replace any mandatory requirement. If a design decision is not specified, choose a sensible, simple, secure implementation and document the decision.

Before coding:
1. Extract all functional requirements, technical constraints, deliverables, and evaluation expectations from the assessment.
2. Convert them into a requirements checklist.
3. Identify ambiguities and state your assumptions.
4. Create an implementation plan with milestones and acceptance criteria.
5. Identify dependencies and the minimum viable sequence for completing the project.

## 2. Technology stack

Use the following stack unless a genuine environment limitation requires a documented alternative:

- Frontend: React, Vite, JavaScript, HTML5, CSS3 and Tailwind CSS.
- Backend: Node.js, Express and JavaScript using ES modules.
- Database: MongoDB with Mongoose. Use a real persistent database, never an in-memory database as the application's primary database.
- Authentication: JWT and securely hashed passwords using bcrypt or bcryptjs.
- Backend testing: Jest and Supertest, configured correctly for the selected module system.
- Frontend testing: Vitest and React Testing Library where practical.
- Version control: Git, with meaningful incremental commits.
- API communication: REST/JSON.

Use stable, mutually compatible package versions. Avoid unnecessary libraries and overly complicated architecture.

If MongoDB is unavailable, stop and explain the options before switching databases. Do not silently substitute an in-memory database.

## 3. Required application functionality

### Authentication
- Register a user with name, email and password.
- Prevent duplicate email registration.
- Hash passwords securely; never store plaintext passwords.
- Authenticate users and issue JWTs.
- Validate tokens on protected routes.
- Implement user and admin roles.
- Enforce authorization on the backend, not just by hiding frontend buttons.
- Provide sensible validation and error responses.
- Do not provide an insecure public admin-registration mechanism. Explain how to create the first admin safely through a documented local setup or seed procedure.

### Vehicle inventory
Every vehicle must have a unique ID, make, model, category, price and quantity in stock.

Implement:
- POST /api/vehicles — add a vehicle.
- GET /api/vehicles — list available vehicles.
- GET /api/vehicles/search — search by make, model, category and price range.
- PUT /api/vehicles/:id — update vehicle details.
- DELETE /api/vehicles/:id — admin-only deletion.
- POST /api/vehicles/:id/purchase — purchase a vehicle and decrease its quantity.
- POST /api/vehicles/:id/restock — admin-only restocking.

Also implement:
- POST /api/auth/register
- POST /api/auth/login

Use consistent status codes, response formats, validation and error handling.

### Inventory business rules
- Prices cannot be negative.
- Stock quantities must be non-negative integers.
- A purchase must fail when stock is zero.
- Stock must never become negative, including under concurrent purchase attempts. Use an atomic database update or another appropriate concurrency-safe approach.
- A successful purchase decreases stock exactly once.
- Failed purchases leave inventory unchanged.
- Restocking increases stock correctly and is restricted to admins.
- Invalid IDs, missing vehicles, invalid inputs, duplicate emails and unauthorized operations must be handled cleanly.
- Do not expose password hashes, JWT secrets or sensitive internal error details.

Document any assumptions about whether registration is public, whether a purchase represents an immediate sale, and whether deleting a vehicle with stock is permitted.

## 4. Frontend requirements

Build a polished, responsive single-page application using React and Tailwind CSS.

Include:
- Login and registration screens.
- A vehicle inventory dashboard.
- Vehicle cards showing make, model, category, price and stock.
- Search and filtering controls for make, model, category and price range.
- A purchase button for each vehicle.
- A disabled purchase button when stock is zero.
- Clear loading, success, empty and error states.
- Admin-only forms or interfaces to add, update, delete and restock vehicles.
- Authentication-aware navigation and appropriate handling of expired sessions.
- Responsive layouts for desktop and mobile.
- Accessible form labels, buttons, focus states and useful validation messages.

Use a consistent visual design system, thoughtful spacing, typography, restrained colors and reusable components. Do not sacrifice functionality or testing for animations or visual effects.

Connect the UI to the real backend. Do not simulate successful API operations using hardcoded data. Demo seed vehicles may be provided, but all inventory operations must use the database.

## 5. Mandatory Test-Driven Development

This assessment explicitly evaluates TDD. Do not build the implementation first and add superficial tests afterward.

Follow this cycle for each feature:

1. RED: write a meaningful test for the next behavior and run it to verify that it fails for the expected reason.
2. GREEN: implement the smallest reasonable change to make the test pass.
3. REFACTOR: improve the implementation while keeping the tests green.
4. Commit the verified change with a descriptive Git commit message.

Begin with domain and service tests where useful, then test API integration and authorization. Add frontend tests for important interactions.

At minimum, test:
- Successful registration.
- Duplicate email rejection.
- Password hashing.
- Successful login and invalid credentials.
- Missing, malformed and expired JWT handling where practical.
- Protected routes.
- Admin-only authorization.
- Vehicle creation, listing and updating.
- Search by every supported criterion and combinations of filters.
- Invalid price, quantity and vehicle ID.
- Successful purchase.
- Purchase when stock is zero.
- Concurrent attempts to purchase the last vehicle.
- Successful restocking and unauthorized restocking.
- Admin deletion and unauthorized deletion.
- Frontend purchase-button disabled state at zero stock.
- Frontend loading, error and relevant form-validation states.

Use an isolated test database or safe test setup. Clean up test data and close database connections. Do not run destructive tests against a real production database.

Never claim a test passes unless you have actually executed it and observed the result. Distinguish tests written, tests executed and tests passing.

## 6. Clean architecture and engineering quality

Keep responsibilities separated. Use a practical structure such as:

backend/
  src/
    config/
    models/
    routes/
    controllers/
    services/
    middleware/
    validators/
    app.js
    server.js
  tests/

frontend/
  src/
    components/
    pages/
    services/
    hooks/
    App.jsx
    main.jsx

You may adjust this structure when justified, but keep the code understandable.

Requirements:
- Avoid giant components and monolithic controllers.
- Use clear names and reusable validation.
- Keep business logic testable.
- Use environment variables for secrets and configuration.
- Add a complete .env.example containing placeholders only.
- Add .gitignore entries for secrets, dependencies, build artifacts, coverage output and local environment files.
- Add appropriate CORS configuration.
- Use reasonable security defaults and avoid logging credentials or tokens.
- Include request validation and centralized error handling.
- Avoid unnecessary abstractions, duplicated code and overengineering.

## 7. Git workflow and AI co-authorship

Initialize a Git repository and make small, meaningful commits as development progresses.

Examples of commit subjects:
- test: cover registration validation
- feat: implement user registration
- test: cover vehicle purchase stock rules
- feat: implement atomic vehicle purchase
- feat: add vehicle search interface
- docs: document local setup and AI usage

Follow the assessment's exact AI co-authorship convention for every commit where AI contributed: add two blank lines followed by a Co-authored-by trailer.

Use the real identity and attribution details required by the assessment or the AI provider. Do not invent an official AI email address or claim a tool contributed to a commit when it did not. If the correct identity is unclear, ask me to verify it.

Do not fabricate commit history, test results, manual work, or development steps. Preserve a genuine progression of work.

## 8. Required deliverables

Create and verify all of the following:

### A. Public Git repository
- A clean repository containing all required source files.
- No committed secrets, .env files, credentials, tokens or private user data.
- A meaningful commit history.
- Confirm public access only after checking the actual repository state.

If you cannot access GitHub directly, provide the exact commands for me to publish the repository. Never claim to have pushed or published anything unless the operation succeeded.

### B. README.md
Include:
- Project overview and purpose.
- Main features.
- Architecture and technology stack.
- Folder structure.
- Prerequisites.
- Environment-variable configuration.
- Database setup.
- Backend installation and run instructions.
- Frontend installation and run instructions.
- How to run backend and frontend tests.
- API endpoint documentation and example requests.
- Admin setup or seed instructions.
- Screenshots of the actual working application.
- Known limitations, if any.
- A detailed section titled exactly My AI Usage.

In My AI Usage, truthfully identify the AI tools used, how they contributed, what I reviewed or changed, and how AI affected my workflow. Do not invent personal experiences; ask me for any missing information.

### C. Test report
Create a report such as TEST_REPORT.md containing:
- Test framework and environment.
- Test commands.
- Test cases and their purpose.
- Actual execution results.
- Pass/fail counts when available.
- Known failures and limitations.
- Coverage results when measured.

Do not fabricate test counts or coverage percentages.

### D. PROMPTS.md
Create a root-level PROMPTS.md containing raw, unedited AI chat logs or genuine public chat links, as explicitly required by the assessment.

Do not replace raw logs with AI-generated summaries or reconstructed conversations. If you cannot retrieve a complete conversation transcript, tell me what needs to be exported or copied manually. Clearly distinguish actual transcripts from any separate notes.

### E. Screenshots
Capture genuine screenshots of the completed application, including:
- Inventory dashboard.
- Search/filter functionality.
- Authentication screens.
- Admin controls.
- A purchase or stock update.
- Test results where appropriate.

Use real application output, not mockups presented as proof of functionality.

### F. Optional deployment
Only attempt deployment after the required local functionality, tests and documentation are working. Deployment is optional and must not endanger completion of mandatory deliverables.

## 9. AI transparency and interview readiness

I must understand the project well enough to discuss it in an interview.

For significant design decisions, explain briefly:
- What was chosen.
- Why it was chosen.
- What alternatives exist.
- What trade-offs matter.
- What security and testing implications exist.

At the end, prepare a concise interview-preparation document covering:
- Application architecture and request flow.
- JWT authentication and authorization.
- MongoDB models and persistence.
- TDD red-green-refactor.
- Atomic inventory updates and race conditions.
- API design and validation.
- Test strategy and coverage limitations.
- AI tools used and how their output was verified.
- Major bugs encountered and how they were resolved.

Do not add excessive explanatory text while implementing. Prioritize working code, focused explanations and verification.

## 10. Execution protocol — IMPORTANT

Work directly in my project workspace if you have terminal and filesystem tools. If you lack access, generate the necessary files and give me commands to create and run them.

Do not just return a long code sample or a plan and claim the project is finished.

Work in milestones:

Milestone 1 — Inspection and setup
- Inspect the environment and existing files.
- Check Node.js, npm, Git and available database access.
- Present the requirements checklist, architecture, initial plan and dependency risks.
- Initialize the project and Git.
- Install compatible dependencies.
- Confirm both applications can start.

Milestone 2 — Backend TDD
- Implement backend configuration, database connection, models, validation, authentication and authorization.
- Write and execute tests before implementing each feature.
- Implement every required vehicle endpoint.
- Verify stock and concurrency rules.
- Commit verified increments.

Milestone 3 — Frontend
- Build the responsive React + Tailwind interface.
- Connect all required screens and actions to the real backend.
- Add relevant component tests.
- Verify role-based UI behavior and error states.

Milestone 4 — Full verification
- Run all available backend and frontend tests.
- Fix regressions.
- Verify local setup from documented instructions.
- Check environment variables and repository cleanliness.
- Produce the actual test report.

Milestone 5 — Submission artifacts
- Complete README.md, My AI Usage, PROMPTS.md, screenshots and interview notes.
- Check all assessment deliverables.
- Provide a final status report showing what is complete, what was actually tested, any remaining limitations, and the exact steps I must perform manually.

### Rules for every milestone
1. Start by explaining the immediate goal and acceptance criteria.
2. Implement a small, coherent batch of work.
3. Inspect the resulting files and run relevant commands.
4. Report actual command results and errors.
5. Fix failures before claiming success.
6. Commit only verified, meaningful increments.
7. Keep an up-to-date checklist of completed and outstanding requirements.
8. Never silently skip a required feature.
9. Never invent execution results, commits, screenshots, links or publication status.
10. If blocked, explain the blocker and the fastest safe workaround.
11. Do not wait for my approval after every trivial file change. Proceed independently on routine implementation decisions, but ask me when a decision requires credentials, an external account, a destructive operation or an important unresolved choice.
12. Because time is limited, implement the highest-priority mandatory functionality first. Defer optional polish and deployment until the mandatory requirements are satisfied.

## Your first response

Start with Milestone 1. Inspect the workspace and available tools, then give me:
- A short requirements checklist.
- The chosen architecture.
- The first commands you intend to run.
- Any blockers that require my input.

Then begin implementing the project. Do not stop after writing a plan. Continue milestone by milestone until the project is genuinely ready for submission, or clearly identify any remaining manual steps.
```

---

## Prompt 2: Direction to Begin Milestone 1
**Timestamp**: 2026-10-24T12:44:51Z (Local: 18:14:51+05:30)

```markdown
Begin Milestone 1 now. Inspect my actual workspace and available terminal/database tools. Check Node.js, npm, Git, and MongoDB access. Do not assume a command succeeded without running it.

Create the project structure, initialize Git, configure the frontend and backend, install compatible dependencies, and create .gitignore and .env.example.

Before implementing business features, make sure the frontend and backend start successfully. Report the actual commands and results. Then begin backend TDD with the first registration test. Do not generate the entire application in one response.
```

---

## Prompt 3: Proceed Autonomously Across Milestones
**Timestamp**: 2026-10-24T13:03:11Z (Local: 18:33:11+05:30)

```markdown
Proceed. Do not stop to ask for approval after each small task. Continue implementing the complete assessment in my current workspace using strict RED-GREEN-REFACTOR TDD.

Complete authentication and validation first, then vehicle CRUD and search, admin-only deletion/restocking, purchase functionality with correct stock handling and zero-stock restrictions, and the complete responsive React frontend.

Add comprehensive backend integration tests and frontend tests. Run the tests, typechecks where configured, and production builds. Fix failures before proceeding.

Maintain clean, incremental Git commits with the required AI co-author attribution. Complete the README, exact required "My AI Usage" section, TEST_REPORT, PROMPTS.md, and required screenshots. Preserve genuine AI conversation logs; never fabricate transcripts, screenshots, test results, or commit history.

Before finishing, verify the actual assessment requirements against the implementation, run all available checks, inspect git status and commit history, and report what passed, what remains incomplete, and any blockers. Do not publish, deploy, or submit the project without my approval.
```
