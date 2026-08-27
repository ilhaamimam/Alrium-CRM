import { supabaseAdmin } from "../config/supabase";

interface CreateCompanyInput {
  name: string;
  industry?: string;
  website?: string;
  phone?: string;
  address?: string;
  notes?: string;
  createdBy: string;
}

interface UpdateCompanyInput {
  name?: string;
  industry?: string | null;
  website?: string | null;
  phone?: string | null;
  address?: string | null;
  notes?: string | null;
}

export const getCompanies = async () => {
  const { data, error } = await supabaseAdmin
    .from("companies")
    .select(`
      id,
      name,
      industry,
      website,
      phone,
      address,
      notes,
      created_by,
      archived_at,
      created_at,
      updated_at
    `)
    .is("archived_at", null)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "GET COMPANIES ERROR:",
      error
    );

    throw new Error(
      `Unable to load companies: ${error.message}`
    );
  }

  return data;
};

export const getCompanyById = async (
  companyId: string
) => {
  const { data, error } = await supabaseAdmin
    .from("companies")
    .select(`
      id,
      name,
      industry,
      website,
      phone,
      address,
      notes,
      created_by,
      archived_at,
      created_at,
      updated_at
    `)
    .eq("id", companyId)
    .single();

  if (error) {
    console.error(
      "GET COMPANY ERROR:",
      error
    );

    throw new Error(
      `Unable to load company: ${error.message}`
    );
  }

  return data;
};

export const createCompany = async (
  input: CreateCompanyInput
) => {
  const { data, error } = await supabaseAdmin
    .from("companies")
    .insert({
      name: input.name,
      industry: input.industry || null,
      website: input.website || null,
      phone: input.phone || null,
      address: input.address || null,
      notes: input.notes || null,
      created_by: input.createdBy,
    })
    .select()
    .single();

  if (error) {
    console.error(
      "CREATE COMPANY ERROR:",
      error
    );

    throw new Error(
      `Unable to create company: ${error.message}`
    );
  }

  return data;
};

export const updateCompany = async (
  companyId: string,
  input: UpdateCompanyInput
) => {
  const { data, error } =
    await supabaseAdmin
      .from("companies")
      .update(input)
      .eq("id", companyId)
      .select(`
        id,
        name,
        industry,
        website,
        phone,
        address,
        notes,
        created_by,
        archived_at,
        created_at,
        updated_at
      `)
      .single();

  if (error) {
    console.error(
      "UPDATE COMPANY ERROR:",
      error
    );

    throw new Error(
      `Unable to update company: ${error.message}`
    );
  }

  return data;
};
