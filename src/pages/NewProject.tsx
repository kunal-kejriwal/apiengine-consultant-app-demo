import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { projectsApi, clientsApi } from '../api/client';
import type { CreateProjectPayload, ProjectStatus } from '../types';
import ErrorBanner from '../components/ErrorBanner';

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
];

export default function NewProject() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [form, setForm] = useState<CreateProjectPayload>({
    title: '',
    client_ref: '',
    status: 'active',
    hourly_rate: 0,
    start_date: '',
    description: '',
  });

  const { data: clients, isLoading: clientsLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: clientsApi.list,
  });

  const mutation = useMutation({
    mutationFn: projectsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      navigate('/projects');
    },
  });

  function set<K extends keyof CreateProjectPayload>(field: K, value: CreateProjectPayload[K]) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload: CreateProjectPayload = {
      title: form.title,
      client_ref: form.client_ref,
      status: form.status,
      hourly_rate: Number(form.hourly_rate),
      ...(form.start_date && { start_date: form.start_date }),
      ...(form.description && { description: form.description }),
    };
    mutation.mutate(payload);
  }

  return (
    <div className="max-w-2xl">
      <Link to="/projects" className="text-sm text-indigo-600 hover:underline mb-6 inline-block">← Back to Projects</Link>

      <h1 className="text-2xl font-bold text-slate-900 mb-2">New Project</h1>
      <p className="text-sm text-slate-500 mb-8">Create a new project engagement linked to a client.</p>

      {mutation.error && <ErrorBanner error={mutation.error} className="mb-6" />}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <div className="grid grid-cols-2 gap-5">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Project Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={e => set('title', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="e.g. Brand Identity Refresh"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Client <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={form.client_ref}
              onChange={e => set('client_ref', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
            >
              <option value="" disabled>
                {clientsLoading ? 'Loading clients…' : 'Select a client'}
              </option>
              {clients?.map(c => (
                <option key={c.uuid} value={c.uuid}>{c.company_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Status <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={form.status}
              onChange={e => set('status', e.target.value as ProjectStatus)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
            >
              {STATUS_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Hourly Rate (₹) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              required
              min={0}
              value={form.hourly_rate || ''}
              onChange={e => set('hourly_rate', Number(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="e.g. 3500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Start Date</label>
            <input
              type="date"
              value={form.start_date}
              onChange={e => set('start_date', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={e => set('description', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              placeholder="Scope, deliverables, key milestones…"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {mutation.isPending ? 'Creating…' : 'Create Project'}
          </button>
          <Link to="/projects" className="px-5 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
