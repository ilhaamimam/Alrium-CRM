import axios from "axios";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  confirmProjectCompletion,
  fetchCompletionReviewById,
  requestProjectCompletionChanges,
} from "./projectCompletion.api";

import type {
  CompletionReviewProject,
} from "./projectCompletion.types";

import "./projectCompletion.css";


export default function ProjectCompletionReviewDetailsPage() {

  const {
    id,
  } =
    useParams<{
      id: string;
    }>();


  const [
    project,
    setProject,
  ] =
    useState<
      CompletionReviewProject |
      null
    >(null);


  const [
    reviewNotes,
    setReviewNotes,
  ] =
    useState("");


  const [
    loading,
    setLoading,
  ] =
    useState(true);


  const [
    actionLoading,
    setActionLoading,
  ] =
    useState(false);


  const [
    error,
    setError,
  ] =
    useState("");


  const [
    success,
    setSuccess,
  ] =
    useState("");


  const loadProject =
    useCallback(
      async () => {

        if (!id) {
          return;
        }


        try {

          setError("");


          const data =
            await fetchCompletionReviewById(
              id
            );


          setProject(
            data
          );


          setReviewNotes(
            data.senior_review_notes ??
            ""
          );

        } catch (error) {

          console.error(
            error
          );


          setError(
            "Unable to load completion review"
          );

        } finally {

          setLoading(false);

        }
      },

      [
        id,
      ]
    );


  useEffect(() => {

    loadProject();

  }, [
    loadProject,
  ]);


  const handleConfirm =
    async () => {

      if (!project) {
        return;
      }


      const confirmed =
        window.confirm(
          "Confirm this project as Done? This will update the Approved Lead Board and publish the final update to Sales/Marketing."
        );


      if (!confirmed) {
        return;
      }


      try {

        setActionLoading(true);

        setError("");

        setSuccess("");


        await confirmProjectCompletion(
          project.id,
          reviewNotes
        );


        setSuccess(
          "Project confirmed Done. Sales/Marketing can now view the final update."
        );


        await loadProject();

      } catch (error) {

        handleError(
          error,
          "Unable to confirm project",
          setError
        );

      } finally {

        setActionLoading(false);

      }
    };


  const handleRequestChanges =
    async () => {

      if (!project) {
        return;
      }


      if (
        !reviewNotes.trim()
      ) {

        setError(
          "Add review notes explaining the required changes."
        );

        return;
      }


      try {

        setActionLoading(true);

        setError("");

        setSuccess("");


        await requestProjectCompletionChanges(
          project.id,
          reviewNotes
        );


        setSuccess(
          "Changes requested. The project has returned to Ongoing."
        );


        await loadProject();

      } catch (error) {

        handleError(
          error,
          "Unable to request changes",
          setError
        );

      } finally {

        setActionLoading(false);

      }
    };


  if (loading) {
    return (
      <div className="page-shell">

        <div className="empty-state">
          Loading completion review...
        </div>

      </div>
    );
  }


  if (
    error &&
    !project
  ) {
    return (
      <div className="page-shell">

        <p className="error-message">
          {error}
        </p>

      </div>
    );
  }


  if (!project) {
    return null;
  }


  return (
    <div className="page-shell">

      <div className="page-header">

        <Link
          to="/project-completion"
        >
          ← Back to Completion Reviews
        </Link>


        <h1 className="page-title">
          {project.name}
        </h1>


        <p className="page-subtitle">
          Final project completion review
        </p>

      </div>


      <div className="card">

        <div className="details-grid">

          <Detail
            label="Company"
            value={
              project.leads
                ?.companies
                ?.name
            }
          />


          <Detail
            label="Contact"
            value={
              project.leads
                ?.contacts
                ? `${project.leads.contacts.first_name} ${project.leads.contacts.last_name || ""}`
                : "-"
            }
          />


          <Detail
            label="Team"
            value={
              project
                .project_teams
                ?.map(
                  (
                    item
                  ) =>
                    item.teams
                      ?.name
                )
                .filter(
                  Boolean
                )
                .join(", ")
            }
          />


          <Detail
            label="Project Status"
            value={
              project.status
            }
          />


          <Detail
            label="Completion Review"
            value={
              project
                .completion_review_status
                .replace(
                  "_",
                  " "
                )
            }
          />


          <Detail
            label="Team Completed"
            value={
              project.team_completed_at
                ? new Date(
                    project.team_completed_at
                  ).toLocaleString()
                : "-"
            }
          />


          <Detail
            label="Planned End"
            value={
              project
                .planned_end_date
            }
          />


          <Detail
            label="Actual End"
            value={
              project
                .actual_end_date
            }
          />

        </div>

      </div>


      <div className="card section">

        <h2 className="card-title">
          Team Completion Notes
        </h2>

        <p className="completion-notes">
          {project.completion_notes ||
            "No completion notes were provided."}
        </p>

      </div>


      <div className="card section">

        <h2 className="card-title">
          Final Task Review
        </h2>


        <div className="table-wrap">

          <table>

            <thead>
              <tr>
                <th>Task</th>
                <th>Status</th>
                <th>Due Date</th>
                <th>Completed</th>
              </tr>
            </thead>


            <tbody>

              {(project.tasks ?? [])
                .map(
                  (task) => (

                    <tr
                      key={
                        task.id
                      }
                    >

                      <td>
                        {task.title}
                      </td>

                      <td>
                        <span
                          className={
                            task.status ===
                            "done"
                              ? "badge badge-success"
                              : "badge badge-warning"
                          }
                        >
                          {task.status}
                        </span>
                      </td>

                      <td>
                        {task.due_date ||
                          "-"}
                      </td>

                      <td>
                        {task.completed_at
                          ? new Date(
                              task.completed_at
                            ).toLocaleString()
                          : "-"}
                      </td>

                    </tr>
                  )
                )}

            </tbody>

          </table>

        </div>

      </div>


      <div className="card section">

        <div className="form-group">

          <label>
            Senior Manager Review Notes
          </label>

          <textarea
            value={
              reviewNotes
            }
            onChange={(event) =>
              setReviewNotes(
                event.target.value
              )
            }
            placeholder="Review notes, confirmation details or required changes..."
          />

        </div>


        {error && (
          <p className="error-message">
            {error}
          </p>
        )}


        {success && (
          <p className="success-message">
            {success}
          </p>
        )}


        {project
          .completion_review_status ===
          "pending_review" && (

          <div className="completion-review-actions">

            <button
              onClick={
                handleConfirm
              }
              disabled={
                actionLoading
              }
            >
              Confirm Project Done
            </button>


            <button
              className="btn-danger"
              onClick={
                handleRequestChanges
              }
              disabled={
                actionLoading
              }
            >
              Request Changes
            </button>

          </div>
        )}


        {project
          .completion_review_status ===
          "confirmed" && (

          <div className="completion-message completion-confirmed">

            Project has been confirmed
            Done and published as a final
            Sales/Marketing update.

          </div>
        )}

      </div>

    </div>
  );
}


function Detail({
  label,
  value,
}: {
  label: string;

  value:
    string |
    null |
    undefined;
}) {

  return (
    <div className="detail-item">

      <span className="detail-label">
        {label}
      </span>

      <span className="detail-value">
        {value || "-"}
      </span>

    </div>
  );
}


function handleError(
  error: unknown,
  fallback: string,
  setError:
    (
      message: string
    ) => void
) {

  console.error(error);


  if (
    axios.isAxiosError(
      error
    )
  ) {

    setError(
      error.response
        ?.data
        ?.message ||
        fallback
    );

  } else {

    setError(
      fallback
    );
  }
}