export function badRequest(message) {
  return Object.assign(new Error(message), { statusCode: 400 });
}

export function text(value, field, min = 1, max = 120) {
  if (typeof value !== 'string' || value.trim().length < min || value.trim().length > max) {
    throw badRequest(`${field} must be text between ${min} and ${max} characters.`);
  }
  return value.trim();
}

export function number(value, field, integer = false) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || (integer && !Number.isSafeInteger(value))) {
    throw badRequest(`${field} must be a non-negative ${integer ? 'safe integer' : 'number'}.`);
  }
  return value;
}

export function vehicleInput(body, partial = false) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw badRequest('Vehicle data must be an object.');
  const allowed = ['make', 'model', 'category', 'price', 'quantity'];
  if (Object.keys(body).some(key => !allowed.includes(key))) throw badRequest('Unknown vehicle field.');
  if (partial && !Object.keys(body).length) throw badRequest('Provide at least one vehicle field.');
  const result = {};
  for (const key of allowed) {
    if (partial && body[key] === undefined) continue;
    result[key] = ['price', 'quantity'].includes(key) ? number(body[key], key, key === 'quantity') : text(body[key], key);
  }
  return result;
}

export function authInput(body, registration = false) {
  const email = text(body?.email, 'Email', 3, 254).toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) throw badRequest('Please provide a valid email address.');
  const password = body?.password;
  if (typeof password !== 'string' || password.length < (registration ? 6 : 1) || Buffer.byteLength(password) > 72) {
    throw badRequest('Password must be text, at least 6 characters for registration, and at most 72 bytes.');
  }
  return { email, password, ...(registration && { name: text(body.name, 'Name', 2) }) };
}

export const escapeRegex = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
