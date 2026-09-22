import axios from "axios";

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
  fetchProjectCompletionReviews,
  type ProjectCompletionReview,
  type ProjectCompletionStatus,
} from "./projectCompletion.api";

import "./projectCompletion.css";


/*
 * =========================================================
 * BACKEND ROW SHAPE
 *
 * The Project Completion backend returns rows directly
 * from public.projects.
 *
 * Relations:
 *
 * projects
 *   ↓
 * leads
 *   ↓
 * companies
 *
 * projects
 *   ↓
 * project_teams
 *   ↓
 * teams
 * =========================================================
 */

type CompletionReviewRow =
  ProjectCompletionReview & {
    id: string;

    lead_id?: string;

    name?: string;

    description?:
      string | null;

    status?:
      string | null;

    completion_review_status?:
      string | null;

    completion_notes?:
      string | null;

    planned_start_date?:
      string | null;

    planned_end_date?:
      string | null;

    actual_start_date?:
      string | null;

    actual_end_date?:
      string | null;

    team_completed_at?:
      string | null;

    team_completed_by?:
      string | null;

    senior_reviewed_at?:
      string | null;

    senior_reviewed_by?:
      string | null;

    senior_review_notes?:
      string | null;

    created_at?:
      string | null;

    updated_at?:
      string | null;


    leads?: {
      id?: string;

      title?: string;

      status?:
        string | null;

      temperature?:
        string | null;

      workflow_stage?:
        string | null;

      companies?: {
        id?: string;

        name?: string;
      } | null;

      contacts?: {
        id?: string;

        first_name?: string;

        last_name?: string;

        email?: string;

        phone?: string;
      } | null;
    } | null;


    project_teams?:
      Array<{
        team_id?: string;

        assigned_at?:
          string | null;

        teams?: {
          id?: string;

          name?: string;
        } | null;
      }> |
      null;
  };


