import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  fetchTeamProgressProjects,
} from "./teamProgress.api";

import type {
  ProjectProgressStatus,
  TeamProgressProject,
} from "./teamProgress.types";

import "./teamProgress.css";


type FilterStatus =
  | "all"
  | ProjectProgressStatus;


export default function TeamProgressPage() {
  const [
    projects,
    setProjects,
  ] =
    useState<
      TeamProgressProject[]
    >([]);


  const [
    filter,
    setFilter,
  ] =
    useState<
      FilterStatus
    >("all");


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

    const loadProjects =
      async () => {

        try {

          setError("");


          const data =
            await fetchTeamProgressProjects();


          setProjects(
            data
          );

        } catch (error) {

          console.error(
            "LOAD TEAM PROGRESS ERROR:",
            error
          );


          setError(
            "Unable to load assigned projects"
          );

        } finally {

          setLoading(false);

        }
      };


    loadProjects();

  }, []);


  const filteredProjects =
    useMemo(
      () => {

        if (
          filter === "all"
        ) {
          return projects;
        }


        return projects.filter(
          (project) =>
            project.status ===
            filter
        );
      },

      [
        projects,
        filter,
      ]
    );


  if (loading) {
    return (
      <div className="page-shell">

        <div className="empty-state">
          Loading assigned projects...
        </div>

      </div>
    );
  }


  return (
    <div className="page-shell">

      <div className="page-header">

        <h1 className="page-title">
          Team Progress
        </h1>

        <p className="page-subtitle">
          Work on allocated projects,
          update project stages and
          complete assigned tasks.
        </p>

      </div>


      {error && (
        <p className="error-message">
          {error}
        </p>
      )}


      <div className="card">

        <div className="progress-toolbar">

          <div className="form-group">

            <label>
              Filter by Status
            </label>

            <select
              value={filter}
              onChange={(event) =>
                setFilter(
                  event.target
                    .value as
                    FilterStatus
                )
              }
            >

              <option value="all">
                All Projects
              </option>

              <option value="assigned">
                Assigned
              </option>

              <option value="ongoing">
                Ongoing
              </option>

              <option value="on_hold">
                On Hold
              </option>

              <option value="done">
                Done
              </option>

            </select>

          </div>

        </div>

      </div>


      <div className="team-progress-grid">

        {filteredProjects.length ===
        0 ? (

          <div className="empty-state">
            No projects found.
          </div>

        ) : (

          filteredProjects.map(
            (project) => {

              const total =
                project
                  .task_summary
                  .total;


              const done =
                project
                  .task_summary
                  .done;


              const percentage =
                total === 0
                  ? 0
                  : Math.round(
                      (
                        done /
                        total
                      ) *
                        100
                    );


              return (
                <div
                  className="card project-progress-card"
                  key={
                    project.id
                  }
                >

                  <div className="project-progress-header">

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
                        `progress-status status-${project.status}`
                      }
                    >
                      {formatStatus(
                        project.status
                      )}
                    </span>

                  </div>


                  <div className="project-meta">

                    <span>
                      Team:{" "}

                      {project
                        .allocated_teams
                        .map(
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
                      Due:{" "}

                      {project.planned_end_date ||
                        "-"}
                    </span>

                  </div>


                  <div className="task-progress">

                    <div className="task-progress-label">

                      <span>
                        Task Progress
                      </span>

                      <span>
                        {done}/{total}
                      </span>

                    </div>


                    <div className="progress-track">

                      <div
                        className="progress-fill"
                        style={{
                          width:
                            `${percentage}%`,
                        }}
                      />

                    </div>


                    <small>
                      {percentage}%
                      complete
                    </small>

                  </div>


                  <div className="button-row">

                    <Link
                      className="btn"
                      to={
                        `/team-progress/${project.id}`
                      }
                    >
                      Open Project
                    </Link>

                  </div>

                </div>
              );
            }
          )

        )}

      </div>

    </div>
  );
}


function formatStatus(
  status: string
) {
  return status
    .replace(
      "_",
      " "
    );
}