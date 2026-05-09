import { useState } from 'react';
import SellerForm from './components/SellerForm.jsx';
import BuyerForm from './components/BuyerForm.jsx';

export default function App() {
  const [tab, setTab] = useState('seller');

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-8 sm:px-6">
          <div>
            <p className="text-sm font-medium text-brand-600">Lexbro Real Estate | Kochi | Ernakulam</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Share your property or requirements
            </h1>
            <p className="mt-2 max-w-xl text-sm text-slate-600">
              Choose a tab below. We will record your details securely and follow up with you.
            </p>
            <p className="mt-2 max-w-xl text-sm text-slate-600">
              വീട്/സ്ഥലം/കൊമേർഷ്യൽ ബിൽഡിംഗ് - Rent & Sale
            </p>
          </div>

          <div className="flex rounded-xl bg-slate-100 p-1 sm:inline-flex sm:w-auto">
            <button
              type="button"
              onClick={() => setTab('seller')}
              className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition sm:flex-none ${
                tab === 'seller'
                  ? 'bg-white text-brand-700 shadow-sm ring-1 ring-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Seller / Property Provider
            </button>
            <button
              type="button"
              onClick={() => setTab('buyer')}
              className={`mt-1 flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition sm:mt-0 sm:flex-none ${
                tab === 'buyer'
                  ? 'bg-white text-brand-700 shadow-sm ring-1 ring-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Buyer / Requirements
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
          {tab === 'seller' ? <SellerForm /> : <BuyerForm />}
        </div>
      </main>

      <footer className="pb-10 text-center text-xs text-slate-500">
        Submissions are stored in our records securely for business use only.
      </footer>
    </div>
  );
}
