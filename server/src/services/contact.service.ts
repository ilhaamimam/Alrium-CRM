import {
  supabaseAdmin,
} from "../config/supabase";

export interface CreateContactInput {
  companyId?: string | null;

  firstName: string;

  lastName?: string;

  email?: string;

  phone?: string;

  jobTitle?: string;

  notes?: string;

  createdBy: string;
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


const contactSelect = `
  id,
  company_id,
  first_name,
  last_name,
  email,
  phone,
  job_title,
  notes,
  archived_at,
  created_at,
  updated_at,

  companies (
    id,
    name
  )
`;


/*
 * GET all active contacts.
 */
export const getContacts =
  async () => {
    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from("contacts")
        .select(contactSelect)
        .is(
          "archived_at",
          null
        )
        .order(
          "created_at",
          {
            ascending: false,
          }
        );

    if (error) {
      console.error(
        "GET CONTACTS DATABASE ERROR:",
        error
      );

      throw new Error(
        `Unable to load contacts: ${error.message}`
      );
    }

    return data;
  };


/*
 * GET one contact.
 */
export const getContactById =
  async (
    contactId: string
  ) => {
    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from("contacts")
        .select(contactSelect)
        .eq(
          "id",
          contactId
        )
        .single();

    if (error) {
      console.error(
        "GET CONTACT DATABASE ERROR:",
        error
      );

      throw new Error(
        `Unable to load contact: ${error.message}`
      );
    }

    return data;
  };


/*
 * CREATE contact.
 */
export const createContact =
  async (
    input: CreateContactInput
  ) => {
    console.log(
      "CONTACT SERVICE INPUT:",
      input
    );

    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from("contacts")
        .insert({
          company_id:
            input.companyId ||
            null,

          first_name:
            input.firstName,

          last_name:
            input.lastName ||
            null,

          email:
            input.email ||
            null,

          phone:
            input.phone ||
            null,

          job_title:
            input.jobTitle ||
            null,

          notes:
            input.notes ||
            null,

          created_by:
            input.createdBy,
        })
        .select(
          contactSelect
        )
        .single();

    if (error) {
      console.error(
        "CREATE CONTACT DATABASE ERROR:",
        error
      );

      throw new Error(
        `Unable to create contact: ${error.message}`
      );
    }

    return data;
  };


/*
 * UPDATE contact.
 */
export const updateContact =
  async (
    contactId: string,
    input: UpdateContactInput
  ) => {
    const updates: Record<
      string,
      unknown
    > = {};


    if (
      input.companyId !==
      undefined
    ) {
      updates.company_id =
        input.companyId;
    }


    if (
      input.firstName !==
      undefined
    ) {
      updates.first_name =
        input.firstName;
    }


    if (
      input.lastName !==
      undefined
    ) {
      updates.last_name =
        input.lastName;
    }


    if (
      input.email !==
      undefined
    ) {
      updates.email =
        input.email;
    }


    if (
      input.phone !==
      undefined
    ) {
      updates.phone =
        input.phone;
    }


    if (
      input.jobTitle !==
      undefined
    ) {
      updates.job_title =
        input.jobTitle;
    }


    if (
      input.notes !==
      undefined
    ) {
      updates.notes =
        input.notes;
    }


    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from("contacts")
        .update(updates)
        .eq(
          "id",
          contactId
        )
        .select(
          contactSelect
        )
        .single();


    if (error) {
      console.error(
        "UPDATE CONTACT DATABASE ERROR:",
        error
      );

      throw new Error(
        `Unable to update contact: ${error.message}`
      );
    }


    return data;
  };