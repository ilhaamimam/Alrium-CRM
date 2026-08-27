import {
  api,
} from "../../api/http";

import type {
  AddApprovedLeadBoardInput,
  ApprovedLead,
  ApprovedLeadBoardItem,
  UpdateApprovedLeadBoardInput,
} from "./approvedLeadBoard.types";


export const fetchAvailableApprovedLeads =
  async (): Promise<
    ApprovedLead[]
  > => {

    const response =
      await api.get(
        "/lead-board/available"
      );

    return response.data.data;
  };


export const fetchApprovedLeadBoard =
  async (): Promise<
    ApprovedLeadBoardItem[]
  > => {

    const response =
      await api.get(
        "/lead-board"
      );

    return response.data.data;
  };


export const fetchApprovedLeadBoardItem =
  async (
    projectId: string
  ): Promise<
    ApprovedLeadBoardItem
  > => {

    const response =
      await api.get(
        `/lead-board/${projectId}`
      );

    return response.data.data;
  };


export const addApprovedLeadToBoard =
  async (
    input:
      AddApprovedLeadBoardInput
  ): Promise<
    ApprovedLeadBoardItem
  > => {

    const response =
      await api.post(
        "/lead-board",
        input
      );

    return response.data.data;
  };


export const updateApprovedLeadBoardItem =
  async (
    projectId: string,

    input:
      UpdateApprovedLeadBoardInput
  ): Promise<
    ApprovedLeadBoardItem
  > => {

    const response =
      await api.patch(
        `/lead-board/${projectId}`,
        input
      );

    return response.data.data;
  };