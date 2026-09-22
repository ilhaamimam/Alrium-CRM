import {
  Router,
} from "express";

import {
  listPipelineLeads,
  listPipelineTeamMembers,
  listPipelineTeams,
  listProductionReadyLeads,
} from "../controllers/pipeline.controller";

import {
  requireAuth,
} from "../middleware/auth.middleware";

import {
  allowRoles,
} from "../middleware/role.middleware";


const router =
  Router();


/*
 * =========================================================
 * ALL PIPELINE LEADS
 * =========================================================
 */

router.get(
  "/pipeline/leads",
  requireAuth,
  allowRoles(
    "sales_rep",
    "sales_manager",
    "senior_manager",
    "financial_officer",
    "technical_officer",
    "team_member"
  ),
  listPipelineLeads
);


/*
 * =========================================================
 * PRODUCTION READY LEADS
 *
 * Used by:
 *
 * Sales Manager
 * Senior Manager
 * Technical Officer
 * =========================================================
 */

router.get(
  "/pipeline/production-ready",
  requireAuth,
  allowRoles(
    "sales_manager",
    "senior_manager",
    "technical_officer"
  ),
  listProductionReadyLeads
);


/*
 * =========================================================
 * TEAMS
 * =========================================================
 */

router.get(
  "/pipeline/teams",
  requireAuth,
  allowRoles(
    "sales_manager",
    "senior_manager",
    "technical_officer"
  ),
  listPipelineTeams
);


/*
 * =========================================================
 * TEAM MEMBERS
 * =========================================================
 */

router.get(
  "/pipeline/team-members",
  requireAuth,
  allowRoles(
    "sales_manager",
    "senior_manager",
    "technical_officer"
  ),
  listPipelineTeamMembers
);


export default router;