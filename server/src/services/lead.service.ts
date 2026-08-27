import { supabaseAdmin } from "../config/supabase";

export interface CreateLeadInput {
  companyId?: string | null;

  contactId?: string | null;

  title: string;

  description?: string;

  source?: string;

  estimatedBudget?: number | null;

  expectedCloseDate?: string | null;

  assignedSalesRepId?: string | null;

  createdBy: string;
}


export interface UpdateLeadInput {
  companyId?: string | null;

  contactId?: string | null;

  title?: string;

  description?: string | null;

  source?: string | null;

  estimatedBudget?: number | null;

  expectedCloseDate?: string | null;

  assignedSalesRepId?: string | null;
}

const leadSelect = `
  id,
  company_id,
  contact_id,
  title,
  description,
  source,
  estimated_budget,
  expected_close_date,
  temperature,
  workflow_stage,
  assigned_sales_rep_id,
  created_by,
  submitted_financial_at,
  submitted_technical_at,
  approved_at,
  archived_at,
  archived_by,
  archive_reason,
  created_at,
  updated_at,

  companies (
    id,
    name
  ),

  contacts (
    id,
    first_name,
    last_name,
    email,
    phone
  )
`;

export const getLeads = async (
  userId: string,
  role: string
) => {
  let query = supabaseAdmin
    .from("leads")
    .select(leadSelect)
    .is("archived_at", null)
    .order("created_at", {
      ascending: false,
    });


  // Sales reps only see leads they created
  // or that are assigned to them.
  if (role === "sales_rep") {
    query = query.or(
      `created_by.eq.${userId},assigned_sales_rep_id.eq.${userId}`
    );
  }


  const { data, error } =
    await query;


  if (error) {
    console.error(
      "GET LEADS ERROR:",
      error
    );

    throw new Error(
      `Unable to load leads: ${error.message}`
    );
  }


  return data;
};

export const getLeadById = async (
  leadId: string
) => {
  const { data, error } =
    await supabaseAdmin
      .from("leads")
      .select(leadSelect)
      .eq("id", leadId)
      .is("archived_at", null)
      .single();


  if (error) {
    console.error(
      "GET LEAD ERROR:",
      error
    );

    throw new Error(
      `Unable to load lead: ${error.message}`
    );
  }


  return data;
};

export const createLead = async (
  input: CreateLeadInput
) => {
  const { data, error } =
  await supabaseAdmin
    .from("leads")
    .insert({
      company_id:
        input.companyId || null,

      contact_id:
        input.contactId || null,

      title:
        input.title,

      description:
        input.description || null,

      source:
        input.source || null,

      estimated_budget:
        input.estimatedBudget ?? null,

      expected_close_date:
        input.expectedCloseDate || null,

      assigned_sales_rep_id:
        input.assignedSalesRepId || null,

      created_by:
        input.createdBy,

      temperature:
        "cold",

      workflow_stage:
        input.assignedSalesRepId
          ? "assigned"
          : "new",
    })
    .select(leadSelect)
    .single();


  if (error) {
    console.error(
      "CREATE LEAD ERROR:",
      error
    );

    throw new Error(
      `Unable to create lead: ${error.message}`
    );
  }


  return data;
};

export const updateLead = async (
  leadId: string,
  input: UpdateLeadInput
) => {
  const updates: Record<
    string,
    unknown
  > = {};


  if (
    input.companyId !== undefined
  ) {
    updates.company_id =
      input.companyId;
  }


  if (
    input.contactId !== undefined
  ) {
    updates.contact_id =
      input.contactId;
  }


  if (
    input.title !== undefined
  ) {
    updates.title =
      input.title;
  }


  if (
    input.description !== undefined
  ) {
    updates.description =
      input.description;
  }


  if (
    input.source !== undefined
  ) {
    updates.source =
      input.source;
  }


  if (
    input.estimatedBudget !== undefined
  ) {
    updates.estimated_budget =
      input.estimatedBudget;
  }


  if (
    input.expectedCloseDate !== undefined
  ) {
    updates.expected_close_date =
      input.expectedCloseDate;
  }


  if (
    input.assignedSalesRepId !== undefined
  ) {
    updates.assigned_sales_rep_id =
      input.assignedSalesRepId;

    updates.workflow_stage =
      input.assignedSalesRepId
        ? "assigned"
        : "new";
  }


  const { data, error } =
    await supabaseAdmin
      .from("leads")
      .update(updates)
      .eq("id", leadId)
      .select(leadSelect)
      .single();


  if (error) {
    console.error(
      "UPDATE LEAD ERROR:",
      error
    );

    throw new Error(
      `Unable to update lead: ${error.message}`
    );
  }


  return data;
};

export const archiveLead = async (
  leadId: string,
  userId: string
) => {
  const { data, error } =
    await supabaseAdmin
      .from("leads")
      .update({
        archived_at:
          new Date().toISOString(),

        archived_by:
          userId,

        archive_reason:
          "Removed manually",

        workflow_stage:
          "archived",
      })
      .eq("id", leadId)
      .select()
      .single();


  if (error) {
    console.error(
      "ARCHIVE LEAD ERROR:",
      error
    );

    throw new Error(
      `Unable to remove lead: ${error.message}`
    );
  }


  return data;
};