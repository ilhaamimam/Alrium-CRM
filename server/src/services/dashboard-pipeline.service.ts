import {
  supabaseAdmin,
} from "../config/supabase";


/*
 * =========================================================
 * DASHBOARD PIPELINE
 *
 * This service DOES NOT update CRM data.
 *
 * It only reads:
 *
 * - leads
 * - financial_reviews
 * - technical_reviews
 * - projects
 *
 * and determines where every lead currently sits in the
 * overall CRM pipeline.
 *
 * All CRM users will eventually use the same pipeline data.
 * =========================================================
 */


export type DashboardPipelineStage =
  | "new"
  | "financial_review"
  | "technical_review"
  | "approved"
  | "team_allocated"
  | "in_progress"
  | "completion_review"
  | "completed";


export type DashboardPipelineState =
  | "pending"
  | "approved"
  | "rejected"
  | "active"
  | "changes_required"
  | "completed";


export interface DashboardPipelineLead {
  id: string;

  title: string;

  name:
    string | null;

  company_id:
    string | null;

  company_name:
    string | null;

  temperature:
    string | null;

  /*
   * Kept as "status" as well because your current
   * Dashboard PipelineLead already uses lead.status.
   */
  status:
    string | null;

  workflow_stage:
    string | null;

  pipeline_stage:
    DashboardPipelineStage;

  pipeline_stage_label:
    string;

  pipeline_stage_order:
    number;

  pipeline_state:
    DashboardPipelineState;

  pipeline_state_label:
    string;

  financial_decision:
    string | null;

  financial_review_notes:
    string | null;

  technical_decision:
    string | null;

  technical_review_notes:
    string | null;

  project_id:
    string | null;

  project_status:
    string | null;

  completion_review_status:
    string | null;

  completion_notes:
    string | null;

  created_at:
    string | null;

  updated_at:
    string | null;

  expected_close_date:
    string | null;

  submitted_financial_at:
    string | null;

  submitted_technical_at:
    string | null;

  approved_at:
    string | null;

  project_started_at:
    string | null;

  team_completed_at:
    string | null;

  completed_at:
    string | null;

  archived_at:
    string | null;

  last_update_at:
    string | null;

  rejection_stage:
    "financial" |
    "technical" |
    null;

  rejection_reason:
    string | null;
}


/*
 * =========================================================
 * BASIC HELPERS
 * =========================================================
 */

const normalize =
  (
    value:
      unknown
  ) => {

    if (
      value ===
        null ||
      value ===
        undefined
    ) {

      return "";
    }


    return String(
      value
    )
      .trim()
      .toLowerCase()
      .replace(
        /[\s-]+/g,
        "_"
      );
  };


const stringOrNull =
  (
    value:
      unknown
  ):
    string |
    null => {

    if (
      value ===
        null ||
      value ===
        undefined
    ) {

      return null;
    }


    const text =
      String(
        value
      ).trim();


    return text
      ? text
      : null;
  };


/*
 * =========================================================
 * COMPANY NAME
 * =========================================================
 */

const getCompanyName =
  (
    lead:
      any
  ):
    string |
    null => {

    const company =
      lead
        ?.companies;


    if (
      Array.isArray(
        company
      )
    ) {

      return (
        company[0]
          ?.name ??
        null
      );
    }


    return (
      company
        ?.name ??
      null
    );
  };


/*
 * =========================================================
 * REVIEW DECISION
 *
 * Your normal reviews use "decision", but these fallbacks
 * make the dashboard safer if another part of the project
 * returns "status" or "review_status".
 * =========================================================
 */

const getReviewDecision =
  (
    review:
      any
  ):
    string |
    null => {

    if (
      !review
    ) {

      return null;
    }


    const value =
      review.decision ??
      review.review_status ??
      review.status ??
      null;


    if (
      value ===
        null ||
      value ===
        undefined
    ) {

      return "pending";
    }


    const normalized =
      normalize(
        value
      );


    if (
      [
        "approved",
        "approve",
        "accepted",
        "accept",
      ].includes(
        normalized
      )
    ) {

      return "approved";
    }


    if (
      [
        "rejected",
        "reject",
        "declined",
        "decline",
      ].includes(
        normalized
      )
    ) {

      return "rejected";
    }


    if (
      [
        "pending",
        "pending_review",
        "submitted",
        "waiting",
      ].includes(
        normalized
      )
    ) {

      return "pending";
    }


    return normalized;
  };


