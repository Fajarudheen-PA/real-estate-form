import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { appendRowViaAppsScript } from './lib/appsScript.js';
import { validateSeller, validateBuyer } from './lib/validate.js';

const app = express();
const PORT = process.env.PORT || 3001;

const defaultOrigins = 'http://localhost:5173,http://127.0.0.1:5173';
const allowedOrigins = (process.env.CORS_ORIGIN || defaultOrigins)
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json({ limit: '256kb' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

/** Quick config check (no secrets returned). */
app.get('/health/ready', (_req, res) => {
  const hasUrl = Boolean(process.env.GOOGLE_APPS_SCRIPT_WEBAPP_URL?.trim());
  const hasSecret = Boolean(process.env.APPS_SCRIPT_SECRET?.trim());
  res.json({
    ok: true,
    appsScript: { urlConfigured: hasUrl, secretConfigured: hasSecret },
    ready: hasUrl && hasSecret,
  });
});

app.post('/submit-seller', async (req, res) => {
  try {
    const result = validateSeller(req.body);

    if (!result.ok) {
      return res.status(400).json({ message: 'Validation failed', errors: result.errors });
    }

    await appendRowViaAppsScript('seller', result.row);
    return res.json({ message: 'Seller submission saved successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: 'Failed to save submission',
      detail: err.message,
    });
  }
});

app.post('/submit-buyer', async (req, res) => {
  try {
    const result = validateBuyer(req.body);

    if (!result.ok) {
      return res.status(400).json({ message: 'Validation failed', errors: result.errors });
    }

    await appendRowViaAppsScript('buyer', result.row);
    return res.json({ message: 'Buyer submission saved successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: 'Failed to save submission',
      detail: err.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
