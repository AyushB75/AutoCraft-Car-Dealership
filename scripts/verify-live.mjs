// Exercises the normal application with a dedicated disk-backed MongoDB process.
// Existing local .env files and databases are never modified. Credentials stay in memory.
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import assert from 'node:assert/strict';
import net from 'node:net';

const root = fileURLToPath(new URL('../', import.meta.url));
const require = createRequire(path.join(root, 'backend/package.json'));
const mongoose = require('mongoose');
const runId = new Date().toISOString().replace(/[:.]/g, '-');
const local = path.join(root, '.local-verification', runId);
const evidence = path.join(root, 'evidence');
const shots = path.join(root, 'screenshots', 'verified');
await Promise.all([mkdir(path.join(local, 'db'), { recursive: true }), mkdir(evidence, { recursive: true }), mkdir(shots, { recursive: true })]);
const secret = randomBytes(48).toString('hex');
const password = randomBytes(24).toString('base64url');
const uri = 'mongodb://127.0.0.1:27028/dealership_verification';
const base = 'http://127.0.0.1:5055/api';
const env = { ...process.env, NODE_ENV: 'development', PORT: '5055', MONGODB_URI: uri, JWT_SECRET: secret, JWT_EXPIRES_IN: '1h', CLIENT_URL: 'http://127.0.0.1:5175', INITIAL_ADMIN_EMAIL: 'admin@verification.example', INITIAL_ADMIN_NAME: 'Verification Admin', INITIAL_ADMIN_PASSWORD: password, VITE_API_BASE_URL: base };
const mongod = process.env.MONGOD_BINARY || path.join(root, 'backend/node_modules/.cache/mongodb-memory-server/mongod-x64-win32-7.0.24.exe');
const results = [];
const record = name => { results.push({ check: name, passed: true }); console.log(`PASS ${name}`); };
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
let mongo, backend, frontend, browser;

async function freePort(port) {
  await new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', () => reject(new Error(`Verification port ${port} is already in use; no existing process was stopped.`)));
    server.listen(port, '127.0.0.1', () => server.close(resolve));
  });
}
function child(command, args, cwd) {
  const proc = spawn(command, args, { cwd, env, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
  // Do not persist child output: dependencies can include connection strings in errors.
  proc.stdout.resume(); proc.stderr.resume();
  proc.on('error', () => {});
  return proc;
}
async function command(script) {
  const proc = child(process.execPath, [script], path.join(root, 'backend'));
  await new Promise((resolve, reject) => {
    proc.once('error', () => reject(new Error('Verification subprocess could not start.')));
    proc.once('exit', code => code === 0 ? resolve() : reject(new Error(`Verification subprocess failed: ${path.basename(script)}`)));
  });
}
async function waitUntil(test, label) {
  for (let attempt = 0; attempt < 100; attempt++) {
    try { if (await test()) return; } catch { /* retry startup only */ }
    await delay(300);
  }
  throw new Error(`Timed out waiting for ${label}`);
}
async function api(route, method = 'GET', body, token, expected = 200) {
  const response = await fetch(base + route, { method, headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) }, ...(body !== undefined && { body: JSON.stringify(body) }) });
  assert.equal(response.status, expected, `${method} ${route}: unexpected HTTP status`);
  return response.json();
}
function startMongo() {
  return child(mongod, ['--dbpath', path.join(local, 'db'), '--port', '27028', '--bind_ip', '127.0.0.1', '--logpath', path.join(local, 'mongodb.log'), '--logappend'], root);
}
async function stopMongo() {
  if (!mongo || mongo.exitCode !== null) return;
  const connection = await mongoose.createConnection(uri, { serverSelectionTimeoutMS: 2000 }).asPromise();
  try { await connection.db.admin().command({ shutdown: 1 }); } catch { /* server closes connection on shutdown */ }
  await connection.close().catch(() => {});
  await waitUntil(() => mongo.exitCode !== null, 'MongoDB shutdown');
}
async function screenshot(page, filename) {
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  const fullPage = page.viewportSize().width > 600 && await page.getByRole('dialog').count() === 0;
  await page.screenshot({ path: path.join(shots, filename), fullPage });
  record(`Screenshot ${filename}`);
}

