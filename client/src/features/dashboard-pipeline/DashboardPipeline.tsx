import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "../../lib/supabase";

import "./dashboardPipeline.css";

/*
 * =========================================================
 * TYPES
 * =========================================================
 */

type PipelineStageKey =
  | "created"
  | "sales-assigned"
  | "financial-review"
  | "technical-review"
  | "approved"
  | "lead-board"
  | "team-allocation"
  | "project-progress"
  | "completed";

type PipelineStage = {
  key: PipelineStageKey;
  label: string;
  shortLabel: string;
};

type LeadRecord = {
  id: string;
  title: string;
  companyName: string;

  status?: string;
  leadStatus?: string;
  workflowStatus?: string;
  pipelineStage?: string;

  financialStatus?: string;
  financialApprovalStatus?: string;

  technicalStatus?: string;
  technicalApprovalStatus?: string;

  leadBoardStatus?: string;

  projectStatus?: string;
  teamProgressStatus?: string;

  assignedTo?: unknown;
  assignedSalesRep?: unknown;
  salesRepresentative?: unknown;

  team?: unknown;
  teamId?: unknown;

  [key: string]: unknown;
};

/*
 * =========================================================
 * PIPELINE STAGES
 * =========================================================
 */

const PIPELINE_STAGES: PipelineStage[] = [
  {
    key: "created",
    label: "Lead Created",
    shortLabel: "Created",
  },
  {
    key: "sales-assigned",
    label: "Assigned to Sales Representative",
    shortLabel: "Sales Rep",
  },
  {
    key: "financial-review",
    label: "Financial Review",
    shortLabel: "Finance",
  },
  {
    key: "technical-review",
    label: "Technical Review",
    shortLabel: "Technical",
  },
  {
    key: "approved",
    label: "Lead Approved",
    shortLabel: "Approved",
  },
  {
    key: "lead-board",
    label: "Lead Board",
    shortLabel: "Lead Board",
  },
  {
    key: "team-allocation",
    label: "Team Allocation",
    shortLabel: "Team",
  },
  {
    key: "project-progress",
    label: "Project Progress",
    shortLabel: "Progress",
  },
  {
    key: "completed",
    label: "Project Completed",
    shortLabel: "Completed",
  },
];

/*
 * =========================================================
 * API
 * =========================================================
 */

const API_BASE_URL = String(
  import.meta.env.VITE_API_URL ?? ""
).replace(/\/+$/, "");

const LEADS_API_URL =
  `${API_BASE_URL}/dashboard/pipeline`;

/*
 * =========================================================
 * HELPERS
 * =========================================================
 */

const normalizeValue = (
  value: unknown
): string => {
  if (
    value === undefined ||
    value === null
  ) {
    return "";
  }

  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
};

const getLeadId = (
  lead: Record<string, unknown>
): string => {
  return String(
    lead.id ??
      lead.leadId ??
      lead.lead_id ??
      lead._id ??
      ""
  );
};

const getLeadTitle = (
  lead: Record<string, unknown>
): string => {
  return String(
    lead.title ??
      lead.leadTitle ??
      lead.lead_title ??
      lead.name ??
      "Untitled Lead"
  );
};

const getCompanyName = (
  lead: Record<string, unknown>
): string => {
  const company = lead.company;

  if (
    company &&
    typeof company === "object"
  ) {
    const companyObject =
      company as Record<
        string,
        unknown
      >;

    return String(
      companyObject.name ??
        companyObject.companyName ??
        companyObject.company_name ??
        "Unknown Company"
    );
  }

  return String(
    lead.companyName ??
      lead.company_name ??
      lead.company ??
      "Unknown Company"
  );
};

