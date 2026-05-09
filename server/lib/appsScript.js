const WEBAPP_URL = process.env.GOOGLE_APPS_SCRIPT_WEBAPP_URL?.trim();
const SECRET = process.env.APPS_SCRIPT_SECRET?.trim();

/**
 * Google Web App: first POST runs doPost() and often returns 302 to another host.
 * Re-POSTing that URL causes HTTP 405 + HTML (data may already be saved — confusing UX).
 *
 * Use redirect: 'follow' so the client follows 302 with GET and receives the JSON body.
 * Body: x-www-form-urlencoded field "payload".
 */
async function postToWebApp(startUrl, jsonBody) {
  const form = new URLSearchParams();
  form.set('payload', JSON.stringify(jsonBody));

  return fetch(startUrl, {
    method: 'POST',
    redirect: 'follow',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      'User-Agent': 'RealEstate-API/1.0',
    },
    body: form.toString(),
  });
}

export async function appendRowViaAppsScript(type, row) {
  if (!WEBAPP_URL) {
    throw new Error('GOOGLE_APPS_SCRIPT_WEBAPP_URL is not configured');
  }
  if (!SECRET) {
    throw new Error('APPS_SCRIPT_SECRET is not configured');
  }

  const payload = { secret: SECRET, type, row };
  const res = await postToWebApp(WEBAPP_URL, payload);
  const text = await res.text();

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    const snippet = text.replace(/\s+/g, ' ').slice(0, 280);
    throw new Error(
      `Apps Script did not return JSON (HTTP ${res.status}). ${snippet || 'Empty response'}. ` +
        'Use the Web app URL ending with /exec. Redeploy after editing Code.gs.'
    );
  }

  if (!data.ok) {
    throw new Error(data.error || 'Google Apps Script returned an error');
  }
}
