import type {
  NextFunction,
  Request,
  Response,
} from "express";


/*
 * =========================================================
 * ROLE AUTHORIZATION MIDDLEWARE
 * =========================================================
 *
 * Usage:
 *
 * allowRoles(
 *   "sales_rep",
 *   "sales_manager",
 *   "senior_manager"
 * )
 *
 * The user must already have been authenticated by
 * requireAuth before this middleware runs.
 * =========================================================
 */

export const allowRoles =
  (
    ...allowedRoles: string[]
  ) => {

    return (
      req: Request,
      res: Response,
      next: NextFunction
    ) => {

      /*
       * -----------------------------------------
       * Make sure authentication middleware
       * attached a user to req.
       * -----------------------------------------
       */

      if (!req.user) {

        return res
          .status(401)
          .json({
            success: false,

            message:
              "Authentication required",
          });
      }


      /*
       * -----------------------------------------
       * Get role safely.
       *
       * Your Request user type currently allows
       * role to possibly be undefined, so we
       * check it before using includes().
       * -----------------------------------------
       */

      const userRole =
        req.user.role;


      if (
        !userRole ||
        typeof userRole !==
          "string"
      ) {

        return res
          .status(403)
          .json({
            success: false,

            message:
              "User role is missing",
          });
      }


      /*
       * -----------------------------------------
       * Check whether this role is allowed.
       * -----------------------------------------
       */

      if (
        !allowedRoles.includes(
          userRole
        )
      ) {

        return res
          .status(403)
          .json({
            success: false,

            message:
              "You do not have permission to perform this action",
          });
      }


      /*
       * -----------------------------------------
       * Role accepted.
       * Continue to controller.
       * -----------------------------------------
       */

      next();
    };
  };