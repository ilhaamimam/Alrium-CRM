import {
  Router,
} from "express";

import {
  createContactHandler,
  deleteContactHandler,
  getContactHandler,
  getContactsHandler,
  updateContactHandler,
} from "../controllers/contact.controller";

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
 * CONTACT ROUTES
 * =========================================================
 */


/*
 * GET ALL
 *
 * GET /api/contacts
 */
router.get(
  "/contacts",
  requireAuth,
  allowRoles(
    "sales_rep",
    "sales_manager",
    "senior_manager"
  ),
  getContactsHandler
);


/*
 * GET ONE
 *
 * GET /api/contacts/:id
 */
router.get(
  "/contacts/:id",
  requireAuth,
  allowRoles(
    "sales_rep",
    "sales_manager",
    "senior_manager"
  ),
  getContactHandler
);


/*
 * CREATE
 *
 * POST /api/contacts
 */
router.post(
  "/contacts",
  requireAuth,
  allowRoles(
    "sales_rep",
    "sales_manager",
    "senior_manager"
  ),
  createContactHandler
);


/*
 * UPDATE
 *
 * PATCH /api/contacts/:id
 */
router.patch(
  "/contacts/:id",
  requireAuth,
  allowRoles(
    "sales_rep",
    "sales_manager",
    "senior_manager"
  ),
  updateContactHandler
);


/*
 * DELETE
 *
 * DELETE /api/contacts/:id
 */
router.delete(
  "/contacts/:id",
  requireAuth,
  allowRoles(
    "sales_rep",
    "sales_manager",
    "senior_manager"
  ),
  deleteContactHandler
);


export default router;