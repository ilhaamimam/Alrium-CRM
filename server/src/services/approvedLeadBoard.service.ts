import {
  supabaseAdmin,
} from "../config/supabase";


export type ApprovedLeadBoardStatus =
  | "pending"
  | "planned"
  | "assigned"
  | "ongoing"
  | "done";


export interface AddApprovedLeadInput {
  leadId: string;

  plannedStartDate?: string | null;

  plannedEndDate?: string | null;

  createdBy: string;
}


export interface UpdateApprovedLeadBoardInput {
  name?: string;

  description?: string | null;

  status?: ApprovedLeadBoardStatus;

  plannedStartDate?: string | null;

  plannedEndDate?: string | null;
}


/*
 * Reusable query.
 *
 * The project row represents the Lead Board record.
 * The nested lead contains the original approved lead information.
 */
const boardSelect = `
  id,
  lead_id,
  name,
  description,
  status,
  planned_start_date,
  planned_end_date,
  actual_start_date,
  actual_end_date,
  completion_notes,
  created_by,
  created_at,
  updated_at,

  leads (
    id,
    title,
    description,
    source,
    estimated_budget,
    expected_close_date,
    temperature,
    workflow_stage,
    company_id,
    contact_id,
    assigned_sales_rep_id,
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
  )
`;


/*
 * -------------------------------------------------------
 * GET approved leads that have NOT yet been added
 * to the Lead Board.
 * -------------------------------------------------------
 */
export const getAvailableApprovedLeads =
  async () => {

    /*
     * Only approved Hot leads are eligible.
     */
    const {
      data: approvedLeads,
      error: leadError,
    } =
      await supabaseAdmin
        .from("leads")
        .select(`
          id,
          title,
          description,
          source,
          estimated_budget,
          expected_close_date,
          temperature,
          workflow_stage,
          company_id,
          contact_id,
          assigned_sales_rep_id,
          created_at,

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
        `)
        .eq(
          "workflow_stage",
          "approved"
        )
        .eq(
          "temperature",
          "hot"
        )
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


    if (leadError) {
      console.error(
        "GET APPROVED LEADS ERROR:",
        leadError
      );

      throw new Error(
        `Unable to load approved leads: ${leadError.message}`
      );
    }


    /*
     * Find leads already placed on board.
     */
    const {
      data: boardRows,
      error: boardError,
    } =
      await supabaseAdmin
        .from("projects")
        .select(
          "lead_id"
        );


    if (boardError) {
      console.error(
        "GET BOARD LEAD IDS ERROR:",
        boardError
      );

      throw new Error(
        `Unable to load Lead Board: ${boardError.message}`
      );
    }


    const existingLeadIds =
      new Set(
        (boardRows ?? []).map(
          (row) =>
            row.lead_id
        )
      );


    /*
     * Only return approved leads
     * that do not have a project/board row.
     */
    return (
      approvedLeads ?? []
    ).filter(
      (lead) =>
        !existingLeadIds.has(
          lead.id
        )
    );
  };


/*
 * -------------------------------------------------------
 * GET all Lead Board items.
 * -------------------------------------------------------
 */
export const getApprovedLeadBoard =
  async () => {

    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from("projects")
        .select(
          boardSelect
        )
        .order(
          "created_at",
          {
            ascending: false,
          }
        );


    if (error) {
      console.error(
        "GET LEAD BOARD ERROR:",
        error
      );

      throw new Error(
        `Unable to load Lead Board: ${error.message}`
      );
    }


    return data;
  };


/*
 * -------------------------------------------------------
 * GET one Lead Board item.
 * -------------------------------------------------------
 */
export const getApprovedLeadBoardItem =
  async (
    projectId: string
  ) => {

    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from("projects")
        .select(
          boardSelect
        )
        .eq(
          "id",
          projectId
        )
        .single();


    if (error) {
      console.error(
        "GET LEAD BOARD ITEM ERROR:",
        error
      );

      throw new Error(
        `Unable to load Lead Board item: ${error.message}`
      );
    }


    return data;
  };


