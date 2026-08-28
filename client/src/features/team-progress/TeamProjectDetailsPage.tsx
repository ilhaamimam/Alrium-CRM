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
  fetchTeamProgressProjectById,
} from "./teamProgress.api";

import ProjectStatusForm
  from "./ProjectStatusForm";

import TaskForm
  from "./TaskForm";

import TaskTable
  from "./TaskTable";

import type {
  TeamProgressProjectDetails,
} from "./teamProgress.types";

import "./teamProgress.css";


export default function TeamProjectDetailsPage() {

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
      TeamProgressProjectDetails |
      null
    >(null);


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


  const loadProject =
    useCallback(
      async () => {

        if (!id) {

          setError(
            "Project ID is missing"
          );

          setLoading(false);

          return;
        }


        try {

          setError("");


          const data =
            await fetchTeamProgressProjectById(
              id
            );


          setProject(
            data
          );

        } catch (error) {

          console.error(
            "LOAD PROJECT ERROR:",
            error
          );


          setError(
            "Unable to load assigned project"
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


  if (loading) {
    return (
      <div className="page-shell">

        <div className="empty-state">
          Loading project...
        </div>

      </div>
    );
  }


  if (error) {
    return (
      <div className="page-shell">

        <p className="error-message">
          {error}
        </p>


        <Link to="/team-progress">
          ← Back to Team Progress
        </Link>

      </div>
    );
  }


  if (!project) {
    return (
      <div className="page-shell">

        <div className="empty-state">
          Project not found.
        </div>

      </div>
    );
  }


  return (
    <div className="page-shell">

      <div className="page-header">

        <Link
          to="/team-progress"
        >
          ← Back to Team Progress
        </Link>


        <h1 className="page-title">
          {project.name}
        </h1>


        <p className="page-subtitle">

          {project.leads
            ?.companies
            ?.name ||
            "Assigned project"}

        </p>

      </div>


      <div className="card">

        <h2 className="card-title">
          Project Information
        </h2>


        <div className="details-grid">

          <Detail
            label="Status"
            value={
              project.status
                .replace(
                  "_",
                  " "
                )
            }
          />


          <Detail
            label="Team"
            value={
              project
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
                "-"
            }
          />


          <Detail
            label="Planned Start"
            value={
              project
                .planned_start_date
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
            label="Actual Start"
            value={
              project
                .actual_start_date
            }
          />


          <Detail
            label="Actual End"
            value={
              project
                .actual_end_date
            }
          />


          <Detail
            label="Lead"
            value={
              project.leads
                ?.title
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

        </div>

      </div>


      <div className="team-progress-detail-grid section">

        <div className="card">

          <ProjectStatusForm
            project={
              project
            }

            onUpdated={
              loadProject
            }
          />

        </div>


        <div className="card">

          <TaskForm
            projectId={
              project.id
            }

            members={
              project
                .available_members
            }

            onCreated={
              loadProject
            }
          />

        </div>

      </div>


      <div className="card section">

        <div className="section-header">

          <div>

            <h2 className="card-title">
              Project Tasks
            </h2>

            <p className="page-subtitle">
              Update task progress and
              mark completed work Done.
            </p>

          </div>

        </div>


        <TaskTable
          tasks={
            project.tasks
          }

          onChanged={
            loadProject
          }
        />

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