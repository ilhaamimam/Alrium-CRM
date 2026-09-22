import {
  api,
} from "../../api/http";

import type {
  FinancialReviewLead,
  ReviewDecisionInput,
} from "./financialReview.types";


/*
 * =========================================================
 * ALL LEADS
 * =========================================================
 */

export const fetchFinancialReviewLeads =
  async (): Promise<
    FinancialReviewLead[]
  > => {

    const response =
      await api.get(
        "/financial-review/leads"
      );


    return (
      response.data.data ??
      []
    );
  };


/*
 * =========================================================
 * ONE LEAD
 * =========================================================
 */

export const fetchFinancialReviewLead =
  async (
    id: string
  ): Promise<
    FinancialReviewLead
  > => {

    const response =
      await api.get(
        `/financial-review/leads/${id}`
      );


    return response.data.data;
  };


/*
 * =========================================================
 * APPROVE / REJECT
 * =========================================================
 */

export const saveFinancialReviewDecision =
  async (
    id: string,
    input:
      ReviewDecisionInput
  ) => {

    const response =
      await api.patch(
        `/financial-review/leads/${id}/decision`,
        input
      );


    return response.data;
  };


/*
 * =========================================================
 * ARCHIVE
 * =========================================================
 */

export const fetchFinancialArchive =
  async (): Promise<
    FinancialReviewLead[]
  > => {

    const response =
      await api.get(
        "/financial-review/archive"
      );


    return (
      response.data.data ??
      []
    );
  };