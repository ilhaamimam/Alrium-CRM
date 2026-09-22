import {
  Router,
} from "express";

import {
  getTechnicalReviewLeadHandler,
  listAvailableTeamMembers,
  listProductionReadyLeads,
  listTechnicallyRejectedLeads,
  listTechnicalReviewLeads,
  updateTechnicalDecision,
} from "../controllers/technicalReview.controller";

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
 * TECHNICAL OFFICER
 *
 * Technical Officer can:
 * - View financially approved leads
 * - View available team members
 * - Open one technical review lead
 * - Approve / reject a technical review
 * =========================================================
 */

router.get(
  "/technical-review/leads",

  requireAuth,

  allowRoles(
    "technical_officer"
  ),

  listTechnicalReviewLeads
);


router.get(
  "/technical-review/team-members",

  requireAuth,

  allowRoles(
    "technical_officer"
  ),

  listAvailableTeamMembers
);


router.get(
  "/technical-review/leads/:id",

  requireAuth,

  allowRoles(
    "technical_officer"
  ),

  getTechnicalReviewLeadHandler
);


router.patch(
  "/technical-review/leads/:id/decision",

  requireAuth,

  allowRoles(
    "technical_officer"
  ),

  updateTechnicalDecision
);


/*
 * =========================================================
 * SALES MANAGER + SENIOR MANAGER
 *
 * Both management roles can READ the results of
 * Technical Review.
 *
 * They cannot approve or reject Technical Review.
 * =========================================================
 */


/*
 * APPROVED / PRODUCTION READY
 */

router.get(
  "/technical-review/approved",

  requireAuth,

  allowRoles(
    "sales_manager",
    "senior_manager"
  ),

  listProductionReadyLeads
);


/*
 * TECHNICALLY REJECTED
 */

router.get(
  "/technical-review/rejected",

  requireAuth,

  allowRoles(
    "sales_manager",
    "senior_manager"
  ),

  listTechnicallyRejectedLeads
);


export default router;