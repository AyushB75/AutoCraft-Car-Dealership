# Comprehensive Test Report — Car Dealership Inventory System

## 1. Test Environment & Frameworks

### Backend Testing Harness
- **Test Runner & Assertion Framework**: Jest `v29.7.0` (with Node experimental VM modules for native ES Modules).
- **HTTP / API Integration**: Supertest `v7.0.0`.
- **Database Isolation**: `mongodb-memory-server` `v10.1.3`.
  - Every test run executes against an isolated, high-speed in-memory MongoDB instance.
  - Test suites wipe database collections in `afterEach()` hooks and cleanly disconnect/stop in `afterAll()`.
  - Production database is completely isolated and never exposed to destructive test executions.
- **Windows Environment Configuration**:
  - `beforeAll` hook in `tests/setup.js` is explicitly configured with a 60-second timeout (`beforeAll(async () => { ... }, 60000)`), preventing Jest's 5-second default hook timeout from interrupting initial Windows process spawning or download.
  - Jest `testTimeout` is configured to `30000` ms in `backend/package.json`.
- **Node.js Version**: `v24.14.0`.

### Frontend Testing Harness
- **Test Runner**: Vitest `v5.0.5`.
- **DOM Simulation**: `jsdom` `v29.1.1`.
- **UI Component Testing**: `@testing-library/react` `v16.3.3` with `@testing-library/jest-dom` `v7.0.1`.

---

## 2. Test Commands & How to Reproduce

### Run All Backend Tests
```bash
cd backend
npm test
```

### Run Backend Tests with Code Coverage
```bash
cd backend
npm run test:coverage
```

### Run Frontend Tests
```bash
cd frontend
npm test
```

---

## 3. Actual Test Execution Results

### Backend Test Results (Jest + Supertest)
```
PASS tests/integration/vehicles.test.js (27.668 s)
  Vehicles API - CRUD & Search
    POST /api/vehicles (Add vehicle)
      √ should allow admin to create a vehicle successfully (1451 ms)
      √ should reject non-admin users with 403 Forbidden (893 ms)
      √ should reject unauthenticated requests with 401 Unauthorized (726 ms)
      √ should reject vehicle with negative price with 400 Bad Request (749 ms)
      √ should reject vehicle with negative or non-integer quantity with 400 Bad Request (728 ms)
      √ should reject vehicle with missing required fields with 400 Bad Request (696 ms)
    GET /api/vehicles (List vehicles)
      √ should list all vehicles (751 ms)
    GET /api/vehicles/search (Search & Filtering)
      √ should filter by make (case-insensitive substring) (700 ms)
      √ should filter by model (case-insensitive substring) (844 ms)
      √ should filter by category (829 ms)
      √ should filter by price range (minPrice and maxPrice) (821 ms)
      √ should combine multiple search criteria (831 ms)
      √ should return empty list when no vehicles match criteria (837 ms)
    PUT /api/vehicles/:id (Update vehicle)
      √ should allow admin to update vehicle price and model (786 ms)
      √ should reject non-admin with 403 Forbidden (737 ms)
      √ should reject negative price update with 400 Bad Request (739 ms)
      √ should return 404 Not Found for non-existent vehicle ID (780 ms)
    DELETE /api/vehicles/:id (Delete vehicle)
      √ should allow admin to delete vehicle (746 ms)
      √ should reject non-admin with 403 Forbidden (744 ms)
      √ should return 404 Not Found for non-existent vehicle ID (779 ms)

PASS tests/integration/purchase_restock.test.js (10.515 s)
  Vehicles API - Purchase, Restock & Concurrency
    POST /api/vehicles/:id/purchase (Stock rules)
      √ should successfully purchase a vehicle when stock is available and decrease quantity by 1 (1030 ms)
      √ should reject purchase with 400 Bad Request when stock is zero and leave stock unchanged (797 ms)
      √ should reject unauthenticated purchase with 401 Unauthorized (728 ms)
      √ should return 404 for purchasing a non-existent vehicle ID (709 ms)
    Concurrency Safety - Simultaneous Purchase Attempts
      √ should handle concurrent purchase attempts atomically: exactly 1 succeeds on last vehicle, 9 fail, and stock never drops below 0 (1271 ms)
    POST /api/vehicles/:id/restock (Admin restocking)
      √ should allow admin to restock vehicle with valid positive integer quantity (716 ms)
      √ should reject non-admin users with 403 Forbidden (662 ms)
      √ should reject restock with zero, negative, or non-integer quantity with 400 Bad Request (831 ms)
      √ should return 404 for restocking a non-existent vehicle ID (817 ms)

PASS tests/integration/auth.test.js (10.056 s)
  Auth API - User Registration
    √ should register a new user successfully, return a token and sanitized user, and hash the password in the database (530 ms)
    √ should reject registration with 409 Conflict if email is already registered (286 ms)
    √ should reject registration with 400 Bad Request when required fields are missing or invalid (413 ms)
  Auth API - User Login
    √ should authenticate user and return token and user profile on valid credentials (656 ms)
    √ should reject login with 401 Unauthorized for invalid password (517 ms)
    √ should reject login with 401 Unauthorized for non-existent email (334 ms)
    √ should reject login with 400 Bad Request for missing credentials (533 ms)
  Auth Middleware & Protected Routes
    √ should return current user profile on GET /api/auth/me with valid Bearer token (890 ms)
    √ should reject GET /api/auth/me with 401 Unauthorized when token is missing (938 ms)
    √ should reject GET /api/auth/me with 401 Unauthorized when token is invalid or malformed (998 ms)

Test Suites: 3 passed, 3 total
Tests:       39 passed, 39 total
Snapshots:   0 total
Time:        48.688 s
```

