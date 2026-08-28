import {
  Router,
} from "express";

import {
  addApprovedLeadBoardItem,
  editApprovedLeadBoardItem,
  getSingleApprovedLeadBoardItem,
  listApprovedLeadBoard,
  listAvailableApprovedLeads,
} from "../controllers/approvedLeadBoard.controller";

import {
  requireAuth,
} from "../middleware/auth.middleware";

import {
  allowRoles,
} from "../middleware/role.middleware";


const router =
  Router();


/*
 * IMPORTANT:
 * /available must appear BEFORE /:id
 */
router.get(
  "/lead-board/available",
  requireAuth,
  allowRoles(
    "senior_manager"
  ),
  listAvailableApprovedLeads
);


router.get(
  "/lead-board",
  requireAuth,
  allowRoles(
    "senior_manager"
  ),
  listApprovedLeadBoard
);


router.get(
  "/lead-board/:id",
  requireAuth,
  allowRoles(
    "senior_manager"
  ),
  getSingleApprovedLeadBoardItem
);


router.post(
  "/lead-board",
  requireAuth,
  allowRoles(
    "senior_manager"
  ),
  addApprovedLeadBoardItem
);


router.patch(
  "/lead-board/:id",
  requireAuth,
  allowRoles(
    "senior_manager"
  ),
  editApprovedLeadBoardItem
);


export default router;