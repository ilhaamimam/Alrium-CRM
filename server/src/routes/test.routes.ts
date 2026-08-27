import { Router } from "express";

import { requireAuth } from "../middleware/auth.middleware";
import { allowRoles } from "../middleware/role.middleware";

const router = Router();

router.get(
  "/manager-test",
  requireAuth,
  allowRoles(
    "sales_manager",
    "senior_manager"
  ),
  (req, res) => {
    res.json({
      success: true,
      message: "Manager authorization works",
      user: req.user,
    });
  }
);

export default router;