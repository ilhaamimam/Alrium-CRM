import axios from "axios";

import {
  useState,
  type FormEvent,
} from "react";

import {
  assignProjectTeam,
} from "./teamAllocation.api";

import type {
  AllocationProject,
  Team,
} from "./teamAllocation.types";


interface Props {
  teams: Team[];

  projects:
    AllocationProject[];

  onAssigned:
    () => void;
}


export default function ProjectTeamAssignmentForm({
  teams,
  projects,
  onAssigned,
}: Props) {

  const [
    projectId,
    setProjectId,
  ] =
    useState("");


  const [
    teamId,
    setTeamId,
  ] =
    useState("");


  const [
    plannedStartDate,
    setPlannedStartDate,
  ] =
    useState("");


  const [
    plannedEndDate,
    setPlannedEndDate,
  ] =
    useState("");


  const [
    loading,
    setLoading,
  ] =
    useState(false);


  const [
    error,
    setError,
  ] =
    useState("");


  const handleProjectChange =
    (
      selectedId:
        string
    ) => {

      setProjectId(
        selectedId
      );


      const project =
        projects.find(
          (item) =>
            item.id ===
            selectedId
        );


      if (project) {

        setPlannedStartDate(
          project
            .planned_start_date ??
            ""
        );


        setPlannedEndDate(
          project
            .planned_end_date ??
            ""
        );


        const currentTeam =
          project
            .project_teams?.[0];


        setTeamId(
          currentTeam
            ?.team_id ??
            ""
        );

      } else {

        setTeamId("");

        setPlannedStartDate("");

        setPlannedEndDate("");

      }
    };


  const handleSubmit =
    async (
      event:
        FormEvent<HTMLFormElement>
    ) => {

      event.preventDefault();

      setError("");


      if (
        !projectId ||
        !teamId
      ) {

        setError(
          "Select a Lead Board project and a team"
        );

        return;
      }


      if (
        plannedStartDate &&
        plannedEndDate &&
        plannedEndDate <
          plannedStartDate
      ) {

        setError(
          "End date cannot be before start date"
        );

        return;
      }


      setLoading(true);


      try {

        await assignProjectTeam(
          projectId,
          {
            teamId,

            plannedStartDate:
              plannedStartDate ||
              null,

            plannedEndDate:
              plannedEndDate ||
              null,
          }
        );


        setProjectId("");

        setTeamId("");

        setPlannedStartDate("");

        setPlannedEndDate("");


        onAssigned();

      } catch (error) {

        console.error(
          "ASSIGN TEAM ERROR:",
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
              "Unable to allocate team"
          );

        } else {

          setError(
            "Unable to allocate team"
          );
        }

      } finally {

        setLoading(false);

      }
    };


  return (
    <form
      onSubmit={
        handleSubmit
      }
    >

      <h2>
        Allocate Team to Approved Lead
      </h2>


      <div>
        <label>
          Approved Lead / Project
        </label>

        <select
          value={
            projectId
          }
          onChange={(event) =>
            handleProjectChange(
              event.target.value
            )
          }
          required
        >

          <option value="">
            Select Approved Lead
          </option>


          {projects.map(
            (project) => (

              <option
                key={
                  project.id
                }
                value={
                  project.id
                }
              >
                {project.name}

                {" - "}

                {project.leads
                  ?.companies
                  ?.name ||
                  "No Company"}
              </option>
            )
          )}

        </select>
      </div>


      <div>
        <label>
          Team
        </label>

        <select
          value={teamId}
          onChange={(event) =>
            setTeamId(
              event.target.value
            )
          }
          required
        >

          <option value="">
            Select Team
          </option>


          {teams.map(
            (team) => (

              <option
                key={
                  team.id
                }
                value={
                  team.id
                }
              >
                {team.name}
              </option>
            )
          )}

        </select>
      </div>


      <div>
        <label>
          Planned Start Date
        </label>

        <input
          type="date"
          value={
            plannedStartDate
          }
          onChange={(event) =>
            setPlannedStartDate(
              event.target.value
            )
          }
        />
      </div>


      <div>
        <label>
          Planned End Date
        </label>

        <input
          type="date"
          value={
            plannedEndDate
          }
          onChange={(event) =>
            setPlannedEndDate(
              event.target.value
            )
          }
        />
      </div>


      {error && (
        <p>
          {error}
        </p>
      )}


      <button
        type="submit"
        disabled={
          loading
        }
      >
        {loading
          ? "Assigning..."
          : "Assign Team"}
      </button>

    </form>
  );
}