export interface ContactCompany {
  id: string;
  name: string;
}

export interface Contact {
  id: string;

  company_id: string | null;

  first_name: string;

  last_name: string | null;

  email: string | null;

  phone: string | null;

  job_title: string | null;

  notes: string | null;

  archived_at: string | null;

  created_at: string;

  updated_at: string;

  companies?: ContactCompany | null;
}

export interface CreateContactInput {
  companyId?: string | null;

  firstName: string;

  lastName?: string;

  email?: string;

  phone?: string;

  jobTitle?: string;

  notes?: string;
}

export interface UpdateContactInput {
  companyId?: string | null;

  firstName?: string;

  lastName?: string | null;

  email?: string | null;

  phone?: string | null;

  jobTitle?: string | null;

  notes?: string | null;
}