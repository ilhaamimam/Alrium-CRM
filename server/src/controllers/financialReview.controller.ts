import type {
  Request,
  Response,
} from "express";

import {
  getFinanciallyApprovedLeads,
  getFinancialReviewLead,
  getFinancialReviewLeads,
  getRejectedFinancialLeads,
  saveFinancialDecision,
} from "../services/financialReview.service";


/*
 * =========================================================
 * LIST ALL LEADS
 * =========================================================
 */

export const listFinancialReviewLeads =
  async (
    _req: Request,
    res: Response
  ) => {

    try {

      const leads =
        await getFinancialReviewLeads();


      return res
        .status(200)
        .json({
          success: true,

          data:
            leads,
        });

    } catch (error) {

      console.error(
        "LIST FINANCIAL REVIEW ERROR:",
        error
      );


      return res
        .status(500)
        .json({
          success: false,

          message:
            error instanceof Error
              ? error.message
              : "Unable to load financial review leads",
        });
    }
  };


/*
 * =========================================================
 * GET ONE LEAD
 * =========================================================
 */

export const getFinancialReviewLeadHandler =
  async (
    req:
      Request<{
        id: string;
      }>,
    res:
      Response
  ) => {

    try {

      const lead =
        await getFinancialReviewLead(
          req.params.id
        );


      return res
        .status(200)
        .json({
          success: true,

          data:
            lead,
        });

    } catch (error) {

      return res
        .status(404)
        .json({
          success: false,

          message:
            error instanceof Error
              ? error.message
              : "Lead not found",
        });
    }
  };


/*
 * =========================================================
 * APPROVE / REJECT
 * =========================================================
 */

export const updateFinancialDecision =
  async (
    req:
      Request<{
        id: string;
      }>,
    res:
      Response
  ) => {

    try {

      if (!req.user) {

        return res
          .status(401)
          .json({
            success: false,

            message:
              "Authentication required",
          });
      }


      const {
        decision,
        notes,
      } =
        req.body ?? {};


      /*
       * Only these two decisions are allowed
       * from Financial Review.
       */

      if (
        decision !==
          "approved" &&
        decision !==
          "rejected"
      ) {

        return res
          .status(400)
          .json({
            success: false,

            message:
              "Decision must be approved or rejected",
          });
      }


      const review =
        await saveFinancialDecision({
          leadId:
            req.params.id,

          decision,

          notes:
            typeof notes ===
              "string" &&
            notes.trim()
              ? notes.trim()
              : null,

          reviewedBy:
            req.user.id,
        });


      return res
        .status(200)
        .json({
          success: true,

          message:
            decision ===
              "approved"
              ? "Lead approved and sent to Technical Review"
              : "Lead rejected and moved to archive",

          data:
            review,
        });

    } catch (error) {

      console.error(
        "FINANCIAL DECISION ERROR:",
        error
      );


      return res
        .status(500)
        .json({
          success: false,

          message:
            error instanceof Error
              ? error.message
              : "Unable to save financial review",
        });
    }
  };


/*
 * =========================================================
 * REJECTED ARCHIVE
 * =========================================================
 */

export const listFinancialArchive =
  async (
    _req: Request,
    res: Response
  ) => {

    try {

      const leads =
        await getRejectedFinancialLeads();


      return res
        .status(200)
        .json({
          success: true,

          data:
            leads,
        });

    } catch (error) {

      return res
        .status(500)
        .json({
          success: false,

          message:
            error instanceof Error
              ? error.message
              : "Unable to load archive",
        });
    }
  };


/*
 * =========================================================
 * APPROVED FOR TECHNICAL REVIEW
 *
 * We create the endpoint now.
 * Your Technical Officer page can use this later.
 * =========================================================
 */

export const listFinanciallyApprovedLeads =
  async (
    _req: Request,
    res: Response
  ) => {

    try {

      const leads =
        await getFinanciallyApprovedLeads();


      return res
        .status(200)
        .json({
          success: true,

          data:
            leads,
        });

    } catch (error) {

      return res
        .status(500)
        .json({
          success: false,

          message:
            error instanceof Error
              ? error.message
              : "Unable to load approved leads",
        });
    }
  };