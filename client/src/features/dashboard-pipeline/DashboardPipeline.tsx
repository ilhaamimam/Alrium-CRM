import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  fetchDashboardPipeline,
  formatPipelineDate,
  getPipelineStageCount,
  pipelineStageLabels,
  pipelineStageOrder,
  type DashboardPipelineStage,
  type PipelineLead,
  type PipelineSummary,
} from "../../api/pipeline.api";

import "./dashboardPipeline.css";


const EMPTY_SUMMARY: PipelineSummary = {
  total: 0,
  new: 0,
  financial_review: 0,
  technical_review: 0,
  approved: 0,
  team_allocated: 0,
  in_progress: 0,
  completion_review: 0,
  completed: 0,
  rejected: 0,
  changes_required: 0,
};


type PipelineFilter =
  | "all"
  | DashboardPipelineStage
  | "rejected"
  | "changes_required";


export default function DashboardPipeline() {
  /*
   * =========================================================
   * DATA
   * =========================================================
   */

  const [
    leads,
    setLeads,
  ] =
    useState<PipelineLead[]>(
      []
    );


  const [
    summary,
    setSummary,
  ] =
    useState<PipelineSummary>({
      ...EMPTY_SUMMARY,
    });


  /*
   * =========================================================
   * UI STATE
   * =========================================================
   */

  const [
    loading,
    setLoading,
  ] =
    useState(true);


  const [
    refreshing,
    setRefreshing,
  ] =
    useState(false);


  const [
    error,
    setError,
  ] =
    useState("");


  const [
    selectedStage,
    setSelectedStage,
  ] =
    useState<PipelineFilter>(
      "all"
    );


  const [
    search,
    setSearch,
  ] =
    useState("");


  /*
   * =========================================================
   * LOAD PIPELINE
   * =========================================================
   */

  const loadPipeline =
    useCallback(
      async (
        silent =
          false
      ) => {

        try {

          if (
            silent
          ) {

            setRefreshing(
              true
            );

          } else {

            setLoading(
              true
            );
          }


          setError("");


          const data =
            await fetchDashboardPipeline();


          setLeads(
            data.leads
          );


          setSummary(
            data.summary
          );

        } catch (error) {

          console.error(
            "DASHBOARD PIPELINE LOAD ERROR:",
            error
          );


          setError(
            error instanceof Error
              ? error.message
              : "Unable to load pipeline"
          );

        } finally {

          setLoading(
            false
          );

          setRefreshing(
            false
          );
        }
      },
      []
    );


  /*
   * =========================================================
   * INITIAL LOAD
   * =========================================================
   */

  useEffect(() => {

    void loadPipeline();

  }, [
    loadPipeline,
  ]);


  /*
   * =========================================================
   * AUTOMATIC REFRESH
   *
   * Refresh every 15 seconds.
   *
   * So if:
   *
   * - Finance approves
   * - Technical approves
   * - Team Allocation happens
   * - Project starts
   * - Completion is submitted
   * - Completion is confirmed
   *
   * the Dashboard automatically catches up.
   * =========================================================
   */

  useEffect(() => {

    const timer =
      window.setInterval(
        () => {

          void loadPipeline(
            true
          );

        },
        15000
      );


    return () => {

      window.clearInterval(
        timer
      );
    };

  }, [
    loadPipeline,
  ]);


  /*
   * =========================================================
   * FILTERED LEADS
   * =========================================================
   */

  const filteredLeads =
    useMemo(
      () => {

        const normalizedSearch =
          search
            .trim()
            .toLowerCase();


        return leads.filter(
          (
            lead
          ) => {

            /*
             * Stage filter
             */

            if (
              selectedStage ===
              "rejected"
            ) {

              if (
                lead.pipeline_state !==
                "rejected"
              ) {

                return false;
              }

            } else if (
              selectedStage ===
              "changes_required"
            ) {

              if (
                lead.pipeline_state !==
                "changes_required"
              ) {

                return false;
              }

            } else if (
              selectedStage !==
              "all"
            ) {

              if (
                lead.pipeline_stage !==
                selectedStage
              ) {

                return false;
              }
            }


            /*
             * Search filter
             */

            if (
              normalizedSearch
            ) {

              const searchable =
                [
                  lead.title,
                  lead.name,
                  lead.company_name,
                  lead.pipeline_stage_label,
                  lead.pipeline_state_label,
                  lead.financial_decision,
                  lead.technical_decision,
                ]
                  .filter(
                    Boolean
                  )
                  .join(" ")
                  .toLowerCase();


              if (
                !searchable.includes(
                  normalizedSearch
                )
              ) {

                return false;
              }
            }


            return true;
          }
        );

      },
      [
        leads,
        search,
        selectedStage,
      ]
    );


  /*
   * =========================================================
   * CURRENT FILTER TITLE
   * =========================================================
   */

  const currentFilterTitle =
    useMemo(
      () => {

        if (
          selectedStage ===
          "all"
        ) {

          return "All Leads";
        }


        if (
          selectedStage ===
          "rejected"
        ) {

          return "Rejected Leads";
        }


        if (
          selectedStage ===
          "changes_required"
        ) {

          return "Changes Required";
        }


        return pipelineStageLabels[
          selectedStage
        ];

      },
      [
        selectedStage,
      ]
    );


  /*
   * =========================================================
   * LOADING
   * =========================================================
   */

  if (
    loading
  ) {

    return (

      <section className="dashboard-pipeline-shell">

        <div className="dashboard-pipeline-loading">

          Loading lead pipeline...

        </div>

      </section>
    );
  }


  /*
   * =========================================================
   * UI
   * =========================================================
   */

  return (

    <section className="dashboard-pipeline-shell">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="dashboard-pipeline-heading">

        <div>

          <span className="dashboard-pipeline-eyebrow">
            Live CRM Workflow
          </span>


          <h2>
            Lead Pipeline
          </h2>


          <p>
            Track every lead from creation through
            financial review, technical review,
            allocation, delivery and completion.
          </p>

        </div>


        <div className="dashboard-pipeline-heading-actions">

          {refreshing && (

            <span className="dashboard-pipeline-refreshing">
              Updating...
            </span>

          )}


          <button
            type="button"
            onClick={() =>
              void loadPipeline(
                true
              )
            }
            disabled={
              refreshing
            }
          >

            Refresh

          </button>

        </div>

      </div>


      {/* =====================================================
          ERROR
      ====================================================== */}

      {error && (

        <div className="dashboard-pipeline-error">

          {error}

        </div>

      )}


      {/* =====================================================
          MAIN ARROW PIPELINE
      ====================================================== */}

      <div className="dashboard-pipeline-scroll">

        <div className="dashboard-pipeline-track">

          {pipelineStageOrder.map(
            (
              stage,
              index
            ) => {

              const count =
                getPipelineStageCount(
                  summary,
                  stage
                );


              const active =
                selectedStage ===
                stage;


              return (

                <button
                  key={
                    stage
                  }
                  type="button"
                  className={
                    [
                      "dashboard-pipeline-stage",

                      `dashboard-pipeline-stage-${index + 1}`,

                      active
                        ? "dashboard-pipeline-stage-active"
                        : "",
                    ]
                      .filter(
                        Boolean
                      )
                      .join(" ")
                  }
                  onClick={() =>
                    setSelectedStage(
                      active
                        ? "all"
                        : stage
                    )
                  }
                >

                  <span className="dashboard-pipeline-stage-number">

                    {index + 1}

                  </span>


                  <span className="dashboard-pipeline-stage-copy">

                    <strong>

                      {pipelineStageLabels[
                        stage
                      ]}

                    </strong>


                    <small>

                      {count}{" "}
                      {count ===
                      1
                        ? "lead"
                        : "leads"}

                    </small>

                  </span>

                </button>
              );
            }
          )}

        </div>

      </div>


      {/* =====================================================
          SUMMARY
      ====================================================== */}

      <div className="dashboard-pipeline-summary">

        <button
          type="button"
          className={
            selectedStage ===
            "all"
              ? "dashboard-pipeline-stat dashboard-pipeline-stat-active"
              : "dashboard-pipeline-stat"
          }
          onClick={() =>
            setSelectedStage(
              "all"
            )
          }
        >

          <span>
            Total Leads
          </span>


          <strong>
            {summary.total}
          </strong>

        </button>


        <button
          type="button"
          className={
            selectedStage ===
            "rejected"
              ? "dashboard-pipeline-stat dashboard-pipeline-stat-active"
              : "dashboard-pipeline-stat"
          }
          onClick={() =>
            setSelectedStage(
              "rejected"
            )
          }
        >

          <span>
            Rejected
          </span>


          <strong>
            {summary.rejected}
          </strong>

        </button>


        <button
          type="button"
          className={
            selectedStage ===
            "changes_required"
              ? "dashboard-pipeline-stat dashboard-pipeline-stat-active"
              : "dashboard-pipeline-stat"
          }
          onClick={() =>
            setSelectedStage(
              "changes_required"
            )
          }
        >

          <span>
            Changes Required
          </span>


          <strong>
            {
              summary
                .changes_required
            }
          </strong>

        </button>


        <div className="dashboard-pipeline-stat">

          <span>
            Completed
          </span>


          <strong>
            {summary.completed}
          </strong>

        </div>

      </div>


      {/* =====================================================
          SEARCH + CURRENT FILTER
      ====================================================== */}

      <div className="dashboard-pipeline-toolbar">

        <div>

          <span>
            Showing
          </span>


          <strong>
            {currentFilterTitle}
          </strong>

        </div>


        <input
          type="search"
          value={
            search
          }
          onChange={(
            event
          ) =>
            setSearch(
              event.target.value
            )
          }
          placeholder="Search lead or company..."
        />

      </div>


      {/* =====================================================
          LEAD LIST
      ====================================================== */}

      <div className="dashboard-pipeline-leads">

        {filteredLeads.length ===
        0 ? (

          <div className="dashboard-pipeline-empty">

            No leads found for this pipeline stage.

          </div>

        ) : (

          filteredLeads.map(
            (
              lead
            ) => (

              <PipelineLeadRow
                key={
                  lead.id
                }
                lead={
                  lead
                }
              />

            )
          )

        )}

      </div>

    </section>
  );
}