try {
  for (const port of [27028, 5055, 5175]) await freePort(port);
  mongo = startMongo();
  await waitUntil(async () => {
    const connection = await mongoose.createConnection(uri, { serverSelectionTimeoutMS: 500 }).asPromise();
    await connection.close(); return true;
  }, 'disk-backed MongoDB');
  await command('src/scripts/seedAdmin.js');
  backend = child(process.execPath, ['src/server.js'], path.join(root, 'backend'));
  await waitUntil(async () => (await fetch(base + '/health')).status === 200, 'normal backend');
  record('Normal backend startup and database readiness');
  const admin = await api('/auth/login', 'POST', { email: env.INITIAL_ADMIN_EMAIL, password });
  const customer = await api('/auth/register', 'POST', { name: 'Verification Customer', email: 'customer@verification.example', password, role: 'admin' }, null, 201);
  assert.equal(customer.user.role, 'user');
  await api('/auth/login', 'POST', { email: customer.user.email, password });
  await api('/auth/me', 'GET', undefined, customer.token);
  await api('/auth/login', 'POST', { email: customer.user.email, password: 'deliberately-wrong' }, null, 401);
  record('Real registration, login, profile, and invalid credentials');
  const input = { make: 'Verification', model: 'Car [A]', category: 'SUV', price: 25000, quantity: 2 };
  await api('/vehicles', 'POST', input, null, 401);
  await api('/vehicles', 'POST', input, customer.token, 403);
  const { vehicle } = await api('/vehicles', 'POST', input, admin.token, 201);
  await api(`/vehicles/${vehicle.id}`, 'GET');
  await api(`/vehicles/${vehicle.id}`, 'PUT', { price: 26000 }, admin.token);
  const filtered = await api('/vehicles/search?model=%5BA%5D&category=SUV&minPrice=25000&maxPrice=27000');
  assert.equal(filtered.vehicles.length, 1);
  record('Admin creation/update, detail lookup, literal search, and role protection');
  const purchased = await api(`/vehicles/${vehicle.id}/purchase`, 'POST', undefined, customer.token);
  assert.equal(purchased.vehicle.quantity, 1);
  const attempts = await Promise.all(Array.from({ length: 10 }, () => fetch(`${base}/vehicles/${vehicle.id}/purchase`, { method: 'POST', headers: { Authorization: `Bearer ${customer.token}` } })));
  assert.equal(attempts.filter(r => r.status === 200).length, 1);
  assert.equal(attempts.filter(r => r.status === 400).length, 9);
  await api(`/vehicles/${vehicle.id}/purchase`, 'POST', undefined, customer.token, 400);
  assert.equal((await api(`/vehicles/${vehicle.id}`)).vehicle.quantity, 0);
  record('Purchase decrement, zero-stock rejection, and 10-way concurrency');
  await api(`/vehicles/${vehicle.id}/restock`, 'POST', { quantity: 3 }, customer.token, 403);
  assert.equal((await api(`/vehicles/${vehicle.id}/restock`, 'POST', { quantity: 3 }, admin.token)).vehicle.quantity, 3);
  await api(`/vehicles/${vehicle.id}`, 'DELETE', undefined, customer.token, 403);
  record('Admin restocking and customer restock/delete denial');
  await stopMongo();
  await waitUntil(async () => (await fetch(base + '/health')).status === 503, 'unavailable health');
  record('Live database loss returns HTTP 503');
  mongo = startMongo();
  await waitUntil(async () => (await fetch(base + '/health')).status === 200, 'database reconnection');
  assert.equal((await api(`/vehicles/${vehicle.id}`)).vehicle.quantity, 3);
  await api('/auth/login', 'POST', { email: customer.user.email, password });
  record('Disk persistence across MongoDB shutdown/restart (stock and user login)');
  await api(`/vehicles/${vehicle.id}`, 'DELETE', undefined, admin.token);
  await api(`/vehicles/${vehicle.id}`, 'GET', undefined, null, 404);
  record('Admin deletion and subsequent 404');
  await command('src/scripts/seedVehicles.js');

  if (!process.argv.includes('--api-only')) {
    const playwrightPath = process.env.PLAYWRIGHT_MODULE || 'playwright';
    const { chromium } = require(playwrightPath);
    frontend = child(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '5175', '--strictPort'], path.join(root, 'frontend'));
    await waitUntil(async () => (await fetch('http://127.0.0.1:5175')).ok, 'frontend');
    browser = await chromium.launch({ channel: 'chrome', headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on('pageerror', () => errors.push('Browser runtime error'));
    await page.goto('http://127.0.0.1:5175');
    await page.getByText('Toyota Camry Hybrid', { exact: true }).waitFor();
    await screenshot(page, '01_dashboard.png');
    await page.getByRole('button', { name: 'SUV', exact: true }).click();
    await page.getByText('Showing 2 of 10', { exact: false }).waitFor();
    await screenshot(page, '02_search_filter.png');
    await page.getByRole('button', { name: 'Reset', exact: true }).click();
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();
    await screenshot(page, '03_login.png');
    await page.getByRole('dialog').getByRole('button', { name: 'Register', exact: true }).click();
    await screenshot(page, '04_registration.png');
    await page.getByLabel('Full Name').fill('Browser Customer');
    await page.getByLabel('Email Address').fill('browser@verification.example');
    await page.getByLabel('Password', { exact: true }).fill(password);
    await page.getByRole('button', { name: 'Create Account', exact: true }).click();
    await page.getByRole('dialog').waitFor({ state: 'hidden' });
    const toyota = page.locator('article').filter({ hasText: 'Toyota Camry Hybrid' });
    await toyota.getByRole('button', { name: 'Purchase Vehicle', exact: true }).click();
    await page.getByRole('alert').filter({ hasText: 'Remaining stock: 7' }).waitFor();
    await screenshot(page, '05_purchase_stock_change.png');
    const soldOut = page.locator('article').filter({ hasText: 'Chevrolet Corvette Stingray' });
    assert.equal(await soldOut.getByRole('button', { name: 'Sold Out' }).isDisabled(), true);
    record('Browser registration, authenticated purchase, and disabled zero-stock button');
    await page.getByRole('button', { name: 'Log out', exact: true }).click();
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();
    await page.getByLabel('Email Address').fill(env.INITIAL_ADMIN_EMAIL);
    await page.getByLabel('Password', { exact: true }).fill(password);
    await page.getByRole('dialog').getByRole('button', { name: 'Sign In', exact: true }).last().click();
    await page.getByRole('dialog').waitFor({ state: 'hidden' });
    await screenshot(page, '06_admin_inventory.png');
    await page.getByRole('button', { name: 'Add new vehicle to inventory' }).click();
    await page.getByRole('dialog').getByLabel('Make', { exact: true }).fill('Assessment');
    await page.getByRole('dialog').getByLabel('Model', { exact: true }).fill('Browser Car');
    await page.getByRole('dialog').getByLabel('Price', { exact: false }).fill('30000');
    await page.getByLabel('Initial Stock Quantity').fill('2');
    await screenshot(page, '07_admin_add.png');
    await page.getByRole('button', { name: 'Create Vehicle', exact: true }).click();
    await page.getByText('Assessment Browser Car', { exact: true }).waitFor();
    let card = page.locator('article').filter({ hasText: 'Assessment Browser Car' });
    await card.getByRole('button', { name: 'Edit', exact: true }).click();
    await page.getByRole('dialog').getByLabel('Model', { exact: true }).fill('Updated Car');
    await screenshot(page, '08_admin_edit.png');
    await page.getByRole('button', { name: 'Save Changes' }).click();
    await page.getByText('Assessment Updated Car', { exact: true }).waitFor();
    card = page.locator('article').filter({ hasText: 'Assessment Updated Car' });
    await card.getByRole('button', { name: 'Restock', exact: true }).click();
    await page.getByLabel('Quantity to Add (Positive Integer)').fill('3');
    await screenshot(page, '09_admin_restock.png');
    await page.getByRole('button', { name: 'Restock Inventory', exact: true }).click();
    await page.getByRole('alert').filter({ hasText: 'Current stock: 5' }).waitFor();
    await screenshot(page, '10_restock_success.png');
    await card.getByRole('button', { name: 'Delete Assessment Updated Car' }).click();
    await screenshot(page, '11_admin_delete.png');
    await page.getByRole('button', { name: 'Confirm Deletion' }).click();
    await page.getByText('Assessment Updated Car', { exact: true }).waitFor({ state: 'hidden' });
    record('Browser admin add, edit, restock, and delete');
    await page.getByRole('button', { name: 'Log out', exact: true }).click();
    await page.setViewportSize({ width: 390, height: 844 });
    await screenshot(page, '12_mobile.png');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, 'Mobile horizontal overflow');
    assert.equal(errors.length, 0, 'Browser runtime errors');
    record('Mobile viewport has no horizontal overflow; no browser runtime errors');
    await page.setViewportSize({ width: 1440, height: 1000 });
    for (const [log, shot] of [['backend-coverage.txt', '13_backend_test_output.png'], ['frontend-tests.txt', '14_frontend_test_output.png']]) {
      await page.goto(pathToFileURL(path.join(evidence, log)).href);
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.screenshot({ path: path.join(shots, shot) });
      record(`Screenshot ${shot} (browser display of actual saved command output)`);
    }
  }
} catch (error) {
  // Assertions never include credentials or tokens in their messages.
  console.error(`FAIL ${error.message.split('\n')[0]}`);
  results.push({ check: error.message.split('\n')[0], passed: false });
  process.exitCode = 1;
} finally {
  await browser?.close();
  if (frontend && frontend.exitCode === null) frontend.kill();
  if (backend && backend.exitCode === null) backend.kill();
  try { await stopMongo(); } catch { if (mongo && mongo.exitCode === null) mongo.kill(); }
  await writeFile(path.join(evidence, 'live-verification.json'), JSON.stringify({ date: new Date().toISOString(), database: 'Dedicated disk-backed MongoDB 7.0.24; normal src/server.js; no mock routes', results }, null, 2) + '\n');
}