/*
 * =========================================================
 * REVIEW NOTES
 * =========================================================
 */

const getReviewNotes =
  (
    review:
      any
  ):
    string |
    null => {

    if (
      !review
    ) {

      return null;
    }


    return (
      stringOrNull(
        review.review_notes
      ) ??
      stringOrNull(
        review.notes
      ) ??
      stringOrNull(
        review.feedback
      ) ??
      stringOrNull(
        review.rejection_reason
      ) ??
      null
    );
  };


/*
 * =========================================================
 * DATE HELPERS
 * =========================================================
 */

const getRowDate =
  (
    row:
      any
  ):
    string |
    null => {

    if (
      !row
    ) {

      return null;
    }


    return (
      stringOrNull(
        row.reviewed_at
      ) ??
      stringOrNull(
        row.senior_reviewed_at
      ) ??
      stringOrNull(
        row.final_update_at
      ) ??
      stringOrNull(
        row.actual_end_date
      ) ??
      stringOrNull(
        row.updated_at
      ) ??
      stringOrNull(
        row.created_at
      ) ??
      null
    );
  };


const timestamp =
  (
    value:
      string |
      null |
      undefined
  ) => {

    if (
      !value
    ) {

      return 0;
    }


    const parsed =
      new Date(
        value
      ).getTime();


    return Number.isNaN(
      parsed
    )
      ? 0
      : parsed;
  };


const getLatestDate =
  (
    values:
      Array<
        string |
        null |
        undefined
      >
  ):
    string |
    null => {

    const valid =
      values
        .filter(
          (
            value
          ):
            value is string =>
              Boolean(
                value
              )
        )
        .sort(
          (
            a,
            b
          ) =>
            timestamp(
              b
            ) -
            timestamp(
              a
            )
        );


    return (
      valid[0] ??
      null
    );
  };


/*
 * =========================================================
 * LATEST ROW PER LEAD
 *
 * Used in case a lead has more than one historical review.
 * =========================================================
 */

const buildLatestLeadMap =
  (
    rows:
      any[]
  ) => {

    const map =
      new Map<
        string,
        any
      >();


    for (
      const row of
      rows
    ) {

      const leadId =
        stringOrNull(
          row.lead_id
        );


      if (
        !leadId
      ) {

        continue;
      }


      const existing =
        map.get(
          leadId
        );


      if (
        !existing
      ) {

        map.set(
          leadId,
          row
        );

        continue;
      }


      if (
        timestamp(
          getRowDate(
            row
          )
        ) >=
        timestamp(
          getRowDate(
            existing
          )
        )
      ) {

        map.set(
          leadId,
          row
        );
      }
    }


    return map;
  };


/*
 * =========================================================
 * LATEST PROJECT PER LEAD
 * =========================================================
 */

const buildProjectMap =
  (
    rows:
      any[]
  ) => {

    const map =
      new Map<
        string,
        any
      >();


    for (
      const project of
      rows
    ) {

      /*
       * Primary expected column is lead_id.
       *
       * Additional fallbacks are harmless and allow the
       * pipeline to survive older project schemas.
       */

      const leadId =
        stringOrNull(
          project.lead_id
        ) ??
        stringOrNull(
          project.source_lead_id
        ) ??
        stringOrNull(
          project.approved_lead_id
        );


      if (
        !leadId
      ) {

        continue;
      }


      const existing =
        map.get(
          leadId
        );


      if (
        !existing
      ) {

        map.set(
          leadId,
          project
        );

        continue;
      }


      const projectDate =
        getLatestDate([
          project.updated_at,
          project.created_at,
          project.actual_start_date,
          project.actual_end_date,
        ]);


      const existingDate =
        getLatestDate([
          existing.updated_at,
          existing.created_at,
          existing.actual_start_date,
          existing.actual_end_date,
        ]);


      if (
        timestamp(
          projectDate
        ) >=
        timestamp(
          existingDate
        )
      ) {

        map.set(
          leadId,
          project
        );
      }
    }


    return map;
  };


