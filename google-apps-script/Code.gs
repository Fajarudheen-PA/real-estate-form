/**
 * Paste this entire file into: Extensions → Apps Script (bound to your spreadsheet).
 *
 * 1. Project Settings → Script properties → Add row:
 *    Property: WEBHOOK_SECRET   Value: (same string as APPS_SCRIPT_SECRET in server .env)
 * 2. Deploy → New deployment → Type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 3. Copy the Web app URL (must end with /exec) into GOOGLE_APPS_SCRIPT_WEBAPP_URL
 *
 * After ANY edit here: Deploy → Manage deployments → Edit → New version → Deploy.
 *
 * Spreadsheet: tabs named exactly Sellers, Buyers
 * Sellers A–I: Name | Phone | Location | I am submitting as | Type | Property Type | BHK | Size | Price
 * Buyers A–J: I am submitting as | Customer name | Phone | Preferred location | Requirement Type | Property Type | BHK | Size (cent / sq.ft) | Budget | Comments
 */

function getSecret_() {
  return PropertiesService.getScriptProperties().getProperty('WEBHOOK_SECRET');
}

function doGet() {
  return ContentService.createTextOutput(
    JSON.stringify({
      ok: true,
      message: 'Web app is live. Submissions use POST with form field "payload" (JSON string).',
    })
  ).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Decode application/x-www-form-urlencoded body and return parsed JSON from the "payload" field.
 * Parsing from postData.contents avoids e.parameter truncation/splitting issues with large or special values.
 */
function parseFormPayloadJson_(contents) {
  if (!contents) return null;
  var m = /(?:^|&)payload=([^&]*)/.exec(contents);
  if (!m) return null;
  var enc = m[1];
  var jsonStr = decodeURIComponent(enc.replace(/\+/g, ' '));
  return JSON.parse(jsonStr);
}

function parseBody_(e) {
  if (!e.postData || !e.postData.contents) {
    return null;
  }
  var type = (e.postData.type || '').toLowerCase();
  var contents = e.postData.contents;

  if (type.indexOf('application/json') >= 0) {
    return JSON.parse(contents);
  }

  if (type.indexOf('application/x-www-form-urlencoded') >= 0) {
    try {
      return parseFormPayloadJson_(contents);
    } catch (ignore) {
      // fall through
    }
  }

  try {
    return parseFormPayloadJson_(contents);
  } catch (ignore2) {}

  try {
    return JSON.parse(contents);
  } catch (ignore3) {}

  if (e.parameter && e.parameter.payload) {
    return JSON.parse(e.parameter.payload);
  }

  return null;
}

/**
 * Writes one data row. Sheet.getRange(row, col, numRows, numCols) — 3rd/4th args are
 * sizes, NOT end row/column (using getRange(r,1,r,n) wrongly creates r rows and triggers
 * "data has 1 but the range has N").
 */
function writeRow_(sheet, row) {
  if (!row || !row.length) {
    throw new Error('Empty row');
  }
  var values = [];
  for (var i = 0; i < row.length; i++) {
    values.push(row[i] != null && row[i] !== undefined ? String(row[i]) : '');
  }
  var r = sheet.getLastRow() + 1;
  sheet.getRange(r, 1, 1, values.length).setValues([values]);
}

function doPost(e) {
  try {
    var expected = getSecret_();
    if (!expected) {
      return jsonOut_(false, 'WEBHOOK_SECRET is not set. Project Settings → Script properties.');
    }

    var body = parseBody_(e);
    if (!body) {
      return jsonOut_(false, 'Missing or invalid body (expected form field payload= JSON)');
    }

    var got = body.secret != null ? String(body.secret).trim() : '';
    if (got !== String(expected).trim()) {
      return jsonOut_(false, 'Unauthorized — secret mismatch (check APPS_SCRIPT_SECRET matches WEBHOOK_SECRET)');
    }

    var type = body.type;
    var row = body.row;
    if (!row || !row.length) {
      return jsonOut_(false, 'Missing row');
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (type === 'seller') {
      var shS = ss.getSheetByName('Sellers');
      if (!shS) return jsonOut_(false, 'Sheet "Sellers" not found');
      writeRow_(shS, row);
    } else if (type === 'buyer') {
      var shB = ss.getSheetByName('Buyers');
      if (!shB) return jsonOut_(false, 'Sheet "Buyers" not found');
      writeRow_(shB, row);
    } else {
      return jsonOut_(false, 'Invalid type');
    }

    return jsonOut_(true, null);
  } catch (err) {
    return jsonOut_(false, String(err.message || err));
  }
}

function jsonOut_(ok, error) {
  var payload = { ok: ok };
  if (error) payload.error = error;
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}
