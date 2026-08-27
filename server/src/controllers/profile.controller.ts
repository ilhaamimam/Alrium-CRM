import {
  Request,
  Response,
} from "express";

import {
  getProfileByUserId,
  getSalesRepresentatives,
} from "../services/profile.service";

export const getMe = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const profile =
      await getProfileByUserId(req.user.id);

    if (!profile.is_active) {
      return res.status(403).json({
        success: false,
        message: "Your CRM account is inactive",
      });
    }

    return res.json({
      success: true,
      data: {
        user: profile,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load user profile",
    });
  }
};

export const listSalesRepresentatives =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const salesReps =
        await getSalesRepresentatives();


      return res.status(200).json({
        success: true,
        data: salesReps,
      });

    } catch (error) {
      console.error(
        "GET SALES REPS ERROR:",
        error
      );


      return res.status(500).json({
        success: false,
        message:
          "Unable to load sales representatives",
      });
    }
  };