/*
 * =========================================================
 * PIPELINE LEAD ROW
 * =========================================================
 */

function PipelineLeadRow({
  lead,
}: {
  lead:
    PipelineLead;
}) {

  return (

    <article className="dashboard-pipeline-lead">

      {/* ===================================================
          LEAD
      ==================================================== */}

      <div className="dashboard-pipeline-lead-main">

        <div
          className={
            lead.status ===
            "hot"
              ? "dashboard-pipeline-temperature dashboard-pipeline-temperature-hot"
              : "dashboard-pipeline-temperature dashboard-pipeline-temperature-cold"
          }
        >

          {lead.status ===
          "hot"
            ? "HOT"
            : "COLD"}

        </div>


        <div>

          <Link
            to={
              `/leads/${lead.id}`
            }
            className="dashboard-pipeline-lead-title"
          >

            {lead.title ||
              lead.name ||
              "Untitled Lead"}

          </Link>


          <span className="dashboard-pipeline-company">

            {lead.company_name ||
              "No company"}

          </span>

        </div>

      </div>


      {/* ===================================================
          CURRENT STAGE
      ==================================================== */}

      <div className="dashboard-pipeline-lead-detail">

        <span>
          Current Stage
        </span>


        <strong>

          {lead.pipeline_stage_label}

        </strong>

      </div>


      {/* ===================================================
          STATE
      ==================================================== */}

      <div className="dashboard-pipeline-lead-detail">

        <span>
          Status
        </span>


        <PipelineStateBadge
          lead={
            lead
          }
        />

      </div>


      {/* ===================================================
          FINANCE
      ==================================================== */}

      <div className="dashboard-pipeline-lead-detail">

        <span>
          Finance
        </span>


        <strong>

          {formatDecision(
            lead.financial_decision
          )}

        </strong>

      </div>


      {/* ===================================================
          TECHNICAL
      ==================================================== */}

      <div className="dashboard-pipeline-lead-detail">

        <span>
          Technical
        </span>


        <strong>

          {formatDecision(
            lead.technical_decision
          )}

        </strong>

      </div>


      {/* ===================================================
          LAST UPDATE
      ==================================================== */}

      <div className="dashboard-pipeline-lead-detail">

        <span>
          Last Update
        </span>


        <strong>

          {formatPipelineDate(
            lead.last_update_at
          )}

        </strong>

      </div>


      {/* ===================================================
          VIEW
      ==================================================== */}

      <Link
        to={
          `/leads/${lead.id}`
        }
        className="dashboard-pipeline-view"
      >

        View

      </Link>

    </article>
  );
}


/*
 * =========================================================
 * PIPELINE STATE BADGE
 * =========================================================
 */

function PipelineStateBadge({
  lead,
}: {
  lead:
    PipelineLead;
}) {

  const className =
    [
      "dashboard-pipeline-state",

      `dashboard-pipeline-state-${lead.pipeline_state}`,
    ].join(" ");


  return (

    <strong
      className={
        className
      }
    >

      {lead.pipeline_state_label}

    </strong>
  );
}


/*
 * =========================================================
 * DECISION LABEL
 * =========================================================
 */

function formatDecision(
  value:
    string
) {

  switch (
    value
  ) {

    case "approved":

      return "Approved";


    case "rejected":

      return "Rejected";


    case "pending":
    default:

      return "Pending";
  }
}