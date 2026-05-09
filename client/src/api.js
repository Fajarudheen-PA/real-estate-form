/**
 * Dev: Vite proxies /api → http://127.0.0.1:3001 (see vite.config.js), so the browser
 * always talks to the same host (fixes phone/LAN testing and avoids CORS).
 * Production: set VITE_API_URL to your API origin, e.g. https://your-api.onrender.com
 */
const configured = import.meta.env.VITE_API_URL?.trim();

function apiUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`;
  if (configured) {
    return `${configured.replace(/\/$/, '')}${p}`;
  }
  return `/api${p}`;
}

function networkHint() {
  return (
    ' Cannot reach the API. Start the server (cd server && npm run dev), keep it on port 3001, ' +
    'and use the Vite dev URL (npm run dev in client). If you opened a built index.html as a file, use npm run dev instead.'
  );
}

async function parseResponse(res) {
  const text = await res.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(
      text.replace(/\s+/g, ' ').slice(0, 200) || `Server error (${res.status})`
    );
  }
  if (!res.ok) {
    const parts = [data.message, data.detail].filter(Boolean);
    const err = new Error(parts.join(' — ') || 'Submission failed');
    err.errors = data.errors;
    err.detail = data.detail;
    err.status = res.status;
    throw err;
  }
  return data;
}

// async function request(path, options) {
//   try {
//     const res = await fetch(apiUrl(path), options);
//     return parseResponse(res);
//   } catch (e) {
//     if (e instanceof TypeError && (e.message === 'Failed to fetch' || e.name === 'TypeError')) {
//       throw new Error(`Failed to fetch.${networkHint()}`);
//     }
//     throw e;
//   }
// }

// export function submitSeller(payload) {
//   return request('/submit-seller', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(payload),
//   });
// }
export async function submitSeller(payload) {
  const url = "https://script.google.com/macros/s/AKfycbzO3Qt5fPoVVC6B3mcEfL2uxI1GqDE1keE3q82A6zSFHQTnHUufu2u8UY47QeHg4SpP/exec?sheet=Sellers&secret=mysecret123456789";
// console.log(payload);
  const res = await fetch(url, {
    method: "POST",
    body: JSON.stringify({
      row: [
        payload.fullName,              // Name
        payload.phone,             // Phone
        payload.location,          // Location
        payload.submittingAs,       // I am submitting as
        payload.listingType,              // Type (Rent/Sale)
        payload.propertyType,      // Property Type
        payload.bhk || "",         // BHK
        payload.squareFeet || "",        // Size
        payload.expectedPrice   ,           // Price
        payload.landSize || "",        //Land Size
      ]
    })
  });

  return res.json();
}

// export function submitBuyer(payload) {
//   return request('/submit-buyer', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(payload),
//   });
// }
export async function submitBuyer(payload) {
  const url = "https://script.google.com/macros/s/AKfycbzO3Qt5fPoVVC6B3mcEfL2uxI1GqDE1keE3q82A6zSFHQTnHUufu2u8UY47QeHg4SpP/exec?sheet=Buyers&secret=mysecret123456789";
// console.log("BUYER PAYLOAD:", payload);
  const res = await fetch(url, {
    method: "POST",
    body: JSON.stringify({
      row: [
        payload.submittingAs,       // I am submitting as
        payload.customerName,       // Customer name
        payload.phone,              // Phone
        payload.preferredLocation,  // Preferred location
        payload.requirementType,    // Rent/Buy
        payload.propertyType,       // Property Type
        payload.bhk || "",          // BHK
        payload.squareFeet || "",   // Size
        payload.budget,             // Budget
        payload.comments || ""  ,    // Comments
        payload.landSize || ""
      ]
    })
  });

  return res.json();
}
