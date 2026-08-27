import { Router } from "express";

import {
  addLead,
  editLead,
  getSingleLead,
  listLeads,
  removeLead,
} from "../controllers/lead.controller";

import {
  requireAuth,
} from "../middleware/auth.middleware";

import {
  allowRoles,
} from "../middleware/role.middleware";


const router = Router();


router.get(
  "/leads",
  requireAuth,
  allowRoles(
    "sales_rep",
    "sales_manager",
    "senior_manager"
  ),
  listLeads
);


router.get(
  "/leads/:id",
  requireAuth,
  allowRoles(
    "sales_rep",
    "sales_manager",
    "senior_manager"
  ),
  getSingleLead
);


router.post(
  "/leads",
  requireAuth,
  allowRoles(
    "sales_rep",
    "sales_manager",
    "senior_manager"
  ),
  addLead
);


router.patch(
  "/leads/:id",
  requireAuth,
  allowRoles(
    "sales_rep",
    "sales_manager",
    "senior_manager"
  ),
  editLead
);


router.delete(
  "/leads/:id",
  requireAuth,
  allowRoles(
    "sales_manager",
    "senior_manager"
  ),
  removeLead
);


export default router;