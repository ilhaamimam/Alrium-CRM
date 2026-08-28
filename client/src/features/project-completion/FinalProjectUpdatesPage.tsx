import {
  useEffect,
  useState,
} from "react";

import {
  fetchFinalProjectUpdates,
} from "./projectCompletion.api";

import type {
  FinalProjectUpdate,
} from "./projectCompletion.types";

import "./projectCompletion.css";


export default function FinalProjectUpdatesPage() {

  const [
    updates,
    setUpdates,
  ] =
    useState<
      FinalProjectUpdate[]
    >([]);


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


  useEffect(() => {

    const loadUpdates =
      async () => {

        try {

          const data =
            await fetchFinalProjectUpdates();


          setUpdates(
            data
          );

        } catch (error) {

          console.error(
            "LOAD FINAL UPDATES ERROR:",
            error
          );


          setError(
            "Unable to load final project updates"
          );

        } finally {

          setLoading(false);

        }
      };


    loadUpdates();

  }, []);


  if (loading) {
    return (
      <div className="page-shell">

        <div className="empty-state">
          Loading final updates...
        </div>

      </div>
    );
  }


  return (
    <div className="page-shell">

      <div className="page-header">

        <h1 className="page-title">
          Final Project Updates
        </h1>


        <p className="page-subtitle">
          Projects formally confirmed Done
          by the Senior Manager.
        </p>

      </div>


      {error && (
        <p className="error-message">
          {error}
        </p>
      )}


      {updates.length ===
      0 ? (

        <div className="empty-state">
          No final project updates yet.
        </div>

      ) : (

        <div className="final-update-grid">

          {updates.map(
            (project) => (

              <article
                className="card final-update-card"
                key={
                  project.id
                }
              >

                <div className="final-update-header">

                  <div>

                    <span className="final-update-label">
                      Project Completed
                    </span>


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


                  <span className="badge badge-success">
                    Done
                  </span>

                </div>


                <div className="final-update-details">

                  <div>
                    <span>
                      Contact
                    </span>

                    <strong>

                      {project.leads
                        ?.contacts
                        ? `${project.leads.contacts.first_name} ${project.leads.contacts.last_name || ""}`
                        : "-"}

                    </strong>
                  </div>


                  <div>
                    <span>
                      Team
                    </span>

                    <strong>

                      {project
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
                        .join(", ") ||
                        "-"}

                    </strong>
                  </div>


                  <div>
                    <span>
                      Started
                    </span>

                    <strong>
                      {project.actual_start_date ||
                        "-"}
                    </strong>
                  </div>


                  <div>
                    <span>
                      Completed
                    </span>

                    <strong>
                      {project.actual_end_date ||
                        "-"}
                    </strong>
                  </div>

                </div>


                <div className="final-update-notes">

                  <h3>
                    Delivery Summary
                  </h3>

                  <p>
                    {project.completion_notes ||
                      "Project delivery completed."}
                  </p>


                  {project.senior_review_notes && (
                    <>
                      <h3>
                        Senior Manager Review
                      </h3>

                      <p>
                        {project.senior_review_notes}
                      </p>
                    </>
                  )}

                </div>


                <footer className="final-update-footer">

                  Final update published{" "}

                  {project.final_update_at
                    ? new Date(
                        project.final_update_at
                      ).toLocaleString()
                    : "-"}

                </footer>

              </article>
            )
          )}

        </div>
      )}

    </div>
  );
}