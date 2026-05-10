import type { Client, Project, Invoice, CreateClientPayload, CreateProjectPayload } from '../types';

const BASE = 'https://api.theapiengine.com';
const NS = '40ab90dd-cdf1-4ee8-ac63-02de0770fe8f';
const MODELS = `${BASE}/api/v1/custom/${NS}/models`;

export class ApiError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const key = import.meta.env.VITE_APIENGINE_KEY as string;
  const res = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': key,
      ...init?.headers,
    },
  });

  if (!res.ok) {
    let detail = `HTTP ${res.status} ${res.statusText}`;
    try {
      const body = await res.json();
      detail = body.detail ?? body.message ?? JSON.stringify(body);
    } catch {
      // keep default detail
    }
    throw new ApiError(res.status, detail);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const clientsApi = {
  list: () => request<Client[]>(`${MODELS}/client/view/records/`),
  get: (uuid: string) => request<Client>(`${MODELS}/client/records/${uuid}/`),
  create: (data: CreateClientPayload) =>
    request<{ uuid: string }>(`${MODELS}/client/records/`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export const projectsApi = {
  list: () => request<Project[]>(`${MODELS}/project/view/records/`),
  get: (uuid: string) => request<Project>(`${MODELS}/project/records/${uuid}/`),
  create: (data: CreateProjectPayload) =>
    request<{ uuid: string }>(`${MODELS}/project/records/`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export const invoicesApi = {
  list: () => request<Invoice[]>(`${MODELS}/invoice/view/records/`),
  get: (uuid: string) => request<Invoice>(`${MODELS}/invoice/records/${uuid}/`),
};
