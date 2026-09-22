import {
  Router,
} from "express";

import {
  confirmCompletion,
  getCompletionStatus,
  getSingleCompletionReview,
  listCompletionReviews,
  listFinalUpdates,
  requestChanges,
  submitCompletion,
} from "../controllers/projectCompletion.controller";

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
 * TEAM MEMBER COMPLETION WORKFLOW
 *
 * Team members work on the assigned project.
 *
 * Sales Manager and Senior Manager are also allowed
 * to inspect/use these project completion endpoints.
 * =========================================================
 */


/*
 * GET COMPLETION STATUS
 */

router.get(
  "/project-completion/projects/:id/status",

  requireAuth,

  allowRoles(
    "team_member",
    "sales_manager",
    "senior_manager"
  ),

  getCompletionStatus
);


/*
 * SUBMIT PROJECT FOR COMPLETION REVIEW
 *
 * Once submitted, the project should enter:
 *
 * completion_review_status = pending
 */

router.post(
  "/project-completion/projects/:id/submit",

  requireAuth,

  allowRoles(
    "team_member",
    "sales_manager",
    "senior_manager"
  ),

  submitCompletion
);


/*
 * =========================================================
 * FINAL PROJECT UPDATES
 *
 * Sales / Marketing final updates.
 *
 * IMPORTANT:
 * Keep this route BEFORE /reviews/:id or other generic
 * dynamic routes.
 * =========================================================
 */

router.get(
  "/project-completion/final-updates",

  requireAuth,

  allowRoles(
    "sales_rep",
    "sales_manager"
  ),

  listFinalUpdates
);


/*
 * =========================================================
 * PROJECT COMPLETION REVIEW
 *
 * BOTH management roles now have the same permissions:
 *
 * sales_manager
 * senior_manager
 * =========================================================
 */


/*
 * LIST REVIEWS
 *
 * Supports:
 *
 * ?status=pending
 * ?status=changes_required
 * ?status=confirmed
 *
 * No status query = All
 */

router.get(
  "/project-completion/reviews",

  requireAuth,

  allowRoles(
    "sales_manager",
    "senior_manager"
  ),

  listCompletionReviews
);


/*
 * GET ONE REVIEW
 */

router.get(
  "/project-completion/reviews/:id",

  requireAuth,

  allowRoles(
    "sales_manager",
    "senior_manager"
  ),

  getSingleCompletionReview
);


/*
 * CONFIRM PROJECT COMPLETION
 *
 * The review becomes:
 *
 * completion_review_status = confirmed
 */

router.post(
  "/project-completion/reviews/:id/confirm",

  requireAuth,

  allowRoles(
    "sales_manager",
    "senior_manager"
  ),

  confirmCompletion
);


/*
 * REQUEST CHANGES
 *
 * The review becomes:
 *
 * completion_review_status = changes_required
 */

router.post(
  "/project-completion/reviews/:id/request-changes",

  requireAuth,

  allowRoles(
    "sales_manager",
    "senior_manager"
  ),

  requestChanges
);


export default router;