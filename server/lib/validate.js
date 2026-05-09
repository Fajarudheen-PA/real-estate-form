const LISTING_TYPES = ['Rent', 'Sale'];
const SELLER_PROPERTY_TYPES = ['House', 'Apartment', 'Flat', 'Land', 'Shop'];
const BHK_OPTIONS = ['1BHK', '2BHK', '3BHK', '4BHK+'];

const BUYER_REQUIREMENT_TYPES = ['Rent', 'Buy'];
const BUYER_PROPERTY_TYPES = ['House', 'Flat', 'Apartment', 'Single House', 'Land', 'Shop'];
const BUYER_BHK_PROPERTY_TYPES = ['House', 'Flat', 'Apartment', 'Single House'];
const SUBMITTING_AS = ['Self', 'Broker'];

function str(v) {
  if (v === undefined || v === null) return '';
  return String(v).trim();
}

function isNonEmptyString(v) {
  return str(v).length > 0;
}

function parseNumber(v, field) {
  if (v === undefined || v === null || v === '') {
    return { ok: false, error: `${field} is required` };
  }
  const n = Number(v);
  if (!Number.isFinite(n)) {
    return { ok: false, error: `${field} must be a valid number` };
  }
  return { ok: true, value: n };
}

export function validateSeller(body) {
  const errors = [];

  const fullName = str(body.fullName);
  const phone = str(body.phone);
  const location = str(body.location);
  const submittingAs = str(body.submittingAs);
  const listingType = str(body.listingType);
  const propertyType = str(body.propertyType);
  const bhk = str(body.bhk);
  const squareFeet = body.squareFeet;
  const landSize = str(body.landSize);
  const expectedPrice = body.expectedPrice;

  if (!isNonEmptyString(fullName)) errors.push('Full name is required');
  if (!isNonEmptyString(phone)) errors.push('Phone number is required');
  if (!isNonEmptyString(location)) errors.push('Property location is required');
  if (!SUBMITTING_AS.includes(submittingAs)) {
    errors.push('I am submitting as must be Self or Broker');
  }
  if (!LISTING_TYPES.includes(listingType)) {
    errors.push('Listing type must be Rent or Sale');
  }
  if (!SELLER_PROPERTY_TYPES.includes(propertyType)) {
    errors.push('Invalid property type');
  }

  let sizeCell = '';
  let bhkCell = '';

  const isBuilt = ['House', 'Apartment', 'Flat'].includes(propertyType);
  const isLand = propertyType === 'Land';
  const isShop = propertyType === 'Shop';

  if (isBuilt) {
    if (!BHK_OPTIONS.includes(bhk)) {
      errors.push('BHK is required for this property type');
    } else {
      bhkCell = bhk;
    }
    const sq = parseNumber(squareFeet, 'Square feet');
    if (!sq.ok) errors.push(sq.error);
    else sizeCell = String(sq.value);
  } else if (isLand) {
    if (!isNonEmptyString(landSize)) {
      errors.push('Land size is required for land listings');
    } else {
      sizeCell = landSize;
    }
  } else if (isShop) {
    const sq = parseNumber(squareFeet, 'Square feet');
    if (!sq.ok) errors.push(sq.error);
    else sizeCell = String(sq.value);
  }

  const price = parseNumber(expectedPrice, 'Expected price / rent');
  if (!price.ok) errors.push(price.error);

  if (errors.length) {
    return { ok: false, errors };
  }

  const row = [
    fullName,
    phone,
    location,
    submittingAs,
    listingType,
    propertyType,
    bhkCell,
    sizeCell,
    String(price.value),
  ].map((cell) => (cell == null ? '' : String(cell)));

  return { ok: true, row };
}

export function validateBuyer(body) {
  const errors = [];

  const submittingAs = str(body.submittingAs);
  const customerName = str(body.customerName);
  const phone = str(body.phone);
  const preferredLocation = str(body.preferredLocation);
  const requirementType = str(body.requirementType);
  const propertyType = str(body.propertyType);
  const bhk = str(body.bhk);
  const landSize = str(body.landSize);
  const squareFeet = body.squareFeet;
  const budget = body.budget;
  const comments = str(body.comments);

  if (!SUBMITTING_AS.includes(submittingAs)) {
    errors.push('I am submitting as must be Self or Broker');
  }
  if (!isNonEmptyString(customerName)) errors.push('Customer name is required');
  if (!isNonEmptyString(phone)) errors.push('Phone number is required');
  if (!isNonEmptyString(preferredLocation)) errors.push('Preferred location is required');
  if (!BUYER_REQUIREMENT_TYPES.includes(requirementType)) {
    errors.push('Requirement type must be Rent or Buy');
  }
  if (!BUYER_PROPERTY_TYPES.includes(propertyType)) {
    errors.push('Invalid property type');
  }

  let bhkCell = '';
  let sizeCell = '';

  if (BUYER_BHK_PROPERTY_TYPES.includes(propertyType)) {
    if (!BHK_OPTIONS.includes(bhk)) {
      errors.push('BHK requirement is required for this property type');
    } else {
      bhkCell = bhk;
    }
  } else if (propertyType === 'Land') {
    if (!isNonEmptyString(landSize)) {
      errors.push('Land size (cent) is required for land requirements');
    } else {
      sizeCell = landSize;
    }
  } else if (propertyType === 'Shop') {
    const sq = parseNumber(squareFeet, 'Square feet');
    if (!sq.ok) errors.push(sq.error);
    else sizeCell = String(sq.value);
  }

  const bud = parseNumber(budget, 'Budget');
  if (!bud.ok) errors.push(bud.error);

  if (errors.length) {
    return { ok: false, errors };
  }

  const row = [
    submittingAs,
    customerName,
    phone,
    preferredLocation,
    requirementType,
    propertyType,
    bhkCell,
    sizeCell,
    String(bud.value),
    comments,
  ].map((cell) => (cell == null ? '' : String(cell)));

  return { ok: true, row };
}
