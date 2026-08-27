import {
  NextFunction,
  Request,
  Response,
} from "express";

import type { AppRole } from "../types/auth";

export const allowRoles = (
  ...allowedRoles: AppRole[]
) => {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!req.user.role) {
      return res.status(403).json({
        success: false,
        message: "CRM role not loaded",
      });
    }

    if (
      !allowedRoles.includes(req.user.role)
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have permission to perform this action",
      });
    }

    next();
  };
};