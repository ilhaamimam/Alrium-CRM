import { Router } from "express";

import {
  addContact,
  editContact,
  getSingleContact,
  listContacts,
} from "../controllers/contact.controller";

import {
  requireAuth,
} from "../middleware/auth.middleware";

import {
  allowRoles,
} from "../middleware/role.middleware";


const router = Router();


router.get(
  "/contacts",
  requireAuth,
  listContacts
);


router.get(
  "/contacts/:id",
  requireAuth,
  getSingleContact
);


router.post(
  "/contacts",
  requireAuth,
  allowRoles(
    "sales_manager",
    "sales_rep",
    "senior_manager"
  ),
  addContact
);


router.patch(
  "/contacts/:id",
  requireAuth,
  allowRoles(
    "sales_manager",
    "sales_rep",
    "senior_manager"
  ),
  editContact
);


export default router;