const normalizeLead = (
  lead: Record<string, unknown>
): LeadRecord => {
  return {
    ...lead,

    id: getLeadId(lead),

    title:
      getLeadTitle(lead),

    companyName:
      getCompanyName(lead),

    status: String(
      lead.status ?? ""
    ),

    leadStatus: String(
      lead.leadStatus ??
        lead.lead_status ??
        ""
    ),

    workflowStatus: String(
      lead.workflowStatus ??
        lead.workflow_status ??
        ""
    ),

    pipelineStage: String(
      lead.pipelineStage ??
        lead.pipeline_stage ??
        ""
    ),

    financialStatus: String(
      lead.financialStatus ??
        lead.financial_status ??
        ""
    ),

    financialApprovalStatus:
      String(
        lead.financialApprovalStatus ??
          lead.financial_approval_status ??
          ""
      ),

    technicalStatus: String(
      lead.technicalStatus ??
        lead.technical_status ??
        ""
    ),

    technicalApprovalStatus:
      String(
        lead.technicalApprovalStatus ??
          lead.technical_approval_status ??
          ""
      ),

    leadBoardStatus: String(
      lead.leadBoardStatus ??
        lead.lead_board_status ??
        ""
    ),

    projectStatus: String(
      lead.projectStatus ??
        lead.project_status ??
        ""
    ),

    teamProgressStatus: String(
      lead.teamProgressStatus ??
        lead.team_progress_status ??
        ""
    ),
  };
};

/*
 * =========================================================
 * CURRENT PIPELINE STAGE
 * =========================================================
 */

const getCurrentStage = (
  lead: LeadRecord
): PipelineStageKey => {
  const explicitStage =
    normalizeValue(
      lead.pipelineStage
    );

  const workflowStatus =
    normalizeValue(
      lead.workflowStatus
    );

  const leadStatus =
    normalizeValue(
      lead.leadStatus ||
        lead.status
    );

  const financialStatus =
    normalizeValue(
      lead.financialApprovalStatus ||
        lead.financialStatus
    );

  const technicalStatus =
    normalizeValue(
      lead.technicalApprovalStatus ||
        lead.technicalStatus
    );

  const leadBoardStatus =
    normalizeValue(
      lead.leadBoardStatus
    );

  const projectStatus =
    normalizeValue(
      lead.projectStatus ||
        lead.teamProgressStatus
    );

  /*
   * COMPLETED
   */

  if (
    [
      explicitStage,
      workflowStatus,
      projectStatus,
      leadBoardStatus,
    ].some((value) =>
      [
        "completed",
        "complete",
        "done",
        "project_completed",
      ].includes(value)
    )
  ) {
    return "completed";
  }

  /*
   * PROJECT PROGRESS
   */

  if (
    [
      explicitStage,
      workflowStatus,
      projectStatus,
    ].some((value) =>
      [
        "project_progress",
        "progress",
        "in_progress",
        "ongoing",
        "on_hold",
      ].includes(value)
    )
  ) {
    return "project-progress";
  }

  /*
   * TEAM ALLOCATION
   */

  if (
    explicitStage ===
      "team_allocation" ||
    workflowStatus ===
      "team_allocation" ||
    leadBoardStatus ===
      "assigned" ||
    Boolean(lead.teamId) ||
    Boolean(lead.team)
  ) {
    return "team-allocation";
  }

  /*
   * LEAD BOARD
   */

  if (
    [
      explicitStage,
      workflowStatus,
      leadBoardStatus,
    ].some((value) =>
      [
        "lead_board",
        "pending",
        "planned",
      ].includes(value)
    )
  ) {
    return "lead-board";
  }

  /*
   * APPROVED
   */

  if (
    [
      explicitStage,
      workflowStatus,
      leadStatus,
    ].some((value) =>
      [
        "approved",
        "hot",
        "hot_approved",
        "fully_approved",
      ].includes(value)
    ) ||
    (
      financialStatus ===
        "approved" &&
      technicalStatus ===
        "approved"
    )
  ) {
    return "approved";
  }

  /*
   * TECHNICAL REVIEW
   */

  if (
    [
      explicitStage,
      workflowStatus,
      leadStatus,
    ].some((value) =>
      [
        "technical_review",
        "technical_pending",
        "waiting_for_technical_review",
        "waiting_technical_review",
      ].includes(value)
    ) ||
    (
      financialStatus ===
        "approved" &&
      technicalStatus !==
        "approved"
    )
  ) {
    return "technical-review";
  }

  /*
   * FINANCIAL REVIEW
   */

  if (
    [
      explicitStage,
      workflowStatus,
      leadStatus,
    ].some((value) =>
      [
        "financial_review",
        "financial_pending",
        "waiting_for_financial_review",
        "waiting_financial_review",
      ].includes(value)
    )
  ) {
    return "financial-review";
  }

  /*
   * SALES REPRESENTATIVE ASSIGNED
   */

  if (
    explicitStage ===
      "sales_assigned" ||
    workflowStatus ===
      "sales_assigned" ||
    leadStatus ===
      "cold" ||
    leadStatus ===
      "assigned" ||
    Boolean(
      lead.assignedTo
    ) ||
    Boolean(
      lead.assignedSalesRep
    ) ||
    Boolean(
      lead.salesRepresentative
    )
  ) {
    return "sales-assigned";
  }

  return "created";
};