export default function ProjectCompletionReviewPage() {
  /*
   * =========================================================
   * FILTER
   *
   * Actual database enum values:
   *
   * not_submitted
   * pending_review
   * changes_requested
   * confirmed
   * =========================================================
   */

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState<
      ProjectCompletionStatus
    >("all");


  /*
   * =========================================================
   * REVIEWS / PROJECTS
   * =========================================================
   */

  const [
    reviews,
    setReviews,
  ] =
    useState<
      CompletionReviewRow[]
    >([]);


  /*
   * =========================================================
   * PAGE STATE
   * =========================================================
   */

  const [
    loading,
    setLoading,
  ] =
    useState(true);


  const [
    error,
    setError,
  ] =
    useState("");


  /*
   * =========================================================
   * LOAD PROJECTS
   * =========================================================
   */

  const loadReviews =
    useCallback(
      async () => {

        try {

          setLoading(true);

          setError("");


          const data =
            await fetchProjectCompletionReviews(
              statusFilter
            );


          console.log(
            "PROJECT COMPLETION REVIEWS:",
            {
              statusFilter,
              data,
            }
          );


          setReviews(
            data as
              CompletionReviewRow[]
          );

        } catch (error) {

          console.error(
            "LOAD PROJECT COMPLETION REVIEWS ERROR:",
            error
          );


          if (
            axios.isAxiosError(
              error
            )
          ) {

            setError(
              error.response
                ?.data
                ?.message ||
              "Unable to load project completion reviews"
            );

          } else if (
            error instanceof Error
          ) {

            setError(
              error.message
            );

          } else {

            setError(
              "Unable to load project completion reviews"
            );

          }

        } finally {

          setLoading(false);

        }
      },
      [
        statusFilter,
      ]
    );


  /*
   * =========================================================
   * INITIAL LOAD + FILTER CHANGE
   * =========================================================
   */

  useEffect(() => {

    void loadReviews();

  }, [
    loadReviews,
  ]);


  /*
   * =========================================================
   * SUMMARY COUNTS
   *
   * These counts are based on the currently loaded data.
   *
   * When filter = All, they show the entire allocation
   * workflow breakdown.
   * =========================================================
   */

  const counts =
    useMemo(
      () => {

        return {
          total:
            reviews.length,

          allocated:
            reviews.filter(
              (review) =>
                getCompletionStatus(
                  review
                ) ===
                "not_submitted"
            ).length,

          pending:
            reviews.filter(
              (review) =>
                getCompletionStatus(
                  review
                ) ===
                "pending_review"
            ).length,

          changes:
            reviews.filter(
              (review) =>
                getCompletionStatus(
                  review
                ) ===
                "changes_requested"
            ).length,

          confirmed:
            reviews.filter(
              (review) =>
                getCompletionStatus(
                  review
                ) ===
                "confirmed"
            ).length,
        };

      },
      [
        reviews,
      ]
    );


  /*
   * =========================================================
   * PAGE
   * =========================================================
   */

  return (
    <div className="page-shell">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="page-header">

        <h1 className="page-title">
          Project Completion Review
        </h1>


        <p className="page-subtitle">
          Review allocated projects,
          monitor delivery submissions,
          request changes where needed,
          and confirm final project
          completion.
        </p>

      </div>


      {/* =====================================================
          ERROR
      ====================================================== */}

      {error && (

        <div className="error-message">
          {error}
        </div>

      )}


      {/* =====================================================
          FILTER
      ====================================================== */}

      <section className="card">

        <div className="form-group">

          <label
            htmlFor="completion-status-filter"
          >
            Review Status
          </label>


          <select
            id="completion-status-filter"
            value={
              statusFilter
            }
            onChange={(
              event
            ) => {

              setStatusFilter(
                event.target
                  .value as
                  ProjectCompletionStatus
              );

            }}
          >

            <option value="all">
              All
            </option>


            <option value="not_submitted">
              Allocated / Not Submitted
            </option>


            <option value="pending_review">
              Pending Review
            </option>


            <option value="changes_requested">
              Changes Required
            </option>


            <option value="confirmed">
              Confirmed
            </option>

          </select>

        </div>

      </section>


      {/* =====================================================
          SUMMARY
      ====================================================== */}

      {statusFilter ===
        "all" && (

        <div className="completion-summary-grid">

          <CompletionSummaryCard
            title="All"
            value={
              counts.total
            }
          />


          <CompletionSummaryCard
            title="Allocated"
            value={
              counts.allocated
            }
          />


          <CompletionSummaryCard
            title="Pending Review"
            value={
              counts.pending
            }
            accent
          />


          <CompletionSummaryCard
            title="Changes Required"
            value={
              counts.changes
            }
          />


          <CompletionSummaryCard
            title="Confirmed"
            value={
              counts.confirmed
            }
          />

        </div>

      )}


      {/* =====================================================
          RESULTS
      ====================================================== */}

      <section className="card">

        <div className="completion-review-header">

          <div>

            <span className="completion-eyebrow">
              Completion Workflow
            </span>


            <h2 className="card-title">

              {getFilterTitle(
                statusFilter
              )}

            </h2>


            <p>

              {getFilterDescription(
                statusFilter
              )}

            </p>

          </div>


          <div className="completion-count">
            {reviews.length}
          </div>

        </div>


        {/* REFRESH */}

        <div
          style={{
            display: "flex",
            justifyContent:
              "flex-end",
            marginBottom:
              "16px",
          }}
        >

          <button
            type="button"
            className="btn-secondary"
            disabled={
              loading
            }
            onClick={() =>
              void loadReviews()
            }
          >

            {loading
              ? "Refreshing..."
              : "Refresh"}

          </button>

        </div>


        {/* LOADING */}

        {loading ? (

          <div className="empty-state">

            Loading project completion
            reviews...

          </div>

        ) : reviews.length ===
          0 ? (

          /* EMPTY */

          <div className="empty-state">

            <h3>
              No projects found
            </h3>


            <p>

              {getEmptyMessage(
                statusFilter
              )}

            </p>

          </div>

        ) : (

          /* TABLE */

          <div className="table-wrap">

            <table>

              <thead>

                <tr>

                  <th>
                    Project / Lead
                  </th>

                  <th>
                    Company
                  </th>

                  <th>
                    Lead Tag
                  </th>

                  <th>
                    Team
                  </th>

                  <th>
                    Project Status
                  </th>

                  <th>
                    Review Status
                  </th>

                  <th>
                    Timeline
                  </th>

                  <th>
                    Action
                  </th>

                </tr>

              </thead>


              <tbody>

                {reviews.map(
                  (
                    review
                  ) => {

                    const team =
                      getAssignedTeam(
                        review
                      );


                    const leadStatus =
                      getLeadStatus(
                        review
                      );


                    const reviewStatus =
                      getCompletionStatus(
                        review
                      );


                    return (

                      <tr
                        key={
                          review.id
                        }
                      >

                        {/* PROJECT / LEAD */}

                        <td>

                          <strong>

                            {getReviewTitle(
                              review
                            )}

                          </strong>


                          {review
                            .description && (

                            <div
                              style={{
                                marginTop:
                                  "4px",
                                color:
                                  "#777777",
                                fontSize:
                                  "0.78rem",
                              }}
                            >

                              {review
                                .description}

                            </div>

                          )}

                        </td>


                        {/* COMPANY */}

                        <td>

                          {getCompanyName(
                            review
                          )}

                        </td>


                        {/* LEAD TAG */}

                        <td>

                          <LeadTag
                            status={
                              leadStatus
                            }
                          />

                        </td>


                        {/* TEAM */}

                        <td>

                          {team?.name ||
                            "-"}

                        </td>


                        {/* PROJECT STATUS */}

                        <td>

                          <ProjectStatusBadge
                            status={
                              review.status
                            }
                          />

                        </td>


                        {/* COMPLETION REVIEW STATUS */}

                        <td>

                          <ReviewStatusBadge
                            status={
                              reviewStatus
                            }
                          />

                        </td>


                        {/* TIMELINE */}

                        <td>

                          <div className="completion-timeline">

                            <span>

                              Start:{" "}

                              <strong>
                                {formatDate(
                                  review
                                    .planned_start_date
                                )}
                              </strong>

                            </span>


                            <span>

                              End:{" "}

                              <strong>
                                {formatDate(
                                  review
                                    .planned_end_date
                                )}
                              </strong>

                            </span>

                          </div>

                        </td>


                        {/* ACTION */}

                        <td>

                          <Link
                            to={
                              `/project-completion/${review.id}`
                            }
                            className="btn btn-secondary"
                          >

                            {reviewStatus ===
                              "confirmed"
                              ? "View"
                              : reviewStatus ===
                                  "pending_review"
                                ? "Review"
                                : reviewStatus ===
                                    "changes_requested"
                                  ? "View Changes"
                                  : "View Project"}

                          </Link>

                        </td>

                      </tr>

                    );
                  }
                )}

              </tbody>

            </table>

          </div>

        )}

      </section>

    </div>
  );
}