/*
 * =========================================================
 * PIPELINE STAGE INFORMATION
 * =========================================================
 */

const stageDetails:
  Record<
    DashboardPipelineStage,
    {
      label: string;

      order: number;
    }
  > = {

    new: {
      label:
        "New Lead",

      order:
        1,
    },

    financial_review: {
      label:
        "Financial Review",

      order:
        2,
    },

    technical_review: {
      label:
        "Technical Review",

      order:
        3,
    },

    approved: {
      label:
        "HOT / Approved",

      order:
        4,
    },

    team_allocated: {
      label:
        "Team Allocated",

      order:
        5,
    },

    in_progress: {
      label:
        "In Progress",

      order:
        6,
    },

    completion_review: {
      label:
        "Completion Review",

      order:
        7,
    },

    completed: {
      label:
        "Completed",

      order:
        8,
    },
  };


/*
 * =========================================================
 * PROJECT STATE HELPERS
 * =========================================================
 */

const isProjectCompleted =
  (
    project:
      any
  ) => {

    if (
      !project
    ) {

      return false;
    }


    const status =
      normalize(
        project.status
      );


    const reviewStatus =
      normalize(
        project
          .completion_review_status
      );


    return (
      [
        "done",
        "complete",
        "completed",
      ].includes(
        status
      ) ||
      [
        "confirmed",
        "complete",
        "completed",
        "approved",
      ].includes(
        reviewStatus
      )
    );
  };


const isCompletionReview =
  (
    project:
      any
  ) => {

    if (
      !project ||
      isProjectCompleted(
        project
      )
    ) {

      return false;
    }


    const reviewStatus =
      normalize(
        project
          .completion_review_status
      );


    if (
      [
        "pending_review",
        "pending",
        "submitted",
        "changes_requested",
        "changes_required",
      ].includes(
        reviewStatus
      )
    ) {

      return true;
    }


    return Boolean(
      project
        .team_completed_at
    );
  };


const isProjectInProgress =
  (
    project:
      any
  ) => {

    if (
      !project ||
      isProjectCompleted(
        project
      ) ||
      isCompletionReview(
        project
      )
    ) {

      return false;
    }


    const status =
      normalize(
        project.status
      );


    return (
      [
        "ongoing",
        "in_progress",
        "progress",
        "on_hold",
        "working",
        "started",
      ].includes(
        status
      ) ||
      Boolean(
        project
          .actual_start_date
      )
    );
  };


/*
 * =========================================================
 * PIPELINE RESOLUTION
 *
 * Resolution happens from the LAST stage backwards.
 *
 * That is important because a completed project may still
 * have historical Finance/Technical information.
 * =========================================================
 */

