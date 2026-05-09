import { useMemo, useState } from 'react';
import { submitSeller } from '../api.js';

const BUILT = ['House', 'Apartment', 'Flat'];

const initial = {
  fullName: '',
  phone: '',
  location: '',
  submittingAs: '',
  listingType: '',
  propertyType: '',
  bhk: '',
  squareFeet: '',
  landSize: '',
  expectedPrice: '',
};

function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1 text-sm text-red-600">{message}</p>;
}

export default function SellerForm() {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const showBuilt = BUILT.includes(values.propertyType);
  const showLand = values.propertyType === 'Land';
  const showShop = values.propertyType === 'Shop';

  const resetConditional = useMemo(
    () => ({
      bhk: '',
      squareFeet: '',
      landSize: '',
    }),
    []
  );

  function onChange(e) {
    const { name, value } = e.target;
    setValues((v) => {
      const next = { ...v, [name]: value };
      if (name === 'propertyType') {
        Object.assign(next, resetConditional);
      }
      return next;
    });
  }

  function validate() {
    const e = {};
    if (!values.fullName.trim()) e.fullName = 'Full name is required';
    if (!values.phone.trim()) e.phone = 'Phone number is required';
    if (!values.location.trim()) e.location = 'Property location is required';
    if (!values.submittingAs) e.submittingAs = 'Select I am submitting as';
    if (!values.listingType) e.listingType = 'Select listing type';
    if (!values.propertyType) e.propertyType = 'Select property type';

    if (showBuilt) {
      if (!values.bhk) e.bhk = 'Select BHK';
      if (values.squareFeet === '' || Number.isNaN(Number(values.squareFeet))) {
        e.squareFeet = 'Enter valid square feet';
      }
    }
    if (showLand && !values.landSize.trim()) {
      e.landSize = 'Land size is required';
    }
    if (showShop) {
      if (values.squareFeet === '' || Number.isNaN(Number(values.squareFeet))) {
        e.squareFeet = 'Enter valid square feet';
      }
    }
    if (values.expectedPrice === '' || Number.isNaN(Number(values.expectedPrice))) {
      e.expectedPrice = 'Enter a valid expected price or rent';
    }

    return e;
  }

  function buildPayload() {
    const payload = {
      fullName: values.fullName.trim(),
      phone: values.phone.trim(),
      location: values.location.trim(),
      submittingAs: values.submittingAs,
      listingType: values.listingType,
      propertyType: values.propertyType,
      expectedPrice: Number(values.expectedPrice),
    };
    if (showBuilt) {
      payload.bhk = values.bhk;
      payload.squareFeet = Number(values.squareFeet);
    }
    if (showLand) payload.landSize = values.landSize.trim();
    if (showShop) payload.squareFeet = Number(values.squareFeet);
    return payload;
  }

  async function onSubmit(ev) {
    ev.preventDefault();
    setSuccess('');
    setSubmitError('');
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length) return;

    setLoading(true);
    try {
      const data = await submitSeller(buildPayload());
      setSuccess(data.message || 'Submitted successfully.');
      setValues(initial);
      setErrors({});
    } catch (err) {
      if (err.errors?.length) {
        setSubmitError(err.errors.join(' '));
      } else {
        setSubmitError(err.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Property Provider</h2>
        <p className="mt-1 text-sm text-slate-600">
          Tell us about the property you want to list.
        </p>
        <p className="mt-1 text-sm text-slate-600">
          നിങ്ങളുടെ കയ്യിൽ വിൽക്കാനോ/വാടകയ്‌ക്കോ ഉള്ള വസ്തു ലിസ്റ്റിൽ ചേർക്കുക 👇 
        </p>
      </div>

      {success && (
        <div
          className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
          role="status"
        >
          {success}
        </div>
      )}
      {submitError && (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {submitError}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700" htmlFor="fullName">
            Full name
          </label>
          <input
            id="fullName"
            name="fullName"
            autoComplete="name"
            value={values.fullName}
            onChange={onChange}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          />
          <FieldError message={errors.fullName} />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="phone">
            Phone number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            value={values.phone}
            onChange={onChange}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          />
          <FieldError message={errors.phone} />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700" htmlFor="location">
            Property location
          </label>
          <input
            id="location"
            name="location"
            value={values.location}
            onChange={onChange}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          />
          <FieldError message={errors.location} />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700" htmlFor="submittingAs">
            I am submitting as
          </label>
          <select
            id="submittingAs"
            name="submittingAs"
            value={values.submittingAs}
            onChange={onChange}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          >
            <option value="">Select…</option>
            <option value="Self">Self</option>
            <option value="Broker">Broker</option>
          </select>
          <FieldError message={errors.submittingAs} />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="listingType">
            Listing type
          </label>
          <select
            id="listingType"
            name="listingType"
            value={values.listingType}
            onChange={onChange}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          >
            <option value="">Select…</option>
            <option value="Rent">Rent</option>
            <option value="Sale">Sale</option>
          </select>
          <FieldError message={errors.listingType} />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="propertyType">
            Property type
          </label>
          <select
            id="propertyType"
            name="propertyType"
            value={values.propertyType}
            onChange={onChange}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          >
            <option value="">Select…</option>
            <option value="House">House</option>
            <option value="Apartment">Apartment</option>
            <option value="Flat">Flat</option>
            <option value="Land">Land</option>
            <option value="Shop">Shop</option>
          </select>
          <FieldError message={errors.propertyType} />
        </div>

        {showBuilt && (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-700" htmlFor="bhk">
                BHK
              </label>
              <select
                id="bhk"
                name="bhk"
                value={values.bhk}
                onChange={onChange}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              >
                <option value="">Select…</option>
                <option value="1BHK">1BHK</option>
                <option value="2BHK">2BHK</option>
                <option value="3BHK">3BHK</option>
                <option value="4BHK+">4BHK+</option>
              </select>
              <FieldError message={errors.bhk} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700" htmlFor="squareFeet">
                Square feet
              </label>
              <input
                id="squareFeet"
                name="squareFeet"
                type="number"
                min="0"
                step="1"
                value={values.squareFeet}
                onChange={onChange}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              />
              <FieldError message={errors.squareFeet} />
            </div>
          </>
        )}

        {showLand && (
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700" htmlFor="landSize">
              Land size (In Cent)
            </label>
            <input
              id="landSize"
              name="landSize"
              placeholder='e.g. "3 cent", "5 cent"'
              value={values.landSize}
              onChange={onChange}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            />
            <FieldError message={errors.landSize} />
          </div>
        )}

        {showShop && (
          <div className="sm:col-span-2 sm:grid sm:grid-cols-2 sm:gap-5">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700" htmlFor="shopSq">
                Square feet
              </label>
              <input
                id="shopSq"
                name="squareFeet"
                type="number"
                min="0"
                step="1"
                value={values.squareFeet}
                onChange={onChange}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              />
              <FieldError message={errors.squareFeet} />
            </div>
          </div>
        )}

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700" htmlFor="expectedPrice">
            Expected price / rent
          </label>
          <input
            id="expectedPrice"
            name="expectedPrice"
            type="number"
            min="0"
            step="1"
            value={values.expectedPrice}
            onChange={onChange}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          />
          <FieldError message={errors.expectedPrice} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Submitting…
            </>
          ) : (
            'Submit listing'
          )}
        </button>
      </div>
    </form>
  );
}
