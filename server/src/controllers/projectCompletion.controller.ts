import {
  Request,
  Response,
} from "express";

import {
  confirmProjectCompletion,
  getCompletionReviewById,
  getCompletionReviews,
  getFinalProjectUpdates,
  getProjectCompletionStatus,
  requestProjectCompletionChanges,
  submitProjectCompletion,
  type CompletionReviewStatus,
} from "../services/projectCompletion.service";


const validReviewStatuses:
  CompletionReviewStatus[] =
[
  "not_submitted",
  "pending_review",
  "changes_requested",
  "confirmed",
];


/*
 * =========================================================
 * GET PROJECT COMPLETION STATUS
 * =========================================================
 */

export const getCompletionStatus =
  async (
    req: Request<{
      id: string;
    }>,
    res: Response
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


      const data =
        await getProjectCompletionStatus(
          req.params.id,
          req.user.id,
          req.user.role || ""
        );


      return res
        .status(200)
        .json({
          success: true,
          data,
        });

    } catch (error) {

      console.error(
        "GET COMPLETION STATUS ERROR:",
        error
      );


      return res
        .status(403)
        .json({
          success: false,

          message:
            error instanceof Error
              ? error.message
              : "Unable to load completion status",
        });
    }
  };


/*
 * =========================================================
 * TEAM SUBMITS PROJECT
 * =========================================================
 */

export const submitCompletion =
  async (
    req: Request<{
      id: string;
    }>,
    res: Response
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
        completionNotes,
      } =
        req.body ?? {};


      const project =
        await submitProjectCompletion(
          req.params.id,
          req.user.id,
          req.user.role || "",
          typeof completionNotes ===
            "string"
            ? completionNotes.trim()
            : null
        );


      return res
        .status(200)
        .json({
          success: true,

          message:
            "Project submitted for Senior Manager review",

          data:
            project,
        });

    } catch (error) {

      console.error(
        "SUBMIT PROJECT COMPLETION ERROR:",
        error
      );


      return res
        .status(400)
        .json({
          success: false,

          message:
            error instanceof Error
              ? error.message
              : "Unable to submit project",
        });
    }
  };


/*
 * =========================================================
 * SENIOR MANAGER REVIEW LIST
 * =========================================================
 */

export const listCompletionReviews =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const requestedStatus =
        typeof req.query.status ===
          "string"
          ? req.query.status
          : undefined;


      let status:
        CompletionReviewStatus |
        undefined;


      if (
        requestedStatus &&
        validReviewStatuses
          .includes(
            requestedStatus as
              CompletionReviewStatus
          )
      ) {
        status =
          requestedStatus as
            CompletionReviewStatus;
      }


      const data =
        await getCompletionReviews(
          status
        );


      return res
        .status(200)
        .json({
          success: true,
          data,
        });

    } catch (error) {

      console.error(
        "LIST COMPLETION REVIEWS ERROR:",
        error
      );


      return res
        .status(500)
        .json({
          success: false,

          message:
            error instanceof Error
              ? error.message
              : "Unable to load completion reviews",
        });
    }
  };


/*
 * =========================================================
 * SENIOR MANAGER ONE REVIEW
 * =========================================================
 */

export const getSingleCompletionReview =
  async (
    req: Request<{
      id: string;
    }>,
    res: Response
  ) => {

    try {

      const data =
        await getCompletionReviewById(
          req.params.id
        );


      return res
        .status(200)
        .json({
          success: true,
          data,
        });

    } catch (error) {

      return res
        .status(404)
        .json({
          success: false,

          message:
            error instanceof Error
              ? error.message
              : "Completion review not found",
        });
    }
  };


/*
 * =========================================================
 * SENIOR MANAGER CONFIRMS DONE
 * =========================================================
 */

export const confirmCompletion =
  async (
    req: Request<{
      id: string;
    }>,
    res: Response
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
        reviewNotes,
      } =
        req.body ?? {};


      const data =
        await confirmProjectCompletion(
          req.params.id,
          req.user.id,
          typeof reviewNotes ===
            "string"
            ? reviewNotes.trim()
            : null
        );


      return res
        .status(200)
        .json({
          success: true,

          message:
            "Project confirmed Done. Final update is now available to Sales/Marketing.",

          data,
        });

    } catch (error) {

      console.error(
        "CONFIRM COMPLETION ERROR:",
        error
      );


      return res
        .status(400)
        .json({
          success: false,

          message:
            error instanceof Error
              ? error.message
              : "Unable to confirm project",
        });
    }
  };


/*
 * =========================================================
 * SENIOR MANAGER REQUESTS CHANGES
 * =========================================================
 */

export const requestChanges =
  async (
    req: Request<{
      id: string;
    }>,
    res: Response
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
        reviewNotes,
      } =
        req.body ?? {};


      if (
        typeof reviewNotes !==
          "string" ||
        !reviewNotes.trim()
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Review notes are required",
          });
      }


      const data =
        await requestProjectCompletionChanges(
          req.params.id,
          req.user.id,
          reviewNotes
        );


      return res
        .status(200)
        .json({
          success: true,

          message:
            "Changes requested from the project team",

          data,
        });

    } catch (error) {

      console.error(
        "REQUEST COMPLETION CHANGES ERROR:",
        error
      );


      return res
        .status(400)
        .json({
          success: false,

          message:
            error instanceof Error
              ? error.message
              : "Unable to request changes",
        });
    }
  };


/*
 * =========================================================
 * SALES / MARKETING FINAL UPDATES
 * =========================================================
 */

export const listFinalUpdates =
  async (
    req: Request,
    res: Response
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


      const data =
        await getFinalProjectUpdates(
          req.user.id,
          req.user.role || ""
        );


      return res
        .status(200)
        .json({
          success: true,
          data,
        });

    } catch (error) {

      console.error(
        "FINAL PROJECT UPDATES ERROR:",
        error
      );


      return res
        .status(500)
        .json({
          success: false,

          message:
            error instanceof Error
              ? error.message
              : "Unable to load final project updates",
        });
    }
  };