const getStageIndex = (
  stage: PipelineStageKey
): number => {
  return PIPELINE_STAGES.findIndex(
    (item) =>
      item.key === stage
  );
};

const getStageLabel = (
  stage: PipelineStageKey
): string => {
  return (
    PIPELINE_STAGES.find(
      (item) =>
        item.key === stage
    )?.label ??
    "Unknown"
  );
};

/*
 * =========================================================
 * API RESPONSE
 * =========================================================
 */

const extractLeads = (
  response: unknown
): Record<
  string,
  unknown
>[] => {
  /*
   * API returns array directly
   */

  if (
    Array.isArray(response)
  ) {
    return response;
  }

  if (
    response &&
    typeof response ===
      "object"
  ) {
    const object =
      response as Record<
        string,
        unknown
      >;

    /*
     * {
     *   leads: [...]
     * }
     */

    if (
      Array.isArray(
        object.leads
      )
    ) {
      return object.leads;
    }

    /*
     * {
     *   pipeline: [...]
     * }
     */

    if (
      Array.isArray(
        object.pipeline
      )
    ) {
      return object.pipeline;
    }

    /*
     * {
     *   data: [...]
     * }
     */

    if (
      Array.isArray(
        object.data
      )
    ) {
      return object.data;
    }

    /*
     * {
     *   data: {
     *     leads: [...]
     *   }
     * }
     */

    if (
      object.data &&
      typeof object.data ===
        "object"
    ) {
      const data =
        object.data as Record<
          string,
          unknown
        >;

      if (
        Array.isArray(
          data.leads
        )
      ) {
        return data.leads;
      }

      /*
       * {
       *   data: {
       *     pipeline: [...]
       *   }
       * }
       */

      if (
        Array.isArray(
          data.pipeline
        )
      ) {
        return data.pipeline;
      }
    }
  }

  return [];
};

/*
 * =========================================================
 * COMPONENT
 * =========================================================
 */

