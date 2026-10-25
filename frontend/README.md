# Frontend — AutoCraft

React/Vite single-page interface for the real dealership backend. See the [root README](../README.md) for setup, API assumptions, admin provisioning, test evidence, and assessment limitations.

## Local development

Use Node 24 (verified: 24.14.0). Run `npm ci`, configure `VITE_API_BASE_URL` in a private `.env` (example: `http://localhost:5000/api`), then `npm run dev`. The backend must use a matching `CLIENT_URL`. Vite exposes `VITE_*` values to the browser; never put secrets in them.

## Checks

- `npm test`: Vitest/Testing Library/jsdom tests.
- `npm run lint`: Oxlint checks; does not rewrite source.
- `npm run build`: production assets in `dist/`.
- `npm run preview`: local preview of a completed build.

## Behavior

`AuthContext` maintains the session; `services/api.js` attaches the token and signals expired sessions. `App.jsx` fetches inventory, ignores obsolete search responses, refetches active filters after admin changes, and displays total versus matching count. Dialogs use explicit labels, accessible names, focus containment, Escape handling, and focus restoration.

Totals use a separate full-catalog request, so this implementation favors simplicity over large-catalog scalability. No frontend coverage measurement or TypeScript typecheck is claimed. Tokens are in localStorage, and production hardening remains separate work.
