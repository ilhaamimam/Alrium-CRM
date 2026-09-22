import {
  supabaseAdmin,
} from "../config/supabase";


export type CompletionReviewStatus =
  | "not_submitted"
  | "pending_review"
  | "changes_requested"
  | "confirmed";


/*
 * =========================================================
 * PROJECT ACCESS
 * =========================================================
 */

const ensureProjectAccess =
  async (
    projectId: string,

    userId: string
  ) => {

    const {
      data:
        allocations,

      error:
        allocationError,
    } =
      await supabaseAdmin
        .from("project_teams")
        .select(`
          team_id
        `)
        .eq(
          "project_id",
          projectId
        );


    if (
      allocationError
    ) {

      throw new Error(
        `Unable to check project allocation: ${allocationError.message}`
      );
    }


    const teamIds =
      (
        allocations ??
        []
      ).map(
        (
          allocation
        ) =>
          allocation.team_id
      );


    if (
      teamIds.length ===
      0
    ) {

      throw new Error(
        "This project does not have an allocated team"
      );
    }


    const {
      data:
        membership,

      error:
        membershipError,
    } =
      await supabaseAdmin
        .from("team_members")
        .select(`
          team_id,
          user_id
        `)
        .eq(
          "user_id",
          userId
        )
        .in(
          "team_id",
          teamIds
        )
        .maybeSingle();


    if (
      membershipError ||
      !membership
    ) {

      throw new Error(
        "You do not have access to complete this project"
      );
    }
  };


/*
 * =========================================================
 * COMPLETION STATUS
 * =========================================================
 */

export const getProjectCompletionStatus =
  async (
    projectId: string,

    userId: string,

    role: string
  ) => {

    if (
      role ===
      "team_member"
    ) {

      await ensureProjectAccess(
        projectId,
        userId
      );
    }


    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from("projects")
        .select(`
          id,
          status,
          completion_review_status,
          completion_notes,
          team_completed_at,
          team_completed_by,
          senior_reviewed_at,
          senior_reviewed_by,
          senior_review_notes,
          final_update_at
        `)
        .eq(
          "id",
          projectId
        )
        .single();


    if (
      error ||
      !data
    ) {

      throw new Error(
        "Project not found"
      );
    }


    return data;
  };


/*
 * =========================================================
 * TEAM SUBMITS COMPLETION
 * =========================================================
 */

export const submitProjectCompletion =
  async (
    projectId: string,

    userId: string,

    role: string,

    completionNotes:
      string | null
  ) => {

    if (
      role ===
      "team_member"
    ) {

      await ensureProjectAccess(
        projectId,
        userId
      );
    }


    const {
      data:
        project,

      error:
        projectError,
    } =
      await supabaseAdmin
        .from("projects")
        .select(`
          id,
          name,
          status,
          completion_review_status
        `)
        .eq(
          "id",
          projectId
        )
        .single();


    if (
      projectError ||
      !project
    ) {

      throw new Error(
        "Project not found"
      );
    }


    if (
      project
        .completion_review_status ===
      "confirmed"
    ) {

      throw new Error(
        "This project is already confirmed completed"
      );
    }


    /*
     * Every task must be done.
     */

    const {
      data:
        tasks,

      error:
        taskError,
    } =
      await supabaseAdmin
        .from("tasks")
        .select(`
          id,
          title,
          status
        `)
        .eq(
          "project_id",
          projectId
        );


    if (
      taskError
    ) {

      throw new Error(
        `Unable to check project tasks: ${taskError.message}`
      );
    }


    const incompleteTasks =
      (
        tasks ??
        []
      ).filter(
        (
          task
        ) =>
          task.status !==
          "done"
      );


    if (
      incompleteTasks.length >
      0
    ) {

      throw new Error(
        `${incompleteTasks.length} task(s) are not Done. Complete all tasks before submitting the project.`
      );
    }


    const now =
      new Date()
        .toISOString();


    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from("projects")
        .update({
          completion_review_status:
            "pending_review",

          team_completed_at:
            now,

          team_completed_by:
            userId,

          completion_notes:
            completionNotes ??
            null,

          senior_reviewed_at:
            null,

          senior_reviewed_by:
            null,

          senior_review_notes:
            null,

          final_update_at:
            null,

          actual_end_date:
            null,

          /*
           * Team completion is not final Done.
           */

          status:
            project.status ===
            "assigned"
              ? "ongoing"
              : project.status,
        })
        .eq(
          "id",
          projectId
        )
        .select()
        .single();


    if (
      error ||
      !data
    ) {

      throw new Error(
        `Unable to submit project completion: ${
          error?.message ||
          "Unknown error"
        }`
      );
    }


    await supabaseAdmin
      .from("activities")
      .insert({
        user_id:
          userId,

        entity_type:
          "project",

        entity_id:
          projectId,

        action:
          "completion_submitted",

        description:
          `Project "${project.name}" submitted for completion review`,

        metadata: {
          completionReviewStatus:
            "pending_review",
        },
      });


    return data;
  };


