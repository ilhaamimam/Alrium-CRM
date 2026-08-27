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


export const fetchTeams =
  async (): Promise<
    Team[]
  > => {

    const response =
      await api.get(
        "/teams"
      );

    return response.data.data;
  };


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


export const fetchAvailableTeamMembers =
  async (): Promise<
    TeamMemberProfile[]
  > => {

    const response =
      await api.get(
        "/team-members/available"
      );

    return response.data.data;
  };


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


export const removeTeamMember =
  async (
    teamId: string,
    userId: string
  ): Promise<void> => {

    await api.delete(
      `/teams/${teamId}/members/${userId}`
    );
  };


export const fetchProjectsForAllocation =
  async (): Promise<
    AllocationProject[]
  > => {

    const response =
      await api.get(
        "/team-allocation/projects"
      );

    return response.data.data;
  };


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

    return response.data.data;
  };