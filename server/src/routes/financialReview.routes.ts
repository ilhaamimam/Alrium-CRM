import {
  Router,
} from "express";

import {
  getFinancialReviewLeadHandler,
  listFinancialArchive,
  listFinanciallyApprovedLeads,
  listFinancialReviewLeads,
  updateFinancialDecision,
} from "../controllers/financialReview.controller";

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
 * FINANCIAL REVIEW QUEUE
 * Financial Officer only
 * =========================================================
 */

router.get(
  "/financial-review/leads",
  requireAuth,
  allowRoles(
    "financial_officer"
  ),
  listFinancialReviewLeads
);


/*
 * =========================================================
 * FINANCIAL REJECTED ARCHIVE
 *
 * Financial Officer:
 * can view the archive page.
 *
 * Sales Manager:
 * can read rejected leads on Dashboard.
 * =========================================================
 */

router.get(
  "/financial-review/archive",
  requireAuth,
  allowRoles(
    "financial_officer",
    "sales_manager",
    "senior_manager"
  ),
  listFinancialArchive
);


/*
 * =========================================================
 * SINGLE LEAD
 * =========================================================
 */

router.get(
  "/financial-review/leads/:id",
  requireAuth,
  allowRoles(
    "financial_officer"
  ),
  getFinancialReviewLeadHandler
);


/*
 * =========================================================
 * APPROVE / REJECT
 * =========================================================
 */

router.patch(
  "/financial-review/leads/:id/decision",
  requireAuth,
  allowRoles(
    "financial_officer"
  ),
  updateFinancialDecision
);


/*
 * =========================================================
 * TECHNICAL REVIEW QUEUE
 * =========================================================
 */

router.get(
  "/technical-review/financially-approved",
  requireAuth,
  allowRoles(
    "technical_officer"
  ),
  listFinanciallyApprovedLeads
);


export default router;