/*
 * =========================================================
 * LIST COMPLETION PROJECTS
 *
 * No status:
 * ALL allocated projects
 *
 * status:
 * filter by real database enum.
 * =========================================================
 */

export const getCompletionReviews =
  async (
    status?:
      CompletionReviewStatus
  ) => {

    /*
     * project_teams!inner ensures only
     * genuinely allocated projects appear.
     */

    let query =
      supabaseAdmin
        .from("projects")
        .select(`
          id,
          lead_id,
          name,
          description,
          status,
          completion_review_status,
          completion_notes,
          planned_start_date,
          planned_end_date,
          actual_start_date,
          actual_end_date,
          team_completed_at,
          team_completed_by,
          senior_reviewed_at,
          senior_reviewed_by,
          senior_review_notes,
          final_update_at,
          created_at,
          updated_at,

          leads (
            id,
            title,
            temperature,
            workflow_stage,
            estimated_budget,
            assigned_sales_rep_id,
            created_by,

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
          ),

          project_teams!inner (
            team_id,
            assigned_at,

            teams (
              id,
              name,
              description
            )
          ),

          tasks (
            id,
            title,
            status,
            assigned_to,
            due_date,
            completed_at
          )
        `)
        .order(
          "updated_at",
          {
            ascending:
              false,
          }
        );


    if (
      status
    ) {

      query =
        query.eq(
          "completion_review_status",
          status
        );
    }


    const {
      data,
      error,
    } =
      await query;


    if (
      error
    ) {

      console.error(
        "GET COMPLETION REVIEWS ERROR:",
        error
      );


      throw new Error(
        `Unable to load completion reviews: ${error.message}`
      );
    }


    return (
      data ??
      []
    );
  };


/*
 * =========================================================
 * GET ONE REVIEW
 * =========================================================
 */

export const getCompletionReviewById =
  async (
    projectId: string
  ) => {

    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from("projects")
        .select(`
          id,
          lead_id,
          name,
          description,
          status,
          completion_review_status,
          completion_notes,
          planned_start_date,
          planned_end_date,
          actual_start_date,
          actual_end_date,
          team_completed_at,
          team_completed_by,
          senior_reviewed_at,
          senior_reviewed_by,
          senior_review_notes,
          final_update_at,
          created_at,
          updated_at,

          leads (
            id,
            title,
            temperature,
            workflow_stage,
            estimated_budget,
            assigned_sales_rep_id,
            created_by,

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
          ),

          project_teams (
            team_id,
            assigned_at,

            teams (
              id,
              name,
              description
            )
          ),

          tasks (
            id,
            project_id,
            title,
            description,
            status,
            assigned_to,
            due_date,
            completed_at,
            updated_at
          )
        `)
        .eq(
          "id",
          projectId
        )
        .single();


    if (
      error ||
      !data
    ) {

      throw new Error(
        "Completion review not found"
      );
    }


    return data;
  };


/*
 * =========================================================
 * MANAGER CONFIRMS COMPLETION
 * =========================================================
 */

export const confirmProjectCompletion =
  async (
    projectId: string,

    seniorManagerId: string,

    reviewNotes:
      string | null
  ) => {

    const {
      data:
        project,

      error:
        projectError,
    } =
      await supabaseAdmin
        .from("projects")
        .select(`
          id,
          name,
          lead_id,
          completion_review_status
        `)
        .eq(
          "id",
          projectId
        )
        .single();


    if (
      projectError ||
      !project
    ) {

      throw new Error(
        "Project not found"
      );
    }


    if (
      project
        .completion_review_status !==
      "pending_review"
    ) {

      throw new Error(
        "Only projects waiting for review can be confirmed"
      );
    }


    /*
     * Tasks must still be Done.
     */

    const {
      data:
        tasks,

      error:
        taskError,
    } =
      await supabaseAdmin
        .from("tasks")
        .select(`
          id,
          status
        `)
        .eq(
          "project_id",
          projectId
        );


    if (
      taskError
    ) {

      throw new Error(
        `Unable to verify project tasks: ${taskError.message}`
      );
    }


    const incompleteTasks =
      (
        tasks ??
        []
      ).filter(
        (
          task
        ) =>
          task.status !==
          "done"
      );


    if (
      incompleteTasks.length >
      0
    ) {

      throw new Error(
        "Project cannot be confirmed because one or more tasks are not Done"
      );
    }


    const now =
      new Date()
        .toISOString();


    const today =
      now.slice(
        0,
        10
      );


    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from("projects")
        .update({
          status:
            "done",

          completion_review_status:
            "confirmed",

          senior_reviewed_at:
            now,

          senior_reviewed_by:
            seniorManagerId,

          senior_review_notes:
            reviewNotes ??
            null,

          actual_end_date:
            today,

          final_update_at:
            now,
        })
        .eq(
          "id",
          projectId
        )
        .select()
        .single();


    if (
      error ||
      !data
    ) {

      throw new Error(
        `Unable to confirm project completion: ${
          error?.message ||
          "Unknown error"
        }`
      );
    }


    await supabaseAdmin
      .from("activities")
      .insert({
        user_id:
          seniorManagerId,

        entity_type:
          "project",

        entity_id:
          projectId,

        action:
          "completion_confirmed",

        description:
          `Project "${project.name}" confirmed Done`,

        metadata: {
          status:
            "done",

          completionReviewStatus:
            "confirmed",

          leadId:
            project.lead_id,
        },
      });


    return data;
  };