export default function DashboardPipeline() {
  const [
    leads,
    setLeads,
  ] = useState<
    LeadRecord[]
  >([]);

  const [
    selectedLeadId,
    setSelectedLeadId,
  ] = useState("");

  const [
    minimized,
    setMinimized,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  /*
   * =======================================================
   * LOAD DASHBOARD PIPELINE
   * =======================================================
   */

  useEffect(() => {
    let cancelled = false;

    const loadLeads =
      async () => {
        try {
          setLoading(true);
          setError("");

          /*
           * ===============================================
           * GET CURRENT SUPABASE SESSION
           * ===============================================
           *
           * Backend requireAuth expects:
           *
           * Authorization: Bearer <access_token>
           * ===============================================
           */

          const {
            data: {
              session,
            },
            error:
              sessionError,
          } =
            await supabase.auth.getSession();

          if (
            sessionError
          ) {
            console.error(
              "SUPABASE SESSION ERROR:",
              sessionError
            );

            throw new Error(
              "Unable to verify your login session."
            );
          }

          if (
            !session ||
            !session.access_token
          ) {
            throw new Error(
              "Your login session was not found. Please log in again."
            );
          }

          /*
           * ===============================================
           * REQUEST PIPELINE
           * ===============================================
           */

          const response =
            await fetch(
              LEADS_API_URL,
              {
                method: "GET",

                headers: {
                  Accept:
                    "application/json",

                  Authorization:
                    `Bearer ${session.access_token}`,
                },
              }
            );

          /*
           * Read JSON response.
           */

          const responseData:
            unknown =
            await response
              .json()
              .catch(
                () => ({})
              );

          /*
           * ===============================================
           * HANDLE API ERROR
           * ===============================================
           */

          if (
            !response.ok
          ) {
            let message =
              `Unable to load leads. Server returned ${response.status}.`;

            if (
              responseData &&
              typeof responseData ===
                "object" &&
              "message" in
                responseData
            ) {
              const apiMessage =
                (
                  responseData as {
                    message?: unknown;
                  }
                ).message;

              if (
                typeof apiMessage ===
                  "string" &&
                apiMessage.trim()
              ) {
                message =
                  apiMessage;
              }
            }

            throw new Error(
              message
            );
          }

          /*
           * ===============================================
           * EXTRACT LEADS
           * ===============================================
           */

          const leadData =
            extractLeads(
              responseData
            );

          const normalized =
            leadData
              .map(
                normalizeLead
              )
              .filter(
                (lead) =>
                  Boolean(
                    lead.id
                  )
              );

          if (
            cancelled
          ) {
            return;
          }

          setLeads(
            normalized
          );

          /*
           * Select first lead automatically.
           */

          if (
            normalized.length >
            0
          ) {
            setSelectedLeadId(
              (
                previous
              ) =>
                previous ||
                normalized[0]
                  .id
            );
          } else {
            setSelectedLeadId(
              ""
            );
          }
        } catch (
          loadError
        ) {
          if (
            cancelled
          ) {
            return;
          }

          console.error(
            "PIPELINE ERROR:",
            loadError
          );

          setError(
            loadError instanceof
              Error
              ? loadError.message
              : "Unable to load pipeline."
          );

          setLeads([]);
        } finally {
          if (
            !cancelled
          ) {
            setLoading(false);
          }
        }
      };

    void loadLeads();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * =======================================================
   * SELECTED LEAD
   * =======================================================
   */

  const selectedLead =
    useMemo(() => {
      return (
        leads.find(
          (lead) =>
            lead.id ===
            selectedLeadId
        ) ?? null
      );
    }, [
      leads,
      selectedLeadId,
    ]);

  const currentStage =
    selectedLead
      ? getCurrentStage(
          selectedLead
        )
      : null;

  const currentStageIndex =
    currentStage
      ? getStageIndex(
          currentStage
        )
      : -1;

  /*
   * =======================================================
   * PAGE
   * =======================================================
   */

  return (
    <div className="dashboard-pipeline-page">
      {/*
       * ===================================================
       * HEADER
       * ===================================================
       */}

      <div className="pipeline-page-header">
        <div>
          <p className="pipeline-eyebrow">
            LEAD MANAGEMENT
          </p>

          <h1>
            Lead Pipeline
          </h1>

          <p className="pipeline-description">
            Select a lead to
            view its current
            position in the CRM
            process.
          </p>
        </div>

        <div className="pipeline-total-card">
          <strong>
            {leads.length}
          </strong>

          <span>
            Total Leads
          </span>
        </div>
      </div>

      {/*
       * ===================================================
       * LOADING
       * ===================================================
       */}

      {loading && (
        <div className="pipeline-message">
          Loading leads...
        </div>
      )}

      {/*
       * ===================================================
       * ERROR
       * ===================================================
       */}

      {!loading &&
        error && (
          <div className="pipeline-message pipeline-error">
            {error}
          </div>
        )}

      {/*
       * ===================================================
       * MAIN
       * ===================================================
       */}

      {!loading &&
        !error && (
          <div className="pipeline-content">
            {/*
             * ===============================================
             * LEAD LIST
             * ===============================================
             */}

            <aside className="pipeline-leads-card">
              <div className="pipeline-leads-header">
                <div>
                  <h2>
                    Leads
                  </h2>

                  <p>
                    Hover to see
                    current status
                  </p>
                </div>

                <span className="pipeline-count">
                  {
                    leads.length
                  }
                </span>
              </div>

              <div className="pipeline-leads-list">
                {leads.length ===
                  0 && (
                  <div className="pipeline-empty">
                    No leads
                    available.
                  </div>
                )}

                {leads.map(
                  (lead) => {
                    const stage =
                      getCurrentStage(
                        lead
                      );

                    const isSelected =
                      selectedLeadId ===
                      lead.id;

                    return (
                      <button
                        key={
                          lead.id
                        }
                        type="button"
                        className={`pipeline-lead-row ${
                          isSelected
                            ? "active"
                            : ""
                        }`}
                        onClick={() => {
                          setSelectedLeadId(
                            lead.id
                          );

                          setMinimized(
                            false
                          );
                        }}
                      >
                        <div className="pipeline-lead-avatar">
                          {lead.title
                            .charAt(
                              0
                            )
                            .toUpperCase()}
                        </div>

                        <div className="pipeline-lead-details">
                          <strong>
                            {
                              lead.title
                            }
                          </strong>

                          <span>
                            {
                              lead.companyName
                            }
                          </span>
                        </div>

                        <span className="pipeline-arrow">
                          ›
                        </span>

                        {/*
                         * Hover status
                         */}

                        <div className="pipeline-hover-status">
                          <small>
                            Current
                            Status
                          </small>

                          <strong>
                            {getStageLabel(
                              stage
                            )}
                          </strong>
                        </div>
                      </button>
                    );
                  }
                )}
              </div>
            </aside>

            {/*
             * ===============================================
             * PIPELINE DIAGRAM
             * ===============================================
             */}

            <section
              className={`pipeline-detail-card ${
                minimized
                  ? "minimized"
                  : ""
              }`}
            >
              {selectedLead ? (
                <>
                  <div className="pipeline-detail-header">
                    <div>
                      <p className="selected-lead-label">
                        SELECTED LEAD
                      </p>

                      <h2>
                        {
                          selectedLead.title
                        }
                      </h2>

                      <p>
                        {
                          selectedLead.companyName
                        }
                      </p>
                    </div>

                    <div className="pipeline-detail-actions">
                      {currentStage && (
                        <div className="current-stage-box">
                          <span>
                            Current
                            Stage
                          </span>

                          <strong>
                            {getStageLabel(
                              currentStage
                            )}
                          </strong>
                        </div>
                      )}

                      <button
                        type="button"
                        className="pipeline-minimize-btn"
                        onClick={() =>
                          setMinimized(
                            (
                              previous
                            ) =>
                              !previous
                          )
                        }
                        title={
                          minimized
                            ? "Expand pipeline"
                            : "Minimize pipeline"
                        }
                      >
                        {minimized
                          ? "+"
                          : "−"}
                      </button>
                    </div>
                  </div>

                  {!minimized && (
                    <>
                      <div className="pipeline-divider" />

                      <div className="pipeline-scroll-area">
                        <div className="pipeline-flow">
                          {PIPELINE_STAGES.map(
                            (
                              stage,
                              index
                            ) => {
                              const completed =
                                index <
                                currentStageIndex;

                              const current =
                                index ===
                                currentStageIndex;

                              const upcoming =
                                index >
                                currentStageIndex;

                              return (
                                <div
                                  key={
                                    stage.key
                                  }
                                  className="pipeline-stage-container"
                                >
                                  <div
                                    className={`pipeline-stage-card ${
                                      completed
                                        ? "completed"
                                        : ""
                                    } ${
                                      current
                                        ? "current"
                                        : ""
                                    } ${
                                      upcoming
                                        ? "upcoming"
                                        : ""
                                    }`}
                                  >
                                    {current && (
                                      <span className="current-badge">
                                        CURRENT
                                      </span>
                                    )}

                                    <div className="stage-circle">
                                      {completed
                                        ? "✓"
                                        : index +
                                          1}
                                    </div>

                                    <span className="stage-number-label">
                                      Stage{" "}
                                      {index +
                                        1}
                                    </span>

                                    <strong>
                                      {
                                        stage.shortLabel
                                      }
                                    </strong>
                                  </div>

                                  {index <
                                    PIPELINE_STAGES.length -
                                      1 && (
                                    <div
                                      className={`pipeline-line ${
                                        index <
                                        currentStageIndex
                                          ? "completed"
                                          : ""
                                      }`}
                                    >
                                      <span />
                                    </div>
                                  )}
                                </div>
                              );
                            }
                          )}
                        </div>
                      </div>

                      <div className="pipeline-legend">
                        <div>
                          <span className="legend-circle completed" />

                          Completed
                        </div>

                        <div>
                          <span className="legend-circle current" />

                          Current Stage
                        </div>

                        <div>
                          <span className="legend-circle upcoming" />

                          Upcoming
                        </div>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="pipeline-select-message">
                  <div className="select-icon">
                    →
                  </div>

                  <h2>
                    Select a Lead
                  </h2>

                  <p>
                    Select a lead
                    from the list to
                    view its
                    pipeline.
                  </p>
                </div>
              )}
            </section>
          </div>
        )}
    </div>
  );
}