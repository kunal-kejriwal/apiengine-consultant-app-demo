import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clientsApi } from '../api/client';
import type { CreateClientPayload } from '../types';
import ErrorBanner from '../components/ErrorBanner';

export default function NewClient() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [form, setForm] = useState<CreateClientPayload>({
    company_name: '',
    contact_email: '',
    phone: '',
    website: '',
    industry: '',
    notes: '',
  });

  const mutation = useMutation({
    mutationFn: clientsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clients'] });
      navigate('/clients');
    },
  });

  function set(field: keyof CreateClientPayload, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload: CreateClientPayload = {
      company_name: form.company_name,
      contact_email: form.contact_email,
      ...(form.phone && { phone: form.phone }),
      ...(form.website && { website: form.website }),
      ...(form.industry && { industry: form.industry }),
      ...(form.notes && { notes: form.notes }),
    };
    mutation.mutate(payload);
  }

  return (
    <div className="max-w-2xl">
      <Link to="/clients" className="text-sm text-indigo-600 hover:underline mb-6 inline-block">← Back to Clients</Link>

      <h1 className="text-2xl font-bold text-slate-900 mb-2">Add New Client</h1>
      <p className="text-sm text-slate-500 mb-8">Create a new client record in your APIEngine backend.</p>

      {mutation.error && <ErrorBanner error={mutation.error} className="mb-6" />}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <div className="grid grid-cols-2 gap-5">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Company Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.company_name}
              onChange={e => set('company_name', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="e.g. Acme Technologies"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Contact Email <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              required
              value={form.contact_email}
              onChange={e => set('contact_email', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="billing@company.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
            <input
              type="text"
              value={form.phone}
              onChange={e => set('phone', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="+91-99999-99999"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Website</label>
            <input
              type="url"
              value={form.website}
              onChange={e => set('website', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="https://example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Industry</label>
            <input
              type="text"
              value={form.industry}
              onChange={e => set('industry', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="e.g. FinTech, Healthcare"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
            <textarea
              rows={4}
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              placeholder="Payment terms, key contacts, preferences…"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {mutation.isPending ? 'Creating…' : 'Create Client'}
          </button>
          <Link to="/clients" className="px-5 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
