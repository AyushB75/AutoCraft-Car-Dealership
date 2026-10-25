# Screenshot provenance

## Current evidence

All files in `verified/` were captured by Chromium through Playwright on October 25, 2026. Application captures use React/Vite at loopback port 5175, the normal Express entrypoint at port 5055, and real MongoDB 7.0.24 at port 27028 with a disk data directory. The verification script generated its own accounts and never used private owner credentials. No API responses were mocked and no screenshots were synthesized or composited.

| File | Actual captured state |
|---|---|
| 01_dashboard.png | Ten database-backed vehicles, including sold-out Corvette |
| 02_search_filter.png | SUV filter: two matching vehicles out of ten |
| 03_login.png | Empty login dialog |
| 04_registration.png | Empty registration dialog |
| 05_purchase_stock_change.png | Actual purchase notification and Toyota stock reduced from eight to seven |
| 06_admin_inventory.png | Authenticated administrator inventory controls |
| 07_admin_add.png | Filled vehicle form immediately before actual creation |
| 08_admin_edit.png | Updated model in edit form before save |
| 09_admin_restock.png | Restock form requesting three more units |
| 10_restock_success.png | Actual successful restock, resulting stock five |
| 11_admin_delete.png | Delete confirmation; actual deletion followed in the same run |
| 12_mobile.png | Real application at 390 × 844 viewport |
| 13_backend_test_output.png | Browser displaying the saved actual backend coverage/test command output; not a fresh test execution or terminal-window screenshot |
| 14_frontend_test_output.png | Browser displaying the saved actual frontend test command output; not a fresh test execution or terminal-window screenshot |

The machine-readable check list is [live-verification.json](../evidence/live-verification.json). The script is [verify-live.mjs](../scripts/verify-live.mjs). These images demonstrate the captured states; passing API and browser assertions are recorded separately.

## Historical evidence retained

`01_inventory_dashboard.png` in this directory (outside `verified/`) is the original October 24 screenshot. The preserved session transcript shows it came from the non-persistent mock server. It is retained unchanged and is not used to prove real authentication, persistence, or completed admin operations.
