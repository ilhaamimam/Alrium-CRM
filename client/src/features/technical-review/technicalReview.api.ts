import {
  api,
} from "../../api/http";

import type {
  AvailableTeamMember,
  TechnicalDecisionInput,
  TechnicalReviewLead,
} from "./technicalReview.types";


export const fetchTechnicalReviewLeads =
  async (): Promise<
    TechnicalReviewLead[]
  > => {

    const response =
      await api.get(
        "/technical-review/leads"
      );


    return (
      response.data.data ??
      []
    );
  };


export const fetchAvailableTeamMembers =
  async (): Promise<
    AvailableTeamMember[]
  > => {

    const response =
      await api.get(
        "/technical-review/team-members"
      );


    return (
      response.data.data ??
      []
    );
  };


export const saveTechnicalDecision =
  async (
    id: string,
    input:
      TechnicalDecisionInput
  ) => {

    const response =
      await api.patch(
        `/technical-review/leads/${id}/decision`,
        input
      );


    return response.data;
  };


export const fetchTechnicallyApprovedLeads =
  async (): Promise<
    TechnicalReviewLead[]
  > => {

    const response =
      await api.get(
        "/technical-review/approved"
      );


    return (
      response.data.data ??
      []
    );
  };


export const fetchTechnicallyRejectedLeads =
  async (): Promise<
    TechnicalReviewLead[]
  > => {

    const response =
      await api.get(
        "/technical-review/rejected"
      );


    return (
      response.data.data ??
      []
    );
  };