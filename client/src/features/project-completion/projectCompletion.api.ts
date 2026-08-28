import {
  api,
} from "../../api/http";

import type {
  CompletionReviewProject,
  CompletionReviewStatus,
  FinalProjectUpdate,
  ProjectCompletionStatus,
} from "./projectCompletion.types";


export const fetchProjectCompletionStatus =
  async (
    projectId: string
  ): Promise<
    ProjectCompletionStatus
  > => {

    const response =
      await api.get(
        `/project-completion/projects/${projectId}/status`
      );


    return response.data.data;
  };


export const submitProjectCompletion =
  async (
    projectId: string,
    completionNotes: string
  ) => {

    const response =
      await api.post(
        `/project-completion/projects/${projectId}/submit`,
        {
          completionNotes,
        }
      );


    return response.data.data;
  };


export const fetchCompletionReviews =
  async (
    status?:
      CompletionReviewStatus
  ): Promise<
    CompletionReviewProject[]
  > => {

    const response =
      await api.get(
        "/project-completion/reviews",
        {
          params:
            status
              ? {
                  status,
                }
              : {},
        }
      );


    return response.data.data;
  };


export const fetchCompletionReviewById =
  async (
    projectId: string
  ): Promise<
    CompletionReviewProject
  > => {

    const response =
      await api.get(
        `/project-completion/reviews/${projectId}`
      );


    return response.data.data;
  };


export const confirmProjectCompletion =
  async (
    projectId: string,
    reviewNotes: string
  ) => {

    const response =
      await api.post(
        `/project-completion/reviews/${projectId}/confirm`,
        {
          reviewNotes,
        }
      );


    return response.data.data;
  };


export const requestProjectCompletionChanges =
  async (
    projectId: string,
    reviewNotes: string
  ) => {

    const response =
      await api.post(
        `/project-completion/reviews/${projectId}/request-changes`,
        {
          reviewNotes,
        }
      );


    return response.data.data;
  };


export const fetchFinalProjectUpdates =
  async (): Promise<
    FinalProjectUpdate[]
  > => {

    const response =
      await api.get(
        "/project-completion/final-updates"
      );


    return response.data.data;
  };