/*
 * =========================================================
 * SUMMARY CARD
 * =========================================================
 */

function CompletionSummaryCard({
  title,
  value,
  accent = false,
}: {
  title: string;

  value: number;

  accent?: boolean;
}) {

  return (
    <div
      className={
        accent
          ? "completion-summary-card completion-summary-card-accent"
          : "completion-summary-card"
      }
    >

      <span>
        {title}
      </span>


      <strong>
        {value}
      </strong>

    </div>
  );
}


/*
 * =========================================================
 * FILTER TITLE
 * =========================================================
 */

function getFilterTitle(
  status:
    ProjectCompletionStatus
) {

  switch (
    status
  ) {

    case "not_submitted":

      return "Allocated Projects";


    case "pending_review":

      return "Pending Review";


    case "changes_requested":

      return "Changes Required";


    case "confirmed":

      return "Confirmed";


    case "all":

      return "All Projects";


    default:

      return "Project Completion Reviews";
  }
}


/*
 * =========================================================
 * FILTER DESCRIPTION
 * =========================================================
 */

function getFilterDescription(
  status:
    ProjectCompletionStatus
) {

  switch (
    status
  ) {

    case "not_submitted":

      return (
        "Projects allocated to delivery teams but not yet submitted for final completion review."
      );


    case "pending_review":

      return (
        "Projects the delivery team marked complete and submitted for management review."
      );


    case "changes_requested":

      return (
        "Projects returned to the delivery team because additional work or corrections are required."
      );


    case "confirmed":

      return (
        "Projects confirmed as completed by management."
      );


    case "all":

      return (
        "All team-allocated projects across the complete delivery and completion workflow."
      );


    default:

      return "";
  }
}


/*
 * =========================================================
 * EMPTY MESSAGE
 * =========================================================
 */

