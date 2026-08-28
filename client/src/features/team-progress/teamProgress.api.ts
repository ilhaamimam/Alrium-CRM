import {
  api,
} from "../../api/http";

import type {
  CreateTaskInput,
  ProjectProgressStatus,
  TaskProgressStatus,
  TeamProgressProject,
  TeamProgressProjectDetails,
} from "./teamProgress.types";


export const fetchTeamProgressProjects =
  async (): Promise<
    TeamProgressProject[]
  > => {

    const response =
      await api.get(
        "/team-progress/projects"
      );


    return response.data.data;
  };


export const fetchTeamProgressProjectById =
  async (
    projectId: string
  ): Promise<
    TeamProgressProjectDetails
  > => {

    const response =
      await api.get(
        `/team-progress/projects/${projectId}`
      );


    return response.data.data;
  };


export const updateProjectProgressStatus =
  async (
    projectId: string,

    status:
      ProjectProgressStatus,

    completionNotes?: string
  ) => {

    const response =
      await api.patch(
        `/team-progress/projects/${projectId}/status`,
        {
          status,
          completionNotes,
        }
      );


    return response.data.data;
  };


export const createProjectTask =
  async (
    projectId: string,

    input:
      CreateTaskInput
  ) => {

    const response =
      await api.post(
        `/team-progress/projects/${projectId}/tasks`,
        input
      );


    return response.data.data;
  };


export const updateTaskProgressStatus =
  async (
    taskId: string,

    status:
      TaskProgressStatus
  ) => {

    const response =
      await api.patch(
        `/team-progress/tasks/${taskId}/status`,
        {
          status,
        }
      );


    return response.data.data;
  };