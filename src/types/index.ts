export interface Client {
  uuid: string;
  company_name: string;
  contact_email: string;
  phone?: string | null;
  website?: string | null;
  industry?: string | null;
  notes?: string | null;
}

export type ProjectStatus = 'active' | 'completed' | 'on_hold';

export interface Project {
  uuid: string;
  title: string;
  client_ref: string;
  status: ProjectStatus;
  hourly_rate: number;
  start_date?: string | null;
  description?: string | null;
}

export interface Invoice {
  uuid: string;
  invoice_number: string;
  project_ref: string;
  amount: number;
  issued_date: string;
  due_date?: string | null;
  is_paid?: boolean | null;
}

export interface CreateClientPayload {
  company_name: string;
  contact_email: string;
  phone?: string;
  website?: string;
  industry?: string;
  notes?: string;
}

export interface CreateProjectPayload {
  title: string;
  client_ref: string;
  status: ProjectStatus;
  hourly_rate: number;
  start_date?: string;
  description?: string;
}