/*
 * -------------------------------------------------------
 * ADD approved lead to Lead Board.
 * -------------------------------------------------------
 */
export const addApprovedLeadToBoard =
  async (
    input: AddApprovedLeadInput
  ) => {

    /*
     * First confirm that the lead
     * genuinely exists and is approved.
     */
    const {
      data: lead,
      error: leadError,
    } =
      await supabaseAdmin
        .from("leads")
        .select(`
          id,
          title,
          description,
          temperature,
          workflow_stage,
          archived_at
        `)
        .eq(
          "id",
          input.leadId
        )
        .single();


    if (
      leadError ||
      !lead
    ) {
      throw new Error(
        "Lead not found"
      );
    }


    /*
     * Only approved Hot leads can enter
     * the Lead Board.
     */
    if (
      lead.workflow_stage !==
        "approved" ||
      lead.temperature !==
        "hot"
    ) {
      throw new Error(
        "Only approved Hot leads can be added to the Lead Board"
      );
    }


    if (
      lead.archived_at
    ) {
      throw new Error(
        "Archived leads cannot be added to the Lead Board"
      );
    }


    /*
     * Prevent duplicate Lead Board rows.
     */
    const {
      data: existingProject,
      error: existingError,
    } =
      await supabaseAdmin
        .from("projects")
        .select(`
          id,
          lead_id
        `)
        .eq(
          "lead_id",
          input.leadId
        )
        .maybeSingle();


    if (existingError) {
      throw new Error(
        `Unable to check Lead Board: ${existingError.message}`
      );
    }


    if (existingProject) {
      throw new Error(
        "This approved lead is already on the Lead Board"
      );
    }


    /*
     * Create the Board record.
     *
     * We automatically use the approved
     * lead title and description.
     */
    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from("projects")
        .insert({
          lead_id:
            lead.id,

          name:
            lead.title,

          description:
            lead.description ||
            null,

          status:
            "pending",

          planned_start_date:
            input.plannedStartDate ||
            null,

          planned_end_date:
            input.plannedEndDate ||
            null,

          created_by:
            input.createdBy,
        })
        .select(
          boardSelect
        )
        .single();


    if (error) {
      console.error(
        "ADD APPROVED LEAD ERROR:",
        error
      );

      throw new Error(
        `Unable to add approved lead to Lead Board: ${error.message}`
      );
    }


    return data;
  };


/*
 * -------------------------------------------------------
 * UPDATE Lead Board information/status.
 * -------------------------------------------------------
 */
export const updateApprovedLeadBoardItem =
  async (
    projectId: string,
    input: UpdateApprovedLeadBoardInput
  ) => {

    const updates:
      Record<string, unknown> =
      {};


    if (
      input.name !==
      undefined
    ) {
      updates.name =
        input.name;
    }


    if (
      input.description !==
      undefined
    ) {
      updates.description =
        input.description;
    }


    if (
      input.status !==
      undefined
    ) {
      updates.status =
        input.status;


      /*
       * Set actual end date when marked Done.
       */
      if (
        input.status ===
        "done"
      ) {
        updates.actual_end_date =
          new Date()
            .toISOString()
            .slice(
              0,
              10
            );
      }
    }


    if (
      input.plannedStartDate !==
      undefined
    ) {
      updates.planned_start_date =
        input.plannedStartDate;
    }


    if (
      input.plannedEndDate !==
      undefined
    ) {
      updates.planned_end_date =
        input.plannedEndDate;
    }


    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from("projects")
        .update(
          updates
        )
        .eq(
          "id",
          projectId
        )
        .select(
          boardSelect
        )
        .single();


    if (error) {
      console.error(
        "UPDATE LEAD BOARD ERROR:",
        error
      );

      throw new Error(
        `Unable to update Lead Board item: ${error.message}`
      );
    }


    return data;
  };