const resolvePipeline =
  ({
    lead,
    financialReview,
    technicalReview,
    project,
  }: {
    lead: any;

    financialReview:
      any;

    technicalReview:
      any;

    project:
      any;
  }): {
    stage:
      DashboardPipelineStage;

    state:
      DashboardPipelineState;

    stateLabel:
      string;

    rejectionStage:
      "financial" |
      "technical" |
      null;

    rejectionReason:
      string |
      null;
  } => {

    const financialDecision =
      getReviewDecision(
        financialReview
      );


    const technicalDecision =
      getReviewDecision(
        technicalReview
      );


    /*
     * -------------------------------------------------------
     * 8. COMPLETED
     * -------------------------------------------------------
     */

    if (
      isProjectCompleted(
        project
      )
    ) {

      return {
        stage:
          "completed",

        state:
          "completed",

        stateLabel:
          "Completed",

        rejectionStage:
          null,

        rejectionReason:
          null,
      };
    }


    /*
     * -------------------------------------------------------
     * 7. COMPLETION REVIEW
     * -------------------------------------------------------
     */

    if (
      isCompletionReview(
        project
      )
    ) {

      const completionStatus =
        normalize(
          project
            ?.completion_review_status
        );


      const changesRequired =
        [
          "changes_requested",
          "changes_required",
        ].includes(
          completionStatus
        );


      return {
        stage:
          "completion_review",

        state:
          changesRequired
            ? "changes_required"
            : "pending",

        stateLabel:
          changesRequired
            ? "Changes Required"
            : "Pending Completion Review",

        rejectionStage:
          null,

        rejectionReason:
          null,
      };
    }


    /*
     * -------------------------------------------------------
     * 6. IN PROGRESS
     * -------------------------------------------------------
     */

    if (
      isProjectInProgress(
        project
      )
    ) {

      const projectStatus =
        normalize(
          project
            ?.status
        );


      return {
        stage:
          "in_progress",

        state:
          "active",

        stateLabel:
          projectStatus ===
            "on_hold"
            ? "On Hold"
            : "In Progress",

        rejectionStage:
          null,

        rejectionReason:
          null,
      };
    }


    /*
     * -------------------------------------------------------
     * 5. TEAM ALLOCATED
     *
     * In your CRM a project is created after Team Allocation.
     * Therefore the existence of a project means the lead has
     * passed the approved stage and entered delivery.
     * -------------------------------------------------------
     */

    if (
      project
    ) {

      return {
        stage:
          "team_allocated",

        state:
          "active",

        stateLabel:
          "Team Allocated",

        rejectionStage:
          null,

        rejectionReason:
          null,
      };
    }


    /*
     * -------------------------------------------------------
     * TECHNICAL REJECTED
     *
     * It remains visually inside Technical Review.
     * -------------------------------------------------------
     */

    if (
      technicalDecision ===
      "rejected"
    ) {

      return {
        stage:
          "technical_review",

        state:
          "rejected",

        stateLabel:
          "Technical Rejected",

        rejectionStage:
          "technical",

        rejectionReason:
          getReviewNotes(
            technicalReview
          ),
      };
    }


    /*
     * -------------------------------------------------------
     * 4. HOT / APPROVED
     * -------------------------------------------------------
     */

    const bothApproved =
      financialDecision ===
        "approved" &&
      technicalDecision ===
        "approved";


    const leadApproved =
      Boolean(
        lead.approved_at
      ) ||
      normalize(
        lead.temperature
      ) ===
        "hot";


    if (
      bothApproved ||
      leadApproved
    ) {

      return {
        stage:
          "approved",

        state:
          "approved",

        stateLabel:
          "HOT / Approved",

        rejectionStage:
          null,

        rejectionReason:
          null,
      };
    }


    /*
     * -------------------------------------------------------
     * 3. TECHNICAL REVIEW
     * -------------------------------------------------------
     */

    if (
      technicalReview ||
      lead.submitted_technical_at ||
      financialDecision ===
        "approved"
    ) {

      return {
        stage:
          "technical_review",

        state:
          technicalDecision ===
            "approved"
            ? "approved"
            : "pending",

        stateLabel:
          technicalDecision ===
            "approved"
            ? "Technical Approved"
            : "Technical Review Pending",

        rejectionStage:
          null,

        rejectionReason:
          null,
      };
    }


    /*
     * -------------------------------------------------------
     * FINANCIAL REJECTED
     *
     * It remains visually inside Financial Review.
     * -------------------------------------------------------
     */

    if (
      financialDecision ===
      "rejected"
    ) {

      return {
        stage:
          "financial_review",

        state:
          "rejected",

        stateLabel:
          "Financial Rejected",

        rejectionStage:
          "financial",

        rejectionReason:
          getReviewNotes(
            financialReview
          ),
      };
    }


    /*
     * -------------------------------------------------------
     * 2. FINANCIAL REVIEW
     * -------------------------------------------------------
     */

    if (
      financialReview ||
      lead.submitted_financial_at
    ) {

      return {
        stage:
          "financial_review",

        state:
          financialDecision ===
            "approved"
            ? "approved"
            : "pending",

        stateLabel:
          financialDecision ===
            "approved"
            ? "Financial Approved"
            : "Financial Review Pending",

        rejectionStage:
          null,

        rejectionReason:
          null,
      };
    }


    /*
     * -------------------------------------------------------
     * 1. NEW LEAD
     *
     * Note:
     *
     * lead.workflow_stage === "assigned" can mean assigned
     * to a Sales Representative in your current Lead service.
     *
     * Therefore we DO NOT interpret "assigned" as Team
     * Allocation here.
     * -------------------------------------------------------
     */

    return {
      stage:
        "new",

      state:
        "pending",

      stateLabel:
        "New Lead",

      rejectionStage:
        null,

      rejectionReason:
        null,
    };
  };


/*
 * =========================================================
 * GET DASHBOARD PIPELINE
 *
 * IMPORTANT:
 *
 * This function does NOT filter by role.
 *
 * The Dashboard pipeline is intended to be visible to every
 * authenticated CRM user.
 * =========================================================
 */

export const getDashboardPipeline =
  async (): Promise<
    DashboardPipelineLead[]
  > => {

    const [
      leadsResult,
      financialResult,
      technicalResult,
      projectsResult,
    ] =
      await Promise.all([

        /*
         * -----------------------------------------------------
         * LEADS
         *
         * Unlike getLeads(), we intentionally do NOT filter
         * archived_at here.
         *
         * A completed workflow may eventually archive a lead,
         * but it should still remain visible in the Completed
         * stage of the dashboard pipeline.
         * -----------------------------------------------------
         */

        supabaseAdmin
          .from(
            "leads"
          )
          .select(`
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
            )
          `)
          .order(
            "created_at",
            {
              ascending:
                false,
            }
          ),


        /*
         * -----------------------------------------------------
         * FINANCIAL REVIEWS
         *
         * "*" is deliberate here because your existing review
         * service can continue evolving without forcing this
         * read-only pipeline to modify the table.
         * -----------------------------------------------------
         */

        supabaseAdmin
          .from(
            "financial_reviews"
          )
          .select("*"),


        /*
         * -----------------------------------------------------
         * TECHNICAL REVIEWS
         * -----------------------------------------------------
         */

        supabaseAdmin
          .from(
            "technical_reviews"
          )
          .select("*"),


        /*
         * -----------------------------------------------------
         * PROJECTS
         * -----------------------------------------------------
         */

        supabaseAdmin
          .from(
            "projects"
          )
          .select("*"),
      ]);


    /*
     * =======================================================
     * DATABASE ERRORS
     * =======================================================
     */

    if (
      leadsResult.error
    ) {

      console.error(
        "DASHBOARD PIPELINE LEADS ERROR:",
        leadsResult.error
      );


      throw new Error(
        `Unable to load pipeline leads: ${leadsResult.error.message}`
      );
    }


    if (
      financialResult.error
    ) {

      console.error(
        "DASHBOARD PIPELINE FINANCIAL ERROR:",
        financialResult.error
      );


      throw new Error(
        `Unable to load pipeline Financial Reviews: ${financialResult.error.message}`
      );
    }


    if (
      technicalResult.error
    ) {

      console.error(
        "DASHBOARD PIPELINE TECHNICAL ERROR:",
        technicalResult.error
      );


      throw new Error(
        `Unable to load pipeline Technical Reviews: ${technicalResult.error.message}`
      );
    }


    if (
      projectsResult.error
    ) {

      console.error(
        "DASHBOARD PIPELINE PROJECT ERROR:",
        projectsResult.error
      );


      throw new Error(
        `Unable to load pipeline projects: ${projectsResult.error.message}`
      );
    }


    const leads =
      leadsResult.data ??
      [];


    const financialReviews =
      financialResult.data ??
      [];


    const technicalReviews =
      technicalResult.data ??
      [];


    const projects =
      projectsResult.data ??
      [];


    /*
     * =======================================================
     * MAP RELATED RECORDS
     * =======================================================
     */

    const financialMap =
      buildLatestLeadMap(
        financialReviews
      );


    const technicalMap =
      buildLatestLeadMap(
        technicalReviews
      );


    const projectMap =
      buildProjectMap(
        projects
      );


    /*
     * =======================================================
     * BUILD LIVE PIPELINE
     * =======================================================
     */

    const pipeline =
      leads.map(
        (
          lead:
            any
        ):
          DashboardPipelineLead => {

          const financialReview =
            financialMap.get(
              lead.id
            ) ??
            null;


          const technicalReview =
            technicalMap.get(
              lead.id
            ) ??
            null;


          const project =
            projectMap.get(
              lead.id
            ) ??
            null;


          const financialDecision =
            getReviewDecision(
              financialReview
            );


          const technicalDecision =
            getReviewDecision(
              technicalReview
            );


          const resolved =
            resolvePipeline({
              lead,

              financialReview,

              technicalReview,

              project,
            });


          const stage =
            stageDetails[
              resolved.stage
            ];


          const projectStatus =
            stringOrNull(
              project
                ?.status
            );


          const completionReviewStatus =
            stringOrNull(
              project
                ?.completion_review_status
            );


          const completedAt =
            isProjectCompleted(
              project
            )
              ? (
                  stringOrNull(
                    project
                      ?.actual_end_date
                  ) ??
                  stringOrNull(
                    project
                      ?.final_update_at
                  ) ??
                  stringOrNull(
                    project
                      ?.senior_reviewed_at
                  ) ??
                  stringOrNull(
                    project
                      ?.updated_at
                  ) ??
                  null
                )
              : null;


          const lastUpdateAt =
            getLatestDate([
              lead.updated_at,
              lead.created_at,

              getRowDate(
                financialReview
              ),

              getRowDate(
                technicalReview
              ),

              project
                ?.updated_at,

              project
                ?.created_at,

              project
                ?.team_completed_at,

              project
                ?.senior_reviewed_at,

              completedAt,
            ]);


          return {
            id:
              lead.id,

            title:
              lead.title ||
              "Untitled Lead",

            /*
             * Compatibility with your current Dashboard helper:
             *
             * getLeadTitle() checks lead.title || lead.name.
             */
            name:
              lead.title ||
              null,

            company_id:
              lead.company_id ??
              null,

            company_name:
              getCompanyName(
                lead
              ),

            temperature:
              lead.temperature ??
              null,

            status:
              lead.temperature ??
              null,

            workflow_stage:
              lead.workflow_stage ??
              null,

            pipeline_stage:
              resolved.stage,

            pipeline_stage_label:
              stage.label,

            pipeline_stage_order:
              stage.order,

            pipeline_state:
              resolved.state,

            pipeline_state_label:
              resolved.stateLabel,

            financial_decision:
              financialDecision,

            financial_review_notes:
              getReviewNotes(
                financialReview
              ),

            technical_decision:
              technicalDecision,

            technical_review_notes:
              getReviewNotes(
                technicalReview
              ),

            project_id:
              project
                ?.id ??
              null,

            project_status:
              projectStatus,

            completion_review_status:
              completionReviewStatus,

            completion_notes:
              stringOrNull(
                project
                  ?.completion_notes
              ) ??
              stringOrNull(
                project
                  ?.senior_review_notes
              ) ??
              null,

            created_at:
              lead.created_at ??
              null,

            updated_at:
              lead.updated_at ??
              null,

            expected_close_date:
              lead
                .expected_close_date ??
              null,

            submitted_financial_at:
              lead
                .submitted_financial_at ??
              null,

            submitted_technical_at:
              lead
                .submitted_technical_at ??
              null,

            approved_at:
              lead.approved_at ??
              null,

            project_started_at:
              stringOrNull(
                project
                  ?.actual_start_date
              ) ??
              stringOrNull(
                project
                  ?.planned_start_date
              ) ??
              null,

            team_completed_at:
              stringOrNull(
                project
                  ?.team_completed_at
              ),

            completed_at:
              completedAt,

            archived_at:
              lead.archived_at ??
              null,

            last_update_at:
              lastUpdateAt,

            rejection_stage:
              resolved
                .rejectionStage,

            rejection_reason:
              resolved
                .rejectionReason,
          };
        }
      );


    /*
     * =======================================================
     * SORT
     *
     * Most recently updated lead first.
     * =======================================================
     */

    pipeline.sort(
      (
        a,
        b
      ) =>
        timestamp(
          b.last_update_at
        ) -
        timestamp(
          a.last_update_at
        )
    );


    return pipeline;
  };