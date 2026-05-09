import { useMemo, useState } from 'react';
import { submitBuyer } from '../api.js';

const RESIDENTIAL = ['House', 'Flat', 'Apartment', 'Single House'];

const initial = {
  submittingAs: '',
  customerName: '',
  phone: '',
  preferredLocation: '',
  requirementType: '',
  propertyType: '',
  bhk: '',
  landSize: '',
  squareFeet: '',
  budget: '',
  comments: '',
};

function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1 text-sm text-red-600">{message}</p>;
}

export default function BuyerForm() {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const showBhk = RESIDENTIAL.includes(values.propertyType);
  const showLand = values.propertyType === 'Land';
  const showShop = values.propertyType === 'Shop';

  const resetConditional = useMemo(
    () => ({
      bhk: '',
      landSize: '',
      squareFeet: '',
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
    if (!values.submittingAs) e.submittingAs = 'Select I am submitting as';
    if (!values.customerName.trim()) e.customerName = 'Customer name is required';
    if (!values.phone.trim()) e.phone = 'Phone number is required';
    if (!values.preferredLocation.trim()) e.preferredLocation = 'Preferred location is required';
    if (!values.requirementType) e.requirementType = 'Select requirement type';
    if (!values.propertyType) e.propertyType = 'Select property type';
    if (showBhk && !values.bhk) e.bhk = 'Select BHK requirement';
    if (showLand && !values.landSize.trim()) {
      e.landSize = 'Land size (cent) is required';
    }
    if (showShop) {
      if (values.squareFeet === '' || Number.isNaN(Number(values.squareFeet))) {
        e.squareFeet = 'Enter valid square feet';
      }
    }
    if (values.budget === '' || Number.isNaN(Number(values.budget))) {
      e.budget = 'Enter a valid budget';
    }
    return e;
  }

  function buildPayload() {
    const payload = {
      submittingAs: values.submittingAs,
      customerName: values.customerName.trim(),
      phone: values.phone.trim(),
      preferredLocation: values.preferredLocation.trim(),
      requirementType: values.requirementType,
      propertyType: values.propertyType,
      budget: Number(values.budget),
      comments: values.comments.trim(),
    };
    if (showBhk) payload.bhk = values.bhk;
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
      const data = await submitBuyer(buildPayload());
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
        <h2 className="text-lg font-semibold text-slate-900">Buyer Requirements</h2>
        <p className="mt-1 text-sm text-slate-600">
          Tell us what you are looking for and your budget.
        </p>
        <p className="mt-1 text-sm text-slate-600">
          നിങ്ങൾ വീട്, സ്ഥലം, കൊമേർഷ്യൽ ബിൽഡിംഗ് വാങ്ങാനോ/വാടകയ്‌ക്കോ നോക്കുന്നുണ്ടോ? ആവശ്യം ലിസ്റ്റിൽ ചേർക്കുക 👇 
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
          <label className="block text-sm font-medium text-slate-700" htmlFor="buyerSubmittingAs">
            I am submitting as
          </label>
          <select
            id="buyerSubmittingAs"
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
          <label className="block text-sm font-medium text-slate-700" htmlFor="customerName">
            Customer name
          </label>
          <input
            id="customerName"
            name="customerName"
            autoComplete="name"
            value={values.customerName}
            onChange={onChange}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          />
          <FieldError message={errors.customerName} />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="buyerPhone">
            Phone number
          </label>
          <input
            id="buyerPhone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={values.phone}
            onChange={onChange}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          />
          <FieldError message={errors.phone} />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700" htmlFor="preferredLocation">
            Preferred location
          </label>
          <input
            id="preferredLocation"
            name="preferredLocation"
            placeholder="Area, city, or locality you prefer"
            value={values.preferredLocation}
            onChange={onChange}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          />
          <FieldError message={errors.preferredLocation} />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="requirementType">
            Requirement type
          </label>
          <select
            id="requirementType"
            name="requirementType"
            value={values.requirementType}
            onChange={onChange}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          >
            <option value="">Select…</option>
            <option value="Rent">Rent</option>
            <option value="Buy">Buy</option>
          </select>
          <FieldError message={errors.requirementType} />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="buyerPropertyType">
            Property type
          </label>
          <select
            id="buyerPropertyType"
            name="propertyType"
            value={values.propertyType}
            onChange={onChange}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          >
            <option value="">Select…</option>
            <option value="House">House</option>
            <option value="Flat">Flat</option>
            <option value="Apartment">Apartment</option>
            <option value="Single House">Single House</option>
            <option value="Land">Land</option>
            <option value="Shop">Shop</option>
          </select>
          <FieldError message={errors.propertyType} />
        </div>

        {showBhk && (
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700" htmlFor="buyerBhk">
              BHK requirement
            </label>
            <select
              id="buyerBhk"
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
        )}

        {showLand && (
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700" htmlFor="buyerLandSize">
              Land size (cent)
            </label>
            <input
              id="buyerLandSize"
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
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700" htmlFor="buyerShopSqft">
              Square feet
            </label>
            <input
              id="buyerShopSqft"
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
        )}

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700" htmlFor="budget">
            Budget
          </label>
          <input
            id="budget"
            name="budget"
            type="number"
            min="0"
            step="1"
            value={values.budget}
            onChange={onChange}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          />
          <FieldError message={errors.budget} />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700" htmlFor="comments">
            Additional comments <span className="font-normal text-slate-500">(optional)</span>
          </label>
          <textarea
            id="comments"
            name="comments"
            rows={4}
            value={values.comments}
            onChange={onChange}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          />
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
            'Submit requirements'
          )}
        </button>
      </div>
    </form>
  );
}
