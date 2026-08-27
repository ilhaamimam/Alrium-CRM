import { Router } from "express";

import {
  addCompany,
  editCompany,
  getSingleCompany,
  listCompanies,
} from "../controllers/company.controller";

import {
  requireAuth,
} from "../middleware/auth.middleware";

import {
  allowRoles,
} from "../middleware/role.middleware";

const router = Router();


// GET all companies
router.get(
  "/companies",
  requireAuth,
  listCompanies
);


// GET one company
router.get(
  "/companies/:id",
  requireAuth,
  getSingleCompany
);


// CREATE company
router.post(
  "/companies",
  requireAuth,
  allowRoles(
    "sales_manager",
    "sales_rep",
    "senior_manager"
  ),
  addCompany
);


// UPDATE company
router.patch(
  "/companies/:id",
  requireAuth,
  allowRoles(
    "sales_manager",
    "sales_rep",
    "senior_manager"
  ),
  editCompany
);


export default router;