<<<<<<< HEAD
# Real estate intake app

Single-page React app with an Express API. Submissions are appended to your **Google Sheet** using **Google Apps Script** (no Google Cloud Console project or service account).

## How data reaches the sheet

1. Your **Express server** validates the form and sends a JSON `POST` to a **Web app URL** created from a script **bound to your spreadsheet**.
2. The script runs as **you** (after a one-time authorization inside Sheets) and calls `appendRow` on the `Sellers` or `Buyers` tab.
3. A **shared secret** (`APPS_SCRIPT_SECRET` / `WEBHOOK_SECRET`) stops random callers from writing to your sheet. The web app is deployed with **Who has access: Anyone** so your server can call it; security relies on the secret.

## Project layout

- `client/` — React (Vite) + Tailwind CSS
- `server/` — Express + validation + `fetch` to Apps Script
- `google-apps-script/Code.gs` — copy into the spreadsheet’s Apps Script editor

## Prerequisites

- Node.js 18+
- A Google Sheet with two worksheets named exactly **`Sellers`** and **`Buyers`**

### Sheet headers (row 1, recommended)

**Sellers** — columns A–I:

`Name` | `Phone` | `Location` | `I am submitting as` | `Type` | `Property Type` | `BHK` | `Size` | `Price`

**Buyers** — columns A–J:

`I am submitting as` | `Customer name` | `Phone` | `Preferred location` | `Requirement Type` | `Property Type` | `BHK` | `Size` | `Budget` | `Comments`

(`Size` is blank for house types; for **Land** use cent, e.g. `3 cent`; for **Shop** use square feet as a number.)

## Google Apps Script setup (no Cloud Console)

1. Open your spreadsheet.
2. **Extensions → Apps Script**.
3. Delete any default code, then paste the full contents of `google-apps-script/Code.gs`.
4. Click **Project Settings** (gear) → **Script properties** → **Add script property**:
   - Property: `WEBHOOK_SECRET`
   - Value: a long random string (same value you will put in `server/.env` as `APPS_SCRIPT_SECRET`).
5. **Save** the project (disk icon).
6. Run once: select any function is not required; first `doPost` will run on deploy. Optionally use **Run** on `doPost` — not applicable. Just **Deploy**:
7. **Deploy → New deployment** → type **Web app**:
   - **Execute as:** Me
   - **Who has access:** Anyone
8. **Deploy**, authorize when Google prompts (this is normal and is **not** the Cloud Console).
9. Copy the **Web app URL** (ends with `/exec`). Put it in `server/.env` as `GOOGLE_APPS_SCRIPT_WEBAPP_URL`.

If you change the script later, use **Deploy → Manage deployments** → **Edit** (version) → **Deploy** again so the live URL picks up changes.

### If submissions fail or you see “Could not parse response”

1. Open `http://localhost:3001/health/ready` — both `urlConfigured` and `secretConfigured` should be `true`, and `ready` should be `true`.
2. **Script property** must be named exactly `WEBHOOK_SECRET` (same value as `APPS_SCRIPT_SECRET` in `server/.env`).
3. Use the **Web app** URL that ends with `/exec` from **Deploy → Manage deployments** (not the script editor URL).
4. After any change to `Code.gs`, create a **new deployment version** and redeploy; old URLs can return HTML errors until you do.
5. Sheet tabs must be named exactly **`Sellers`** and **`Buyers`** (case-sensitive).

### HTTP 405 or HTML instead of JSON

- Use the **Deploy → Web app** URL that ends with **`/exec`**, not a **/dev** test URL and not the Script editor link.
- After changing `Code.gs`, open **Deploy → Manage deployments → ✏️ → New version → Deploy**.
- Opening the `/exec` URL in a browser should show a small **JSON** “Web app is live” message (the script includes `doGet`). If you see a Google Docs HTML page or 405, the URL or deployment is wrong.

### Buyer: Customer name / Phone / Preferred location missing in the sheet

1. **Redeploy Apps Script** after updating `Code.gs` (Manage deployments → New version → Deploy). Old deployments can parse the `payload` field incorrectly.
2. **Restart the Node server** (`server/`) so it runs the latest `validate.js` (buyer row must have **10** columns).
3. Hard-refresh the browser (Ctrl+Shift+R) so the React app sends `customerName`, `phone`, and `preferredLocation`.
4. In the **Buyers** tab, row 1 headers should match **A–J** in the README (column **H** = `Size` for Land/Shop). Add column **H** before **Budget** if you have an older 9-column layout.

### Row appears in the sheet but the form still shows an error

That usually meant the server **POSTed twice** on Google’s redirect chain; the first request saved the row, the second got **405** + HTML. The API now follows redirects the same way as a browser (**no second POST**). Restart the server after updating.

## Local development

### Server

```bash
cd server
copy .env.example .env
# Set GOOGLE_APPS_SCRIPT_WEBAPP_URL and APPS_SCRIPT_SECRET
npm install
npm run dev
```

API: `http://localhost:3001` (`GET /health`).

### Client

```bash
cd client
copy .env.example .env
npm install
npm run dev
```

App: `http://localhost:5173` (or `http://YOUR-LAN-IP:5173` on your phone on the same Wi‑Fi).

**Local API:** With `npm run dev` in `client/`, requests go to `/api/...` and Vite **proxies** them to `http://127.0.0.1:3001`. You do **not** need `VITE_API_URL` for that. Keep the server running on port **3001**.

**“Failed to fetch”:** Usually the server is not running, or you opened the built `index.html` from disk instead of the Vite dev server. Use `npm run dev` in both `server/` and `client/`.

For a **production** build, set `VITE_API_URL` to your deployed API origin before `npm run build`.

## API

- `POST /submit-seller` — JSON body (fields match the seller form).
- `POST /submit-buyer` — JSON includes `submittingAs`, `customerName`, `phone`, `preferredLocation`, `requirementType`, `propertyType`, `bhk` (residential), `landSize` (Land), `squareFeet` (Shop), `budget`, `comments`.

## Deployment notes

- **Frontend (e.g. Vercel):** `npm run build` in `client/`. Set `VITE_API_URL` to your public API URL **before** build.
- **Backend (e.g. Render):** run `server/` with `npm start`. Set `PORT` (if the host provides it), `GOOGLE_APPS_SCRIPT_WEBAPP_URL`, `APPS_SCRIPT_SECRET`, and `CORS_ORIGIN` (your frontend origin).

## Scripts

| Location | Command | Purpose |
|----------|---------|---------|
| `server` | `npm run dev` | API with `--watch` |
| `server` | `npm start` | Production API |
| `client` | `npm run dev` | Vite dev server |
| `client` | `npm run build` | Production bundle |
=======
# real-estate-form
Form based real estate data collection
>>>>>>> 0087a2b477ca357486bcc0b4572ef9d4aac923e6
