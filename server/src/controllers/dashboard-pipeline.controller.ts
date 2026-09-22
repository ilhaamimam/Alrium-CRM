import type {
  Request,
  Response,
} from "express";

import {
  getDashboardPipeline,
} from "../services/dashboard-pipeline.service";


/*
 * =========================================================
 * GET DASHBOARD PIPELINE
 *
 * GET /api/dashboard/pipeline
 *
 * Accessible to every authenticated CRM user.
 *
 * This endpoint is READ ONLY.
 *
 * It does not update:
 *
 * - leads
 * - financial reviews
 * - technical reviews
 * - projects
 * - team allocation
 * - completion review
 *
 * It only returns the current live CRM pipeline.
 * =========================================================
 */

export const getDashboardPipelineController =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      /*
       * Authentication middleware should already have
       * populated req.user.
       */

      if (
        !req.user
      ) {

        return res
          .status(401)
          .json({
            success:
              false,

            message:
              "Authentication required",
          });
      }


      /*
       * -----------------------------------------------------
       * LOAD COMPLETE CRM PIPELINE
       *
       * IMPORTANT:
       *
       * We intentionally do NOT check:
       *
       * req.user.role
       *
       * because every authenticated CRM user should be able
       * to VIEW this dashboard pipeline.
       * -----------------------------------------------------
       */

      const pipeline =
        await getDashboardPipeline();


      /*
       * -----------------------------------------------------
       * SUMMARY
       *
       * This is useful later on the Dashboard for showing
       * the number of leads in each pipeline stage.
       * -----------------------------------------------------
       */

      const summary = {

        total:
          pipeline.length,


        new:
          pipeline.filter(
            (
              lead
            ) =>
              lead.pipeline_stage ===
              "new"
          ).length,


        financial_review:
          pipeline.filter(
            (
              lead
            ) =>
              lead.pipeline_stage ===
              "financial_review"
          ).length,


        technical_review:
          pipeline.filter(
            (
              lead
            ) =>
              lead.pipeline_stage ===
              "technical_review"
          ).length,


        approved:
          pipeline.filter(
            (
              lead
            ) =>
              lead.pipeline_stage ===
              "approved"
          ).length,


        team_allocated:
          pipeline.filter(
            (
              lead
            ) =>
              lead.pipeline_stage ===
              "team_allocated"
          ).length,


        in_progress:
          pipeline.filter(
            (
              lead
            ) =>
              lead.pipeline_stage ===
              "in_progress"
          ).length,


        completion_review:
          pipeline.filter(
            (
              lead
            ) =>
              lead.pipeline_stage ===
              "completion_review"
          ).length,


        completed:
          pipeline.filter(
            (
              lead
            ) =>
              lead.pipeline_stage ===
              "completed"
          ).length,


        rejected:
          pipeline.filter(
            (
              lead
            ) =>
              lead.pipeline_state ===
              "rejected"
          ).length,


        changes_required:
          pipeline.filter(
            (
              lead
            ) =>
              lead.pipeline_state ===
              "changes_required"
          ).length,
      };


      /*
       * -----------------------------------------------------
       * RESPONSE
       * -----------------------------------------------------
       */

      return res
        .status(200)
        .json({
          success:
            true,

          data: {
            summary,

            leads:
              pipeline,
          },
        });

    } catch (error) {

      console.error(
        "GET DASHBOARD PIPELINE ERROR:",
        error
      );


      const message =
        error instanceof Error
          ? error.message
          : "Unable to load dashboard pipeline";


      return res
        .status(500)
        .json({
          success:
            false,

          message,
        });
    }
  };