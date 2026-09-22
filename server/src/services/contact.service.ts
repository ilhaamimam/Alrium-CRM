import {
  supabaseAdmin,
} from "../config/supabase";


export interface CreateContactData {
  companyId: string | null;

  firstName: string;

  lastName: string | null;

  email: string | null;

  phone: string | null;

  jobTitle: string | null;

  notes: string | null;

  createdBy: string;
}


export interface UpdateContactData {
  companyId?: string | null;

  firstName?: string;

  lastName?: string | null;

  email?: string | null;

  phone?: string | null;

  jobTitle?: string | null;

  notes?: string | null;
}


/*
 * =========================================================
 * GET ALL CONTACTS
 * =========================================================
 */

export const getAllContacts =
  async () => {

    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from("contacts")
        .select(`
          id,
          company_id,
          first_name,
          last_name,
          email,
          phone,
          job_title,
          notes,
          created_by,
          created_at,
          updated_at,

          companies (
            id,
            name
          )
        `)
        .order(
          "created_at",
          {
            ascending: false,
          }
        );


    if (error) {
      console.error(
        "GET CONTACTS ERROR:",
        error
      );

      throw new Error(
        error.message
      );
    }


    return data ?? [];
  };


/*
 * =========================================================
 * GET ONE CONTACT
 * =========================================================
 */

export const getContactRecordById =
  async (
    id: string
  ) => {

    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from("contacts")
        .select(`
          id,
          company_id,
          first_name,
          last_name,
          email,
          phone,
          job_title,
          notes,
          created_by,
          created_at,
          updated_at,

          companies (
            id,
            name
          )
        `)
        .eq(
          "id",
          id
        )
        .single();


    if (
      error ||
      !data
    ) {
      console.error(
        "GET CONTACT ERROR:",
        error
      );

      throw new Error(
        "Contact not found"
      );
    }


    return data;
  };


/*
 * =========================================================
 * CREATE CONTACT
 * =========================================================
 */

export const createContactRecord =
  async (
    input:
      CreateContactData
  ) => {

    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from("contacts")
        .insert({
          company_id:
            input.companyId,

          first_name:
            input.firstName,

          last_name:
            input.lastName,

          email:
            input.email,

          phone:
            input.phone,

          job_title:
            input.jobTitle,

          notes:
            input.notes,

          created_by:
            input.createdBy,
        })
        .select(`
          id,
          company_id,
          first_name,
          last_name,
          email,
          phone,
          job_title,
          notes,
          created_by,
          created_at,
          updated_at,

          companies (
            id,
            name
          )
        `)
        .single();


    if (error) {
      console.error(
        "CREATE CONTACT DATABASE ERROR:",
        error
      );

      throw new Error(
        error.message
      );
    }


    return data;
  };


/*
 * =========================================================
 * UPDATE CONTACT
 * =========================================================
 */

export const updateContactRecord =
  async (
    id: string,
    input:
      UpdateContactData
  ) => {

    const updateData:
      Record<string, unknown> =
      {};


    if (
      input.companyId !==
      undefined
    ) {
      updateData.company_id =
        input.companyId;
    }


    if (
      input.firstName !==
      undefined
    ) {
      updateData.first_name =
        input.firstName;
    }


    if (
      input.lastName !==
      undefined
    ) {
      updateData.last_name =
        input.lastName;
    }


    if (
      input.email !==
      undefined
    ) {
      updateData.email =
        input.email;
    }


    if (
      input.phone !==
      undefined
    ) {
      updateData.phone =
        input.phone;
    }


    if (
      input.jobTitle !==
      undefined
    ) {
      updateData.job_title =
        input.jobTitle;
    }


    if (
      input.notes !==
      undefined
    ) {
      updateData.notes =
        input.notes;
    }


    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from("contacts")
        .update(
          updateData
        )
        .eq(
          "id",
          id
        )
        .select(`
          id,
          company_id,
          first_name,
          last_name,
          email,
          phone,
          job_title,
          notes,
          created_by,
          created_at,
          updated_at,

          companies (
            id,
            name
          )
        `)
        .single();


    if (error) {
      console.error(
        "UPDATE CONTACT DATABASE ERROR:",
        error
      );

      throw new Error(
        error.message
      );
    }


    return data;
  };


/*
 * =========================================================
 * DELETE CONTACT
 * =========================================================
 */

export const deleteContactRecord =
  async (
    id: string
  ) => {

    const {
      error,
    } =
      await supabaseAdmin
        .from("contacts")
        .delete()
        .eq(
          "id",
          id
        );


    if (error) {
      console.error(
        "DELETE CONTACT DATABASE ERROR:",
        error
      );

      throw new Error(
        error.message
      );
    }


    return true;
  };