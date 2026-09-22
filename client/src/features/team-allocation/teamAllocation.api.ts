import axios from "axios";

import {
  api,
} from "../../api/http";

import type {
  AddTeamMemberInput,
  AllocationProject,
  AssignTeamInput,
  CreateTeamInput,
  Team,
  TeamAssignedProject,
  TeamMemberProfile,
} from "./teamAllocation.types";


/*
 * =========================================================
 * TEAMS
 * =========================================================
 */

export const fetchTeams =
  async (): Promise<
    Team[]
  > => {

    const response =
      await api.get(
        "/teams"
      );


    return (
      response.data.data ??
      []
    );
  };


/*
 * =========================================================
 * CREATE TEAM
 * =========================================================
 */

export const createTeam =
  async (
    input:
      CreateTeamInput
  ): Promise<Team> => {

    const response =
      await api.post(
        "/teams",
        input
      );


    return response.data.data;
  };


/*
 * =========================================================
 * UPDATE TEAM
 * =========================================================
 */

export const updateTeam =
  async (
    teamId: string,

    input: {
      name?: string;

      description?: string;
    }
  ): Promise<Team> => {

    const response =
      await api.patch(
        `/teams/${teamId}`,
        input
      );


    return response.data.data;
  };


/*
 * =========================================================
 * AVAILABLE TEAM MEMBERS
 * =========================================================
 */

export const fetchAvailableTeamMembers =
  async (): Promise<
    TeamMemberProfile[]
  > => {

    const response =
      await api.get(
        "/team-members/available"
      );


    return (
      response.data.data ??
      []
    );
  };


/*
 * =========================================================
 * ADD MEMBER TO TEAM
 * =========================================================
 */

export const addTeamMember =
  async (
    teamId: string,

    input:
      AddTeamMemberInput
  ) => {

    const response =
      await api.post(
        `/teams/${teamId}/members`,
        input
      );


    return response.data.data;
  };


/*
 * =========================================================
 * REMOVE MEMBER FROM TEAM
 * =========================================================
 */

export const removeTeamMember =
  async (
    teamId: string,

    userId: string
  ): Promise<void> => {

    await api.delete(
      `/teams/${teamId}/members/${userId}`
    );
  };


/*
 * =========================================================
 * PROJECTS READY FOR ALLOCATION
 * =========================================================
 */

export const fetchProjectsForAllocation =
  async (): Promise<
    AllocationProject[]
  > => {

    const response =
      await api.get(
        "/team-allocation/projects"
      );


    return (
      response.data.data ??
      []
    );
  };


/*
 * =========================================================
 * ASSIGN TEAM TO PROJECT
 * =========================================================
 */

export const assignProjectTeam =
  async (
    projectId: string,

    input:
      AssignTeamInput
  ) => {

    const response =
      await api.post(
        `/team-allocation/projects/${projectId}`,
        input
      );


    return response.data.data;
  };


/*
 * =========================================================
 * ASSIGNED PROJECTS
 * =========================================================
 */

export const fetchTeamAssignedProjects =
  async (
    teamId?: string
  ): Promise<
    TeamAssignedProject[]
  > => {

    const response =
      await api.get(
        "/team-allocation/assigned",
        {
          params:
            teamId
              ? {
                  teamId,
                }
              : {},
        }
      );


    return (
      response.data.data ??
      []
    );
  };


/*
 * =========================================================
 * PREPARE / SAVE COMPLETE ALLOCATION
 *
 * This helper does TWO things:
 *
 * 1. Adds the selected members to the selected team.
 * 2. Assigns that team to the selected project.
 *
 * IMPORTANT:
 * Creation of the Project Completion Review should happen
 * on the BACKEND when assignTeam succeeds.
 * =========================================================
 */

export const prepareProjectAllocation =
  async (
    projectId: string,

    teamId: string,

    memberIds: string[],

    assignment:
      AssignTeamInput
  ) => {

    /*
     * -----------------------------------------------------
     * 1. ADD SELECTED MEMBERS TO TEAM
     * -----------------------------------------------------
     */

    for (
      const userId
      of memberIds
    ) {

      try {

        await addTeamMember(
          teamId,
          {
            userId,
          } as AddTeamMemberInput
        );

      } catch (error) {

        /*
         * If the member is already assigned to this team,
         * do not stop the entire project allocation.
         */

        if (
          axios.isAxiosError(
            error
          )
        ) {

          const status =
            error.response
              ?.status;


          /*
           * 409 commonly means:
           * already exists / duplicate membership.
           */

          if (
            status ===
            409
          ) {

            console.warn(
              "TEAM MEMBER ALREADY EXISTS:",
              userId
            );

            continue;
          }
        }


        /*
         * Any other error is important.
         */

        throw error;
      }
    }


    /*
     * -----------------------------------------------------
     * 2. ASSIGN TEAM TO PROJECT
     * -----------------------------------------------------
     */

    const allocation =
      await assignProjectTeam(
        projectId,
        assignment
      );


    return allocation;
  };