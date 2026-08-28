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
 * ---------------------------------------------------------
 * Team Member completion workflow
 * ---------------------------------------------------------
 */

router.get(
  "/project-completion/projects/:id/status",
  requireAuth,
  allowRoles(
    "team_member",
    "senior_manager"
  ),
  getCompletionStatus
);


router.post(
  "/project-completion/projects/:id/submit",
  requireAuth,
  allowRoles(
    "team_member",
    "senior_manager"
  ),
  submitCompletion
);


/*
 * ---------------------------------------------------------
 * Sales / Marketing final updates
 *
 * Put this before any generic :id routes.
 * ---------------------------------------------------------
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
 * ---------------------------------------------------------
 * Senior Manager review
 * ---------------------------------------------------------
 */

router.get(
  "/project-completion/reviews",
  requireAuth,
  allowRoles(
    "senior_manager"
  ),
  listCompletionReviews
);


router.get(
  "/project-completion/reviews/:id",
  requireAuth,
  allowRoles(
    "senior_manager"
  ),
  getSingleCompletionReview
);


router.post(
  "/project-completion/reviews/:id/confirm",
  requireAuth,
  allowRoles(
    "senior_manager"
  ),
  confirmCompletion
);


router.post(
  "/project-completion/reviews/:id/request-changes",
  requireAuth,
  allowRoles(
    "senior_manager"
  ),
  requestChanges
);


export default router;