/*
 * =========================================================
 * REQUEST CHANGES
 * =========================================================
 */

export const requestProjectCompletionChanges =
  async (
    projectId: string,

    seniorManagerId: string,

    reviewNotes: string
  ) => {

    if (
      !reviewNotes.trim()
    ) {

      throw new Error(
        "Review notes are required when requesting changes"
      );
    }


    const {
      data:
        project,

      error:
        projectError,
    } =
      await supabaseAdmin
        .from("projects")
        .select(`
          id,
          name,
          completion_review_status
        `)
        .eq(
          "id",
          projectId
        )
        .single();


    if (
      projectError ||
      !project
    ) {

      throw new Error(
        "Project not found"
      );
    }


    if (
      project
        .completion_review_status !==
      "pending_review"
    ) {

      throw new Error(
        "Project is not currently waiting for review"
      );
    }


    const now =
      new Date()
        .toISOString();


    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from("projects")
        .update({
          status:
            "ongoing",

          completion_review_status:
            "changes_requested",

          senior_reviewed_at:
            now,

          senior_reviewed_by:
            seniorManagerId,

          senior_review_notes:
            reviewNotes.trim(),

          actual_end_date:
            null,

          final_update_at:
            null,
        })
        .eq(
          "id",
          projectId
        )
        .select()
        .single();


    if (
      error ||
      !data
    ) {

      throw new Error(
        `Unable to request project changes: ${
          error?.message ||
          "Unknown error"
        }`
      );
    }


    await supabaseAdmin
      .from("activities")
      .insert({
        user_id:
          seniorManagerId,

        entity_type:
          "project",

        entity_id:
          projectId,

        action:
          "completion_changes_requested",

        description:
          `Changes requested for project "${project.name}"`,

        metadata: {
          reviewNotes:
            reviewNotes.trim(),
        },
      });


    return data;
  };


/*
 * =========================================================
 * FINAL / ARCHIVED UPDATES
 * =========================================================
 */

export const getFinalProjectUpdates =
  async (
    userId: string,

    role: string
  ) => {

    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from("projects")
        .select(`
          id,
          lead_id,
          name,
          description,
          status,
          completion_review_status,
          completion_notes,
          senior_review_notes,
          team_completed_at,
          senior_reviewed_at,
          actual_start_date,
          actual_end_date,
          final_update_at,
          planned_start_date,
          planned_end_date,

          leads (
            id,
            title,
            temperature,
            assigned_sales_rep_id,
            created_by,

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
          ),

          project_teams (
            teams (
              id,
              name
            )
          )
        `)
        .eq(
          "completion_review_status",
          "confirmed"
        )
        .eq(
          "status",
          "done"
        )
        .order(
          "final_update_at",
          {
            ascending:
              false,
          }
        );


    if (
      error
    ) {

      throw new Error(
        `Unable to load final project updates: ${error.message}`
      );
    }


    /*
     * Both management roles can use service result.
     */

    if (
      role ===
        "sales_manager" ||
      role ===
        "senior_manager"
    ) {

      return (
        data ??
        []
      );
    }


    if (
      role ===
      "sales_rep"
    ) {

      return (
        data ??
        []
      ).filter(
        (
          project:
            any
        ) => {

          const lead =
            project.leads;


          if (
            !lead
          ) {

            return false;
          }


          return (
            lead
              .assigned_sales_rep_id ===
              userId ||
            lead.created_by ===
              userId
          );
        }
      );
    }


    return [];
  };