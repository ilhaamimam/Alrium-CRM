import type {
  Request,
  Response,
} from "express";

import {
  getAvailableTeamMembers,
  getProductionReadyLeads,
  getTechnicallyRejectedLeads,
  getTechnicalReviewLead,
  getTechnicalReviewLeads,
  saveTechnicalDecision,
} from "../services/technicalReview.service";


/*
 * =========================================================
 * TECHNICAL REVIEW LEADS
 * =========================================================
 */

export const listTechnicalReviewLeads =
  async (
    _req: Request,
    res: Response
  ) => {

    try {

      const leads =
        await getTechnicalReviewLeads();


      return res
        .status(200)
        .json({
          success: true,

          data:
            leads,
        });

    } catch (error) {

      console.error(
        "TECHNICAL REVIEW LIST ERROR:",
        error
      );


      return res
        .status(500)
        .json({
          success: false,

          message:
            error instanceof Error
              ? error.message
              : "Unable to load Technical Review leads",
        });
    }
  };


/*
 * =========================================================
 * ONE LEAD
 * =========================================================
 */

export const getTechnicalReviewLeadHandler =
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
        await getTechnicalReviewLead(
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
 * AVAILABLE MEMBERS
 * =========================================================
 */

export const listAvailableTeamMembers =
  async (
    _req: Request,
    res: Response
  ) => {

    try {

      const members =
        await getAvailableTeamMembers();


      return res
        .status(200)
        .json({
          success: true,

          data:
            members,
        });

    } catch (error) {

      return res
        .status(500)
        .json({
          success: false,

          message:
            error instanceof Error
              ? error.message
              : "Unable to load available team members",
        });
    }
  };


/*
 * =========================================================
 * DECISION
 * =========================================================
 */

export const updateTechnicalDecision =
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


      /*
       * Rejection reason should be required.
       */

      if (
        decision ===
          "rejected" &&
        (
          typeof notes !==
            "string" ||
          !notes.trim()
        )
      ) {

        return res
          .status(400)
          .json({
            success: false,

            message:
              "Please provide the reason for rejecting this lead",
          });
      }


      const review =
        await saveTechnicalDecision({
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
              ? "Technical Review approved. Lead is now Hot and ready for Production."
              : "Technical Review rejected. Lead remains Cold and Sales Manager has been notified.",

          data:
            review,
        });

    } catch (error) {

      console.error(
        "TECHNICAL DECISION ERROR:",
        error
      );


      return res
        .status(500)
        .json({
          success: false,

          message:
            error instanceof Error
              ? error.message
              : "Unable to save Technical Review",
        });
    }
  };


/*
 * =========================================================
 * SALES MANAGER RESULTS
 * =========================================================
 */

export const listProductionReadyLeads =
  async (
    _req: Request,
    res: Response
  ) => {

    try {

      const leads =
        await getProductionReadyLeads();


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
            "Unable to load production-ready leads",
        });
    }
  };


export const listTechnicallyRejectedLeads =
  async (
    _req: Request,
    res: Response
  ) => {

    try {

      const leads =
        await getTechnicallyRejectedLeads();


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
            "Unable to load technically rejected leads",
        });
    }
  };