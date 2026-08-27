import {
  useEffect,
  useState,
} from "react";

import {
  fetchTeamAssignedProjects,
} from "./teamAllocation.api";

import type {
  Team,
  TeamAssignedProject,
} from "./teamAllocation.types";


interface Props {
  teams: Team[];

  refreshKey: number;
}


export default function TeamAssignedLeadsTable({
  teams,
  refreshKey,
}: Props) {

  const [
    teamId,
    setTeamId,
  ] =
    useState("");


  const [
    items,
    setItems,
  ] =
    useState<
      TeamAssignedProject[]
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

    const loadAssigned =
      async () => {

        try {

          setLoading(true);

          setError("");


          const data =
            await fetchTeamAssignedProjects(
              teamId ||
              undefined
            );


          setItems(
            data
          );

        } catch (error) {

          console.error(
            "LOAD ASSIGNED LEADS ERROR:",
            error
          );


          setError(
            "Unable to load team assigned leads"
          );

        } finally {

          setLoading(false);

        }
      };


    loadAssigned();

  }, [
    teamId,
    refreshKey,
  ]);


  return (
    <div>

      <h2>
        Team Assigned Leads
      </h2>


      <div>
        <label>
          Filter by Team
        </label>

        <select
          value={
            teamId
          }
          onChange={(event) =>
            setTeamId(
              event.target.value
            )
          }
        >

          <option value="">
            All Teams
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


      {loading && (
        <p>
          Loading assigned leads...
        </p>
      )}


      {error && (
        <p>
          {error}
        </p>
      )}


      {!loading &&
        items.length ===
          0 && (

        <p>
          No team assigned leads found.
        </p>
      )}


      {!loading &&
        items.length >
          0 && (

        <table>

          <thead>
            <tr>
              <th>
                Lead
              </th>

              <th>
                Company
              </th>

              <th>
                Contact
              </th>

              <th>
                Team
              </th>

              <th>
                Status
              </th>

              <th>
                Start
              </th>

              <th>
                End
              </th>
            </tr>
          </thead>


          <tbody>

            {items.map(
              (item) => {

                const project =
                  item.projects;

                const lead =
                  project?.leads;


                return (
                  <tr
                    key={`${item.project_id}-${item.team_id}`}
                  >

                    <td>
                      {project
                        ?.name ||
                        "-"}
                    </td>


                    <td>
                      {lead
                        ?.companies
                        ?.name ||
                        "-"}
                    </td>


                    <td>
                      {lead
                        ?.contacts
                        ? `${lead.contacts.first_name} ${lead.contacts.last_name || ""}`
                        : "-"}
                    </td>


                    <td>
                      {item
                        .teams
                        ?.name ||
                        "-"}
                    </td>


                    <td>
                      {project
                        ?.status ||
                        "-"}
                    </td>


                    <td>
                      {project
                        ?.planned_start_date ||
                        "-"}
                    </td>


                    <td>
                      {project
                        ?.planned_end_date ||
                        "-"}
                    </td>

                  </tr>
                );
              }
            )}

          </tbody>

        </table>
      )}

    </div>
  );
}