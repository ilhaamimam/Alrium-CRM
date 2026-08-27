import { api } from "../../api/http";

import type {
  CreateLeadInput,
  Lead,
  SalesRepresentative,
  UpdateLeadInput,
} from "./lead.types";


export const fetchLeads =
  async (): Promise<Lead[]> => {
    const response =
      await api.get(
        "/leads"
      );

    return response.data.data;
  };


export const fetchLeadById =
  async (
    leadId: string
  ): Promise<Lead> => {
    const response =
      await api.get(
        `/leads/${leadId}`
      );

    return response.data.data;
  };


export const createLead =
  async (
    input: CreateLeadInput
  ): Promise<Lead> => {
    const response =
      await api.post(
        "/leads",
        input
      );

    return response.data.data;
  };


export const updateLead =
  async (
    leadId: string,
    input: UpdateLeadInput
  ): Promise<Lead> => {
    const response =
      await api.patch(
        `/leads/${leadId}`,
        input
      );

    return response.data.data;
  };


export const removeLead =
  async (
    leadId: string
  ): Promise<void> => {
    await api.delete(
      `/leads/${leadId}`
    );
  };


export const fetchSalesRepresentatives =
  async (): Promise<
    SalesRepresentative[]
  > => {
    const response =
      await api.get(
        "/sales-reps"
      );

    return response.data.data;
  };