function getEmptyMessage(
  status:
    ProjectCompletionStatus
) {

  switch (
    status
  ) {

    case "not_submitted":

      return (
        "No allocated projects are waiting for team completion."
      );


    case "pending_review":

      return (
        "No delivery projects are currently waiting for management review."
      );


    case "changes_requested":

      return (
        "No projects currently require delivery changes."
      );


    case "confirmed":

      return (
        "No projects have been confirmed completed yet."
      );


    case "all":

      return (
        "No team-allocated projects were found. Allocate a HOT production-ready lead to a team first."
      );


    default:

      return (
        "No project completion reviews found."
      );
  }
}


/*
 * =========================================================
 * PROJECT / LEAD TITLE
 * =========================================================
 */

function getReviewTitle(
  review:
    CompletionReviewRow
) {

  return (
    review.name ||
    review.leads
      ?.title ||
    "Untitled Project"
  );
}


/*
 * =========================================================
 * COMPANY
 * =========================================================
 */

function getCompanyName(
  review:
    CompletionReviewRow
) {

  return (
    review.leads
      ?.companies
      ?.name ||
    "-"
  );
}


/*
 * =========================================================
 * TEAM
 * =========================================================
 */

function getAssignedTeam(
  review:
    CompletionReviewRow
) {

  const allocation =
    review
      .project_teams
      ?.find(
        (item) =>
          Boolean(
            item.teams
          )
      );


  return (
    allocation?.teams ||
    null
  );
}


/*
 * =========================================================
 * LEAD STATUS
 *
 * Newer workflow uses leads.status.
 *
 * Older records may still only have leads.temperature.
 * =========================================================
 */

function getLeadStatus(
  review:
    CompletionReviewRow
) {

  return (
    review.leads
      ?.status ||
    review.leads
      ?.temperature ||
    "cold"
  );
}


/*
 * =========================================================
 * COMPLETION STATUS
 * =========================================================
 */

function getCompletionStatus(
  review:
    CompletionReviewRow
) {

  const value =
    review
      .completion_review_status;


  switch (
    value
  ) {

    case "pending_review":
    case "changes_requested":
    case "confirmed":
    case "not_submitted":

      return value;


    default:

      return "not_submitted";
  }
}


/*
 * =========================================================
 * HOT / COLD BADGE
 * =========================================================
 */

function LeadTag({
  status,
}: {
  status?:
    string |
    null;
}) {

  const normalized =
    status
      ?.toLowerCase()
      .trim() ||
    "cold";


  const hot =
    normalized ===
      "hot" ||
    normalized ===
      "hot_lead";


  return (
    <span
      className={
        hot
          ? "completion-lead-hot"
          : "completion-lead-cold"
      }
    >

      {hot
        ? "HOT"
        : "COLD"}

    </span>
  );
}


/*
 * =========================================================
 * PROJECT STATUS BADGE
 * =========================================================
 */

function ProjectStatusBadge({
  status,
}: {
  status?:
    string |
    null;
}) {

  const normalized =
    status ||
    "pending";


  return (
    <span
      className={
        `completion-project-status completion-project-status-${normalized}`
      }
    >

      {formatLabel(
        normalized
      )}

    </span>
  );
}


/*
 * =========================================================
 * REVIEW STATUS BADGE
 * =========================================================
 */

function ReviewStatusBadge({
  status,
}: {
  status:
    | "not_submitted"
    | "pending_review"
    | "changes_requested"
    | "confirmed";
}) {

  return (
    <span
      className={
        `completion-status completion-status-${status}`
      }
    >

      {status ===
        "not_submitted"
        ? "Allocated"
        : status ===
            "pending_review"
          ? "Pending Review"
          : status ===
              "changes_requested"
            ? "Changes Required"
            : "Confirmed"}

    </span>
  );
}


/*
 * =========================================================
 * LABEL FORMATTER
 * =========================================================
 */

function formatLabel(
  value: string
) {

  return value
    .replace(
      /_/g,
      " "
    )
    .replace(
      /\b\w/g,
      (
        letter
      ) =>
        letter.toUpperCase()
    );
}


/*
 * =========================================================
 * DATE FORMATTER
 * =========================================================
 */

function formatDate(
  value?:
    string |
    null
) {

  if (!value) {
    return "-";
  }


  const date =
    new Date(
      `${value}T00:00:00`
    );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return value;
  }


  return date
    .toLocaleDateString();
}