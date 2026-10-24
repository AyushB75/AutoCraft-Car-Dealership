# Technical Interview Preparation Guide

## Car Dealership Inventory System — Incubyte Assessment

This guide prepares you to clearly, confidently, and technically explain every architecture decision, TDD step, concurrency design, and engineering choice made in this codebase during your interview.

---

### 1. Application Architecture & Request Flow

#### Architectural Style
Decoupled, client-server REST architecture:
- **Frontend**: Single Page Application (SPA) built with React 19, Vite, and Tailwind CSS. State is cleanly managed with context (`AuthContext`) and modular components (`Navbar`, `VehicleCard`, `FilterBar`, `AdminModal`, `Alert`).
- **Backend**: Layered architecture in Node.js / Express using modern ES modules (`"type": "module"`):
  - **Routes**: Define HTTP verbs, endpoints, and route middleware.
  - **Middleware**: Authentication (`authenticate`), Role Authorization (`requireRole`), and Centralized Error Handling.
  - **Controllers**: Handle HTTP request extraction, status codes, and call service functions.
  - **Services**: Pure business logic (e.g. atomic inventory decrement, token signing).
  - **Models**: Mongoose schemas enforcing schema-level constraints and database indexes.

#### Request Flow Walkthrough
1. **Client Action**: User clicks "Purchase Vehicle".
2. **Client Layer**: `api.purchaseVehicle(id)` attaches JWT in `Authorization: Bearer <token>` and dispatches `POST /api/vehicles/:id/purchase`.
3. **Network / CORS**: Express `cors` middleware validates origin.
4. **Auth Middleware**: `authenticate` extracts Bearer token, verifies JWT signature using `jwt.verify(token, JWT_SECRET)`, and attaches decoded payload (`{ id, email, role }`) to `req.user`.
5. **Controller Layer**: `vehicleController.purchaseVehicle` receives `req.params.id` and delegates to `vehicleService.purchaseVehicle`.
6. **Service & DB Layer**: Performs atomic check and decrement via MongoDB:
   `Vehicle.findOneAndUpdate({ _id: id, quantity: { $gt: 0 } }, { $inc: { quantity: -1 } }, { new: true })`.
7. **Response**: 200 OK returned with updated vehicle object. React UI receives response and decrements the vehicle's displayed stock count immediately.

---

### 2. JWT Authentication & Role-Based Access Control (RBAC)

#### Password Security
- Passwords are never stored in plaintext or logged.
- In `User.js`, a Mongoose `pre('save')` hook checks `if (!this.isModified('password')) return next();` and hashes passwords with `bcryptjs` using 10 salt rounds.
- Mongoose's `toJSON` transform automatically strips `password` and `__v`, ensuring password hashes are never leaked over the wire.

#### Role Authorization
- Roles are strictly defined in `User.js`: `enum: ['user', 'admin']`, defaulting to `'user'`.
- Authorization is strictly enforced on the server, not just by hiding UI buttons:
  ```javascript
  router.post('/', authenticate, requireRole('admin'), vehicleController.createVehicle);
  router.put('/:id', authenticate, requireRole('admin'), vehicleController.updateVehicle);
  router.delete('/:id', authenticate, requireRole('admin'), vehicleController.deleteVehicle);
  router.post('/:id/restock', authenticate, requireRole('admin'), vehicleController.restockVehicle);
  ```
- If a regular user tries to send a manual POST request to `/api/vehicles`, the `requireRole('admin')` middleware blocks the request and returns `403 Forbidden`.

#### Safe Admin Seeding
- To prevent insecure public registration of admin accounts, public registration (`POST /api/auth/register`) only creates standard customers (`role: 'user'`).
- The initial admin account is created safely via a documented CLI script (`npm run seed:admin`), reading administrator credentials from protected environment variables.

---

### 3. Concurrency Safety & Race Condition Prevention

