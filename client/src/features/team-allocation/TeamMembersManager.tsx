import axios from "axios";

import {
  useMemo,
  useState,
  type FormEvent,
} from "react";

import {
  addTeamMember,
  removeTeamMember,
} from "./teamAllocation.api";

import type {
  Team,
  TeamMemberProfile,
} from "./teamAllocation.types";


interface Props {
  teams: Team[];

  availableMembers:
    TeamMemberProfile[];

  onChanged:
    () => void;
}


export default function TeamMembersManager({
  teams,
  availableMembers,
  onChanged,
}: Props) {

  const [
    selectedTeamId,
    setSelectedTeamId,
  ] =
    useState("");


  const [
    selectedUserId,
    setSelectedUserId,
  ] =
    useState("");


  const [
    roleInTeam,
    setRoleInTeam,
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


  const selectedTeam =
    useMemo(
      () =>
        teams.find(
          (team) =>
            team.id ===
            selectedTeamId
        ) ?? null,

      [
        teams,
        selectedTeamId,
      ]
    );


  const availableForSelectedTeam =
    useMemo(
      () => {

        if (!selectedTeam) {
          return [];
        }


        const currentIds =
          new Set(
            (
              selectedTeam
                .team_members ??
              []
            ).map(
              (member) =>
                member.user_id
            )
          );


        return availableMembers
          .filter(
            (user) =>
              !currentIds.has(
                user.id
              )
          );
      },

      [
        availableMembers,
        selectedTeam,
      ]
    );


  const handleAdd =
    async (
      event:
        FormEvent<HTMLFormElement>
    ) => {

      event.preventDefault();

      setError("");


      if (
        !selectedTeamId ||
        !selectedUserId
      ) {

        setError(
          "Select a team and member"
        );

        return;
      }


      setLoading(true);


      try {

        await addTeamMember(
          selectedTeamId,
          {
            userId:
              selectedUserId,

            roleInTeam:
              roleInTeam.trim(),
          }
        );


        setSelectedUserId("");

        setRoleInTeam("");


        await onChanged();

      } catch (error) {

        console.error(
          "ADD TEAM MEMBER ERROR:",
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
              "Unable to add member"
          );

        } else {

          setError(
            "Unable to add member"
          );
        }

      } finally {

        setLoading(false);

      }
    };


  const handleRemove =
    async (
      userId: string
    ) => {

      if (!selectedTeamId) {
        return;
      }


      const confirmed =
        window.confirm(
          "Remove this member from the team?"
        );


      if (!confirmed) {
        return;
      }


      try {

        await removeTeamMember(
          selectedTeamId,
          userId
        );


        await onChanged();

      } catch (error) {

        console.error(
          "REMOVE MEMBER ERROR:",
          error
        );


        setError(
          "Unable to remove member"
        );
      }
    };


  return (
    <div>

      <h2>
        Manage Team Members
      </h2>


      <div>
        <label>
          Select Team
        </label>

        <select
          value={
            selectedTeamId
          }
          onChange={(event) => {

            setSelectedTeamId(
              event.target.value
            );

            setSelectedUserId("");

          }}
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


      {selectedTeam && (
        <>
          <h3>
            Current Members
          </h3>


          {(
            selectedTeam
              .team_members ??
            []
          ).length ===
          0 ? (

            <p>
              No members in this team.
            </p>

          ) : (

            <table>

              <thead>
                <tr>
                  <th>
                    Name
                  </th>

                  <th>
                    Email
                  </th>

                  <th>
                    Team Role
                  </th>

                  <th>
                    Action
                  </th>
                </tr>
              </thead>


              <tbody>

                {(
                  selectedTeam
                    .team_members ??
                  []
                ).map(
                  (member) => (

                    <tr
                      key={
                        member.user_id
                      }
                    >

                      <td>
                        {member
                          .profiles
                          ?.full_name ||
                          "-"}
                      </td>


                      <td>
                        {member
                          .profiles
                          ?.email ||
                          "-"}
                      </td>


                      <td>
                        {member
                          .role_in_team ||
                          "-"}
                      </td>


                      <td>
                        <button
                          type="button"
                          onClick={() =>
                            handleRemove(
                              member.user_id
                            )
                          }
                        >
                          Remove
                        </button>
                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>
          )}


          <form
            onSubmit={
              handleAdd
            }
          >

            <h3>
              Add Member
            </h3>


            <div>
              <label>
                Member
              </label>

              <select
                value={
                  selectedUserId
                }
                onChange={(event) =>
                  setSelectedUserId(
                    event.target.value
                  )
                }
              >

                <option value="">
                  Select Member
                </option>


                {availableForSelectedTeam
                  .map(
                    (member) => (

                      <option
                        key={
                          member.id
                        }
                        value={
                          member.id
                        }
                      >
                        {member.full_name ||
                          member.email}
                      </option>
                    )
                  )}

              </select>
            </div>


            <div>
              <label>
                Role in Team
              </label>

              <input
                type="text"
                value={
                  roleInTeam
                }
                onChange={(event) =>
                  setRoleInTeam(
                    event.target.value
                  )
                }
                placeholder="Developer, Designer..."
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
                ? "Adding..."
                : "Add Member"}
            </button>

          </form>
        </>
      )}

    </div>
  );
}