---

### Backend Code Coverage (Jest)
```
-----------------------|---------|----------|---------|---------|----------------------------
File                   | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s          
-----------------------|---------|----------|---------|---------|----------------------------
All files              |   87.23 |    83.45 |   88.88 |      87 |                            
 src                   |   65.51 |    68.18 |      50 |   64.28 |                            
  app.js               |   65.51 |    68.18 |      50 |   64.28 | 17,26,38-39,41-43,45-46,50 
 src/controllers       |   88.88 |      100 |    90.9 |   88.88 |                            
  authController.js    |   95.65 |      100 |     100 |   95.65 | 48                         
  vehicleController.js |   85.71 |      100 |    87.5 |   85.71 | 34,43,59,64-68             
 src/middleware        |   94.44 |       90 |     100 |   94.44 |                            
  authMiddleware.js    |     100 |      100 |     100 |     100 |                            
  roleMiddleware.js    |   85.71 |       75 |     100 |   85.71 | 4                          
 src/models            |      96 |       50 |     100 |      96 |                            
  User.js              |   93.33 |       50 |     100 |   93.33 | 48                         
  Vehicle.js           |     100 |      100 |     100 |     100 |                            
 src/routes            |     100 |      100 |     100 |     100 |                            
  authRoutes.js        |     100 |      100 |     100 |     100 |                            
  vehicleRoutes.js     |     100 |      100 |     100 |     100 |                            
 src/services          |    87.2 |    82.66 |   92.85 |   86.77 |                            
  authService.js       |   84.21 |    83.33 |     100 |   84.21 | 41-43,67-69                
  vehicleService.js    |    88.5 |    82.45 |      90 |   87.95 | 46-52,63-66                
-----------------------|---------|----------|---------|---------|----------------------------
```

---

### Frontend Test Results (Vitest + React Testing Library)
```
 RUN  v5.0.5 C:/Users/HP/OneDrive/Desktop/car-dealership inventory ag/frontend

 ✓ src/tests/Alert.test.jsx (2 tests) 8ms
   ✓ Alert Component > renders message and triggers dismiss when close button clicked
   ✓ Alert Component > renders nothing when message is empty
 ✓ src/tests/VehicleCard.test.jsx (4 tests) 31ms
   ✓ VehicleCard Component > renders vehicle information, price, and in-stock badge properly
   ✓ VehicleCard Component > has an enabled purchase button when vehicle is in stock
   ✓ VehicleCard Component > strictly disables the purchase button and shows out-of-stock badge when quantity is zero
   ✓ VehicleCard Component > renders admin controls (Edit, Restock, Delete) only when isAdmin is true
 ✓ src/tests/FilterBar.test.jsx (3 tests) 16ms
   ✓ FilterBar Component > renders all filter input fields and category pills
   ✓ FilterBar Component > updates make filter when user types in the make input
   ✓ FilterBar Component > shows reset button when filters are active and triggers onReset when clicked

 Test Files  3 passed (3)
      Tests  9 passed (9)
   Start at  18:50:40
   Duration  10.39s
```

---

## 4. Key Verification Findings

1. **Atomic Concurrency Guarantee**:
   The concurrency test (`tests/integration/purchase_restock.test.js` line 102) dispatched 10 simultaneous HTTP POST purchase requests via `Promise.all` targeting a vehicle with initial `quantity: 1`.
   - **Result**: Exactly 1 request received HTTP 200 (Success).
   - The remaining 9 requests received HTTP 400 (Out of stock).
   - In-database quantity verified at exactly `0` (never negative).

2. **Zero-Stock Restrictions**:
   Both backend (`POST /api/vehicles/:id/purchase`) and frontend (`VehicleCard.jsx`) strictly prevent zero-stock purchases. The frontend marks the button with `disabled` attribute, `aria-disabled="true"`, and applies `cursor-not-allowed` styling.

3. **Role Authorization**:
   Endpoints `POST /api/vehicles`, `PUT /api/vehicles/:id`, `DELETE /api/vehicles/:id`, and `POST /api/vehicles/:id/restock` strictly require role `admin`. Non-admin customers receive `403 Forbidden`.
