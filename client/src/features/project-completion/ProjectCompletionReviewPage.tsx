import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  fetchCompletionReviews,
} from "./projectCompletion.api";

import type {
  CompletionReviewProject,
  CompletionReviewStatus,
} from "./projectCompletion.types";

import "./projectCompletion.css";


type Filter =
  | "all"
  | CompletionReviewStatus;


export default function ProjectCompletionReviewPage() {

  const [
    projects,
    setProjects,
  ] =
    useState<
      CompletionReviewProject[]
    >([]);


  const [
    filter,
    setFilter,
  ] =
    useState<Filter>(
      "pending_review"
    );


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


  const loadReviews =
    useCallback(
      async () => {

        try {

          setError("");


          const data =
            await fetchCompletionReviews(
              filter === "all"
                ? undefined
                : filter
            );


          setProjects(
            data
          );

        } catch (error) {

          console.error(
            "LOAD COMPLETION REVIEWS ERROR:",
            error
          );


          setError(
            "Unable to load project completion reviews"
          );

        } finally {

          setLoading(false);

        }
      },

      [
        filter,
      ]
    );


  useEffect(() => {

    loadReviews();

  }, [
    loadReviews,
  ]);


  return (
    <div className="page-shell">

      <div className="page-header">

        <h1 className="page-title">
          Project Completion Review
        </h1>

        <p className="page-subtitle">
          Review projects submitted by
          delivery teams and confirm their
          final Done status.
        </p>

      </div>


      {error && (
        <p className="error-message">
          {error}
        </p>
      )}


      <div className="card">

        <div className="completion-filter">

          <div className="form-group">

            <label>
              Review Status
            </label>

            <select
              value={filter}
              onChange={(event) =>
                setFilter(
                  event.target
                    .value as Filter
                )
              }
            >

              <option value="pending_review">
                Pending Review
              </option>

              <option value="changes_requested">
                Changes Requested
              </option>

              <option value="confirmed">
                Confirmed
              </option>

              <option value="all">
                All
              </option>

            </select>

          </div>

        </div>

      </div>


      <div className="section">

        {loading ? (

          <div className="empty-state">
            Loading completion reviews...
          </div>

        ) : projects.length ===
          0 ? (

          <div className="empty-state">
            No project completion reviews
            found.
          </div>

        ) : (

          <div className="completion-review-grid">

            {projects.map(
              (project) => (

                <div
                  className="card completion-review-card"
                  key={
                    project.id
                  }
                >

                  <div className="completion-review-header">

                    <div>

                      <h2>
                        {project.name}
                      </h2>

                      <p>
                        {project.leads
                          ?.companies
                          ?.name ||
                          "No Company"}
                      </p>

                    </div>


                    <span
                      className={
                        `completion-badge completion-${project.completion_review_status}`
                      }
                    >
                      {project
                        .completion_review_status
                        .replace(
                          "_",
                          " "
                        )}
                    </span>

                  </div>


                  <div className="completion-card-meta">

                    <span>
                      Team:{" "}

                      {project
                        .project_teams
                        ?.map(
                          (
                            allocation
                          ) =>
                            allocation
                              .teams
                              ?.name
                        )
                        .filter(
                          Boolean
                        )
                        .join(", ") ||
                        "-"}
                    </span>


                    <span>
                      Team submitted:{" "}

                      {project.team_completed_at
                        ? new Date(
                            project.team_completed_at
                          ).toLocaleString()
                        : "-"}
                    </span>

                  </div>


                  <div className="button-row">

                    <Link
                      className="btn"
                      to={
                        `/project-completion/${project.id}`
                      }
                    >
                      Review Project
                    </Link>

                  </div>

                </div>
              )
            )}

          </div>
        )}

      </div>

    </div>
  );
}