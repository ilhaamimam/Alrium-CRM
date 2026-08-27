import { Router } from "express";

import { requireAuth } from "../middleware/auth.middleware";

import {
  getMe,
  listSalesRepresentatives,
} from "../controllers/profile.controller";
const router = Router();

router.get(
  "/me",
  requireAuth,
  getMe
);

router.get(
  "/sales-reps",
  requireAuth,
  listSalesRepresentatives
);

export default router;