#### The Problem: The "Last Item" Race Condition
If vehicle stock is 1, and two customers submit purchase requests at the exact same millisecond:
- **Naive approach (Read-then-Write)**:
  1. Request A reads `quantity = 1`.
  2. Request B reads `quantity = 1`.
  3. Request A writes `quantity = 1 - 1 = 0`.
  4. Request B writes `quantity = 1 - 1 = 0` (or negative stock `-1`!).
  *Result*: Overselling and inventory corruption.

#### The Solution: Atomic Conditional Decrement
We enforce concurrency safety at the database engine level using MongoDB's atomic document locking:
```javascript
const updatedVehicle = await Vehicle.findOneAndUpdate(
  { _id: id, quantity: { $gt: 0 } }, // Condition: stock MUST be > 0
  { $inc: { quantity: -1 } },        // Atomic decrement
  { new: true }
);
```
- MongoDB evaluates `{ quantity: { $gt: 0 } }` atomically during the update write lock.
- Only the first operation succeeds and decrements stock to 0.
- Subsequent parallel requests find no document matching `{ quantity: { $gt: 0 } }`, return `null`, and our service throws an out-of-stock error (`400 Bad Request`).
- Stock **never drops below 0**, even with 100 simultaneous requests.

#### Concurrency Verification in Jest
In `backend/tests/integration/purchase_restock.test.js`:
- Initial stock set to `1`.
- Fired 10 simultaneous HTTP requests via `Promise.all`.
- Verified that **exactly 1 succeeded (200)**, **9 failed (400)**, and final DB quantity was **0**.

---

### 4. Test-Driven Development (TDD) Workflow

#### The Red-Green-Refactor Progression
For every feature across the assessment:
1. **RED**: Wrote an integration test specifying expected behavior (e.g. `auth.test.js`, `vehicles.test.js`, `purchase_restock.test.js`) and ran `npm test` to verify that it failed for the exact expected reason (e.g. 404 route not found or validation error). Committed the failing test.
2. **GREEN**: Wrote the smallest possible code in models, services, controllers, and routes to satisfy the test. Re-ran `npm test` to verify 100% pass rate. Committed the working implementation.
3. **REFACTOR**: Improved modularity, cleaned input validation, and added edge case guards while ensuring test suite remained green.

#### Evidence in Git History
Every single feature is documented with twin commits:
- `ee80bf3 test: add failing registration test for user creation and password hashing`
- `f716ba5 feat: implement user registration with bcrypt password hashing and JWT issuance`
- `0aa5be2 test: add integration tests for auth validation, login, and protected routes`
- `7a0bdaf feat: implement user login, token verification, and error handling`
- `f8f146f test: add failing integration tests for vehicle CRUD, authorization, and search`
- `26e5351 feat: implement vehicle inventory model, CRUD endpoints, and multi-criteria search`
- `fcd6f65 test: add integration tests for vehicle purchase, concurrency rules, and restocking`
- `9a78e83 feat: implement atomic purchase, zero-stock restrictions, and admin restocking`

---

### 5. API Design & Validation Strategy

#### REST Conventions & Status Codes
- `200 OK`: Successful retrieval, update, purchase, restock.
- `201 Created`: Successful resource creation (user registration, vehicle added).
- `400 Bad Request`: Validation failure (negative price, non-integer quantity, missing fields, zero-stock purchase attempt).
- `401 Unauthorized`: Missing, expired, or invalid JWT; invalid login credentials.
- `403 Forbidden`: Authenticated user attempting an admin-restricted action.
- `404 Not Found`: Vehicle or resource does not exist.
- `409 Conflict`: Duplicate email registration attempt.
- `500 Internal Server Error`: Unhandled server exception (stack trace concealed in production).

---

### 6. AI Transparency & Verification

#### How AI was Used
- AI acted as a pair programmer, scaffolding initial directory layouts, formatting boilerplate tests, and validating regex patterns.
- Every piece of code generated was subjected to automated unit and integration tests.
- Commits reflect genuine co-authorship using the Git `Co-authored-by` trailer convention.
- Real execution commands were run in the local environment and output was logged without fabrication.
