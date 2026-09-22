import {
  Router,
} from "express";

import {
  getDashboardPipelineController,
} from "../controllers/dashboard-pipeline.controller";

import {
  requireAuth,
} from "../middleware/auth.middleware";


const router =
  Router();


/*
 * =========================================================
 * DASHBOARD PIPELINE ROUTES
 * =========================================================
 *
 * Every authenticated CRM role can VIEW this pipeline:
 *
 * - sales_manager
 * - senior_manager
 * - sales_rep
 * - financial_officer
 * - technical_officer
 * - team_member
 *
 * There is intentionally NO allowRoles(...) middleware.
 *
 * The pipeline is READ ONLY.
 * =========================================================
 */


/*
 * GET
 *
 * /api/dashboard/pipeline
 */

router.get(
  "/dashboard/pipeline",

  requireAuth,

  getDashboardPipelineController
);


export default router;