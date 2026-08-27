export interface Company {
  id: string;

  name: string;

  industry: string | null;

  website: string | null;

  phone: string | null;

  address: string | null;

  notes: string | null;

  created_by: string | null;

  archived_at: string | null;

  created_at: string;

  updated_at: string;
}


export interface CreateCompanyInput {
  name: string;

  industry?: string;

  website?: string;

  phone?: string;

  address?: string;

  notes?: string;
}


export interface UpdateCompanyInput {
  name?: string;

  industry?: string;

  website?: string;

  phone?: string;

  address?: string;

  notes?: string;
}