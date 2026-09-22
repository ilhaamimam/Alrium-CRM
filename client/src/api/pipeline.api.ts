import {
  api,
} from "./http";


/*
 * =========================================================
 * LEAD TEMPERATURE
 * =========================================================
 */

export type PipelineLeadTemperature =
  | "cold"
  | "hot";


/*
 * =========================================================
 * REVIEW DECISION
 *
 * Existing LeadsPage ReviewBadge requires a real value.
 *
 * A lead with no review yet is represented as "pending"
 * instead of null.
 * =========================================================
 */

export type PipelineReviewDecision =
  | "pending"
  | "approved"
  | "rejected";


/*
 * =========================================================
 * PIPELINE STAGES
 *
 * Includes both:
 *
 * - existing CRM stage names
 * - new Dashboard pipeline stage names
 *
 * so existing pages continue working.
 * =========================================================
 */

export type PipelineStage =
  | "new"
  | "assigned"
  | "financial_review"
  | "financial_rejected"
  | "technical_review"
  | "technical_rejected"
  | "production_ready"
  | "approved"
  | "team_allocated"
  | "in_progress"
  | "completion_review"
  | "completed";


/*
 * =========================================================
 * NEW DASHBOARD PIPELINE STAGES
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


/*
 * =========================================================
 * PIPELINE STATE
 * =========================================================
 */

export type PipelineState =
  | "pending"
  | "approved"
  | "rejected"
  | "active"
  | "changes_required"
  | "completed";


/*
 * =========================================================
 * REJECTION STAGE
 * =========================================================
 */

export type PipelineRejectionStage =
  | "financial"
  | "technical"
  | null;


/*
 * =========================================================
 * PIPELINE LEAD
 * =========================================================
 */

export interface PipelineLead {
  /*
   * BASIC LEAD
   */

  id: string;

  title: string;

  name:
    string | null;

  description?:
    string | null;

  source?:
    string | null;


  /*
   * COMPANY
   */

  company_id:
    string | null;

  company_name:
    string | null;


  /*
   * BUDGET
   *
   * Keep both names because existing pages may use budget,
   * while the database uses estimated_budget.
   */

  budget:
    number | null;

  estimated_budget:
    number | null;


  /*
   * HOT / COLD
   */

  status:
    PipelineLeadTemperature;

  temperature:
    PipelineLeadTemperature;


  /*
   * WORKFLOW
   */

  workflow_stage:
    string | null;

  pipeline_stage:
    PipelineStage;

  pipeline_stage_label:
    string;

  pipeline_stage_order:
    number;

  pipeline_state:
    PipelineState;

  pipeline_state_label:
    string;


  /*
   * FINANCIAL REVIEW
   *
   * IMPORTANT:
   *
   * These are NOT nullable.
   *
   * A lead without a decision receives "pending".
   */

  financial_decision:
    PipelineReviewDecision;

  financial_review_notes:
    string | null;


  /*
   * TECHNICAL REVIEW
   */

  technical_decision:
    PipelineReviewDecision;

  technical_review_notes:
    string | null;


  /*
   * PROJECT / DELIVERY
   */

  project_id:
    string | null;

  project_status:
    string | null;

  completion_review_status:
    string | null;

  completion_notes:
    string | null;


  /*
   * DATES
   */

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


  /*
   * REJECTION
   */

  rejection_stage:
    PipelineRejectionStage;

  rejection_reason:
    string | null;
}


/*
 * =========================================================
 * PIPELINE TEAM
 *
 * Required by existing Team Allocation.
 * =========================================================
 */

export interface PipelineTeam {
  id: string;

  name: string;

  description:
    string | null;

  created_by:
    string | null;

  created_at:
    string | null;

  updated_at:
    string | null;

  member_count?:
    number;
}


/*
 * =========================================================
 * PIPELINE TEAM MEMBER
 * =========================================================
 */

export interface PipelineTeamMember {
  id: string;

  user_id: string;

  full_name:
    string | null;

  email: string;

  role:
    string | null;

  availability_status:
    string | null;

  is_active:
    boolean;
}


/*
 * =========================================================
 * PIPELINE SUMMARY
 * =========================================================
 */

export interface PipelineSummary {
  total: number;

  new: number;

  financial_review:
    number;

  technical_review:
    number;

  approved:
    number;

  team_allocated:
    number;

  in_progress:
    number;

  completion_review:
    number;

  completed:
    number;

  rejected:
    number;

  changes_required:
    number;
}


/*
 * =========================================================
 * DASHBOARD PIPELINE DATA
 * =========================================================
 */

export interface DashboardPipelineData {
  summary:
    PipelineSummary;

  leads:
    PipelineLead[];
}


/*
 * =========================================================
 * DASHBOARD API RESPONSE
 * =========================================================
 */

interface DashboardPipelineResponse {
  success:
    boolean;

  data?: {
    summary?:
      Partial<
        PipelineSummary
      >;

    leads?:
      unknown[];
  };

  message?:
    string;
}


/*
 * =========================================================
 * EMPTY SUMMARY
 * =========================================================
 */

export const emptyPipelineSummary:
  PipelineSummary = {

  total:
    0,

  new:
    0,

  financial_review:
    0,

  technical_review:
    0,

  approved:
    0,

  team_allocated:
    0,

  in_progress:
    0,

  completion_review:
    0,

  completed:
    0,

  rejected:
    0,

  changes_required:
    0,
};


/*
 * =========================================================
 * INTERNAL GENERIC RECORD
 * =========================================================
 */

type GenericRecord =
  Record<
    string,
    any
  >;


/*
 * =========================================================
 * STRING HELPER
 * =========================================================
 */

const stringOrNull =
  (
    value:
      unknown
  ):
    string | null => {

    if (
      value ===
        undefined ||
      value ===
        null
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
 * NUMBER HELPER
 * =========================================================
 */

const numberOrNull =
  (
    value:
      unknown
  ):
    number | null => {

    if (
      value ===
        undefined ||
      value ===
        null ||
      value ===
        ""
    ) {

      return null;
    }


    const parsed =
      Number(
        value
      );


    return Number.isFinite(
      parsed
    )
      ? parsed
      : null;
  };


/*
 * =========================================================
 * BOOLEAN HELPER
 * =========================================================
 */

const booleanValue =
  (
    value:
      unknown,

    fallback =
      true
  ) => {

    if (
      typeof value ===
      "boolean"
    ) {

      return value;
    }


    return fallback;
  };


/*
 * =========================================================
 * TEMPERATURE NORMALIZER
 * =========================================================
 */

const normalizeTemperature =
  (
    value:
      unknown
  ):
    PipelineLeadTemperature => {

    const normalized =
      String(
        value ??
        ""
      )
        .trim()
        .toLowerCase();


    if (
      normalized ===
      "hot"
    ) {

      return "hot";
    }


    return "cold";
  };


/*
 * =========================================================
 * REVIEW DECISION NORMALIZER
 *
 * THIS FIXES YOUR LEADSPAGE ERRORS.
 *
 * Instead of returning null:
 *
 * null
 * undefined
 * empty
 *
 * all become:
 *
 * "pending"
 * =========================================================
 */

const normalizeReviewDecision =
  (
    value:
      unknown
  ):
    PipelineReviewDecision => {

    const normalized =
      String(
        value ??
        ""
      )
        .trim()
        .toLowerCase()
        .replace(
          /[\s-]+/g,
          "_"
        );


    switch (
      normalized
    ) {

      case "approved":
      case "approve":
      case "accepted":
      case "accept":

        return "approved";


      case "rejected":
      case "reject":
      case "declined":
      case "decline":

        return "rejected";


      case "pending":
      case "pending_review":
      case "submitted":
      case "waiting":
      case "":
      default:

        return "pending";
    }
  };


/*
 * =========================================================
 * PIPELINE STAGE NORMALIZER
 * =========================================================
 */

const normalizePipelineStage =
  (
    value:
      unknown
  ):
    PipelineStage => {

    const normalized =
      String(
        value ??
        ""
      )
        .trim()
        .toLowerCase()
        .replace(
          /[\s-]+/g,
          "_"
        );


    switch (
      normalized
    ) {

      case "new":
      case "assigned":
      case "financial_review":
      case "financial_rejected":
      case "technical_review":
      case "technical_rejected":
      case "production_ready":
      case "approved":
      case "team_allocated":
      case "in_progress":
      case "completion_review":
      case "completed":

        return normalized;


      default:

        return "new";
    }
  };


/*
 * =========================================================
 * PIPELINE STATE NORMALIZER
 * =========================================================
 */

const normalizePipelineState =
  (
    value:
      unknown
  ):
    PipelineState => {

    const normalized =
      String(
        value ??
        ""
      )
        .trim()
        .toLowerCase()
        .replace(
          /[\s-]+/g,
          "_"
        );


    switch (
      normalized
    ) {

      case "approved":

        return "approved";


      case "rejected":

        return "rejected";


      case "active":

        return "active";


      case "changes_required":
      case "changes_requested":

        return "changes_required";


      case "completed":
      case "complete":
      case "done":

        return "completed";


      case "pending":
      default:

        return "pending";
    }
  };


/*
 * =========================================================
 * STAGE LABEL
 * =========================================================
 */

const getStageLabel =
  (
    stage:
      PipelineStage
  ) => {

    switch (
      stage
    ) {

      case "new":

        return "New Lead";


      case "assigned":

        return "Assigned";


      case "financial_review":

        return "Financial Review";


      case "financial_rejected":

        return "Financial Rejected";


      case "technical_review":

        return "Technical Review";


      case "technical_rejected":

        return "Technical Rejected";


      case "production_ready":

        return "Production Ready";


      case "approved":

        return "HOT / Approved";


      case "team_allocated":

        return "Team Allocated";


      case "in_progress":

        return "In Progress";


      case "completion_review":

        return "Completion Review";


      case "completed":

        return "Completed";


      default:

        return "New Lead";
    }
  };


/*
 * =========================================================
 * STAGE ORDER
 * =========================================================
 */

const getStageOrder =
  (
    stage:
      PipelineStage
  ) => {

    switch (
      stage
    ) {

      case "new":
      case "assigned":

        return 1;


      case "financial_review":
      case "financial_rejected":

        return 2;


      case "technical_review":
      case "technical_rejected":

        return 3;


      case "production_ready":
      case "approved":

        return 4;


      case "team_allocated":

        return 5;


      case "in_progress":

        return 6;


      case "completion_review":

        return 7;


      case "completed":

        return 8;


      default:

        return 1;
    }
  };


/*
 * =========================================================
 * FORMAT PIPELINE STATE
 * =========================================================
 */

export const formatPipelineState =
  (
    value:
      string |
      null |
      undefined
  ) => {

    if (
      !value
    ) {

      return "-";
    }


    return value
      .replace(
        /_/g,
        " "
      )
      .replace(
        /\b\w/g,
        (
          character
        ) =>
          character
            .toUpperCase()
      );
  };


/*
 * =========================================================
 * NORMALIZE PIPELINE LEAD
 * =========================================================
 */

const normalizePipelineLead =
  (
    rawValue:
      unknown
  ):
    PipelineLead => {

    const raw =
      (
        rawValue ??
        {}
      ) as GenericRecord;


    /*
     * -------------------------------------------------------
     * REVIEW DECISIONS
     * -------------------------------------------------------
     */

    const financialDecision =
      normalizeReviewDecision(
        raw.financial_decision
      );


    const technicalDecision =
      normalizeReviewDecision(
        raw.technical_decision
      );


    /*
     * -------------------------------------------------------
     * STAGE
     * -------------------------------------------------------
     */

    let pipelineStage =
      normalizePipelineStage(
        raw.pipeline_stage ??
        raw.workflow_stage
      );


    /*
     * Compatibility:
     *
     * If an older backend returned rejection only as a
     * decision, preserve the older rejection stage expected
     * by the existing Dashboard.
     */

    if (
      financialDecision ===
        "rejected" &&
      (
        pipelineStage ===
          "new" ||
        pipelineStage ===
          "financial_review"
      )
    ) {

      pipelineStage =
        "financial_rejected";
    }


    if (
      technicalDecision ===
        "rejected" &&
      (
        pipelineStage ===
          "technical_review" ||
        pipelineStage ===
          "approved"
      )
    ) {

      pipelineStage =
        "technical_rejected";
    }


    const temperature =
      normalizeTemperature(
        raw.status ??
        raw.temperature
      );


    const budget =
      numberOrNull(
        raw.budget ??
        raw.estimated_budget
      );


    const pipelineState =
      normalizePipelineState(
        raw.pipeline_state ??
        (
          financialDecision ===
            "rejected" ||
          technicalDecision ===
            "rejected"
            ? "rejected"
            : undefined
        )
      );


    return {
      /*
       * BASIC
       */

      id:
        String(
          raw.id ??
          ""
        ),

      title:
        String(
          raw.title ??
          raw.name ??
          "Untitled Lead"
        ),

      name:
        stringOrNull(
          raw.name ??
          raw.title
        ),

      description:
        stringOrNull(
          raw.description
        ),

      source:
        stringOrNull(
          raw.source
        ),


      /*
       * COMPANY
       */

      company_id:
        stringOrNull(
          raw.company_id
        ),

      company_name:
        stringOrNull(
          raw.company_name ??
          raw.company
            ?.name ??
          raw.companies
            ?.name ??
          raw.companies
            ?.[0]
            ?.name
        ),


      /*
       * BUDGET
       */

      budget,

      estimated_budget:
        budget,


      /*
       * HOT / COLD
       */

      status:
        temperature,

      temperature,


      /*
       * PIPELINE
       */

      workflow_stage:
        stringOrNull(
          raw.workflow_stage
        ),

      pipeline_stage:
        pipelineStage,

      pipeline_stage_label:
        stringOrNull(
          raw.pipeline_stage_label
        ) ??
        getStageLabel(
          pipelineStage
        ),

      pipeline_stage_order:
        typeof raw.pipeline_stage_order ===
        "number"
          ? raw.pipeline_stage_order
          : getStageOrder(
              pipelineStage
            ),

      pipeline_state:
        pipelineState,

      pipeline_state_label:
        stringOrNull(
          raw.pipeline_state_label
        ) ??
        formatPipelineState(
          pipelineState
        ),


      /*
       * FINANCIAL
       */

      financial_decision:
        financialDecision,

      financial_review_notes:
        stringOrNull(
          raw.financial_review_notes
        ),


      /*
       * TECHNICAL
       */

      technical_decision:
        technicalDecision,

      technical_review_notes:
        stringOrNull(
          raw.technical_review_notes
        ),


      /*
       * PROJECT
       */

      project_id:
        stringOrNull(
          raw.project_id
        ),

      project_status:
        stringOrNull(
          raw.project_status
        ),

      completion_review_status:
        stringOrNull(
          raw.completion_review_status
        ),

      completion_notes:
        stringOrNull(
          raw.completion_notes
        ),


      /*
       * DATES
       */

      created_at:
        stringOrNull(
          raw.created_at
        ),

      updated_at:
        stringOrNull(
          raw.updated_at
        ),

      expected_close_date:
        stringOrNull(
          raw.expected_close_date
        ),

      submitted_financial_at:
        stringOrNull(
          raw.submitted_financial_at
        ),

      submitted_technical_at:
        stringOrNull(
          raw.submitted_technical_at
        ),

      approved_at:
        stringOrNull(
          raw.approved_at
        ),

      project_started_at:
        stringOrNull(
          raw.project_started_at
        ),

      team_completed_at:
        stringOrNull(
          raw.team_completed_at
        ),

      completed_at:
        stringOrNull(
          raw.completed_at
        ),

      archived_at:
        stringOrNull(
          raw.archived_at
        ),

      last_update_at:
        stringOrNull(
          raw.last_update_at ??
          raw.updated_at ??
          raw.created_at
        ),


      /*
       * REJECTION
       */

      rejection_stage:
        raw.rejection_stage ===
          "financial" ||
        raw.rejection_stage ===
          "technical"
          ? raw.rejection_stage
          : financialDecision ===
              "rejected"
            ? "financial"
            : technicalDecision ===
                "rejected"
              ? "technical"
              : null,

      rejection_reason:
        stringOrNull(
          raw.rejection_reason
        ),
    };
  };


/*
 * =========================================================
 * NORMALIZE TEAM
 * =========================================================
 */

const normalizePipelineTeam =
  (
    rawValue:
      unknown
  ):
    PipelineTeam => {

    const raw =
      (
        rawValue ??
        {}
      ) as GenericRecord;


    return {
      id:
        String(
          raw.id ??
          ""
        ),

      name:
        String(
          raw.name ??
          "Unnamed Team"
        ),

      description:
        stringOrNull(
          raw.description
        ),

      created_by:
        stringOrNull(
          raw.created_by
        ),

      created_at:
        stringOrNull(
          raw.created_at
        ),

      updated_at:
        stringOrNull(
          raw.updated_at
        ),

      member_count:
        typeof raw.member_count ===
        "number"
          ? raw.member_count
          : undefined,
    };
  };


/*
 * =========================================================
 * NORMALIZE TEAM MEMBER
 * =========================================================
 */

const normalizePipelineTeamMember =
  (
    rawValue:
      unknown
  ):
    PipelineTeamMember => {

    const raw =
      (
        rawValue ??
        {}
      ) as GenericRecord;


    const profile =
      (
        raw.profile ??
        raw.profiles ??
        {}
      ) as GenericRecord;


    const id =
      String(
        raw.id ??
        raw.user_id ??
        profile.id ??
        ""
      );


    return {
      id,

      user_id:
        String(
          raw.user_id ??
          profile.id ??
          id
        ),

      full_name:
        stringOrNull(
          raw.full_name ??
          profile.full_name
        ),

      email:
        String(
          raw.email ??
          profile.email ??
          ""
        ),

      role:
        stringOrNull(
          raw.role ??
          profile.role
        ),

      availability_status:
        stringOrNull(
          raw.availability_status ??
          profile.availability_status
        ),

      is_active:
        booleanValue(
          raw.is_active ??
          profile.is_active,
          true
        ),
    };
  };


/*
 * =========================================================
 * ARRAY EXTRACTOR
 * =========================================================
 */

const extractArray =
  (
    value:
      unknown,

    possibleKeys:
      string[] =
      []
  ):
    unknown[] => {

    if (
      Array.isArray(
        value
      )
    ) {

      return value;
    }


    if (
      !value ||
      typeof value !==
      "object"
    ) {

      return [];
    }


    const record =
      value as GenericRecord;


    for (
      const key of
      possibleKeys
    ) {

      if (
        Array.isArray(
          record[key]
        )
      ) {

        return record[key];
      }
    }


    if (
      Array.isArray(
        record.data
      )
    ) {

      return record.data;
    }


    return [];
  };


/*
 * =========================================================
 * FETCH DASHBOARD PIPELINE
 *
 * GET /api/dashboard/pipeline
 * =========================================================
 */

export const fetchDashboardPipeline =
  async (): Promise<
    DashboardPipelineData
  > => {

    const response =
      await api.get<
        DashboardPipelineResponse
      >(
        "/dashboard/pipeline"
      );


    if (
      response.data
        ?.success ===
        false
    ) {

      throw new Error(
        response.data
          ?.message ||
        "Unable to load dashboard pipeline"
      );
    }


    const rawData =
      response.data
        ?.data;


    const rawLeads =
      Array.isArray(
        rawData?.leads
      )
        ? rawData.leads
        : [];


    const leads =
      rawLeads.map(
        normalizePipelineLead
      );


    const summary:
      PipelineSummary = {

      ...emptyPipelineSummary,

      ...(rawData
        ?.summary ??
        {}),

      total:
        rawData
          ?.summary
          ?.total ??
        leads.length,
    };


    return {
      summary,

      leads,
    };
  };


/*
 * =========================================================
 * FETCH ALL PIPELINE LEADS
 *
 * Existing DashboardPage uses this.
 * =========================================================
 */

export const fetchPipelineLeads =
  async (): Promise<
    PipelineLead[]
  > => {

    const data =
      await fetchDashboardPipeline();


    return data.leads;
  };


/*
 * =========================================================
 * FETCH PRODUCTION-READY LEADS
 *
 * Existing:
 *
 * - Approved Lead Board
 * - Team Allocation
 *
 * use this function.
 * =========================================================
 */

export const fetchProductionReadyLeads =
  async (): Promise<
    PipelineLead[]
  > => {

    const data =
      await fetchDashboardPipeline();


    return data.leads.filter(
      (
        lead
      ) => {

        /*
         * Legacy pipeline.
         */

        if (
          lead.pipeline_stage ===
          "production_ready"
        ) {

          return true;
        }


        /*
         * New pipeline.
         */

        if (
          lead.pipeline_stage ===
          "approved"
        ) {

          return true;
        }


        /*
         * Compatibility fallback.
         */

        return (
          lead.status ===
            "hot" &&
          lead.financial_decision ===
            "approved" &&
          lead.technical_decision ===
            "approved" &&
          !lead.project_id
        );
      }
    );
  };


/*
 * =========================================================
 * FETCH TEAMS
 *
 * Existing TeamAllocationPage uses this.
 *
 * GET /api/teams
 * =========================================================
 */

export const fetchPipelineTeams =
  async (): Promise<
    PipelineTeam[]
  > => {

    const response =
      await api.get(
        "/teams"
      );


    const payload =
      response.data
        ?.data ??
      response.data;


    const rows =
      extractArray(
        payload,
        [
          "teams",
        ]
      );


    return rows
      .map(
        normalizePipelineTeam
      )
      .filter(
        (
          team
        ) =>
          Boolean(
            team.id
          )
      );
  };


/*
 * =========================================================
 * FETCH AVAILABLE TEAM MEMBERS
 *
 * Existing TeamAllocationPage uses this.
 *
 * GET /api/team-members/available
 * =========================================================
 */

export const fetchPipelineTeamMembers =
  async (): Promise<
    PipelineTeamMember[]
  > => {

    const response =
      await api.get(
        "/team-members/available"
      );


    const payload =
      response.data
        ?.data ??
      response.data;


    const rows =
      extractArray(
        payload,
        [
          "members",
          "users",
          "team_members",
        ]
      );


    return rows
      .map(
        normalizePipelineTeamMember
      )
      .filter(
        (
          member
        ) =>
          Boolean(
            member.id
          )
      );
  };


/*
 * =========================================================
 * FETCH PIPELINE SUMMARY
 * =========================================================
 */

export const fetchPipelineSummary =
  async (): Promise<
    PipelineSummary
  > => {

    const data =
      await fetchDashboardPipeline();


    return data.summary;
  };


/*
 * =========================================================
 * DASHBOARD PIPELINE ORDER
 * =========================================================
 */

export const pipelineStageOrder:
  DashboardPipelineStage[] = [

  "new",

  "financial_review",

  "technical_review",

  "approved",

  "team_allocated",

  "in_progress",

  "completion_review",

  "completed",
];


/*
 * =========================================================
 * DASHBOARD PIPELINE LABELS
 * =========================================================
 */

export const pipelineStageLabels:
  Record<
    DashboardPipelineStage,
    string
  > = {

  new:
    "New Lead",

  financial_review:
    "Financial Review",

  technical_review:
    "Technical Review",

  approved:
    "HOT / Approved",

  team_allocated:
    "Team Allocated",

  in_progress:
    "In Progress",

  completion_review:
    "Completion Review",

  completed:
    "Completed",
};


/*
 * =========================================================
 * GET STAGE COUNT
 * =========================================================
 */

export const getPipelineStageCount =
  (
    summary:
      PipelineSummary,

    stage:
      DashboardPipelineStage
  ):
    number => {

    switch (
      stage
    ) {

      case "new":

        return summary.new;


      case "financial_review":

        return summary
          .financial_review;


      case "technical_review":

        return summary
          .technical_review;


      case "approved":

        return summary.approved;


      case "team_allocated":

        return summary
          .team_allocated;


      case "in_progress":

        return summary
          .in_progress;


      case "completion_review":

        return summary
          .completion_review;


      case "completed":

        return summary.completed;


      default:

        return 0;
    }
  };


/*
 * =========================================================
 * FORMAT PIPELINE DATE
 * =========================================================
 */

export const formatPipelineDate =
  (
    value:
      string |
      null |
      undefined
  ) => {

    if (
      !value
    ) {

      return "-";
    }


    const date =
      new Date(
        value
      );


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return "-";
    }


    return date
      .toLocaleString(
        [],
        {
          year:
            "numeric",

          month:
            "short",

          day:
            "numeric",

          hour:
            "2-digit",

          minute:
            "2-digit",
        }
      );
  };