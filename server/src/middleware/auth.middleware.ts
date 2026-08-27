import {
  NextFunction,
  Request,
  Response,
} from "express";

import {
  supabaseAdmin,
  supabaseAuth,
} from "../config/supabase";

import type { AppRole } from "../types/auth";


export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authorization =
      req.headers.authorization;

    if (
      !authorization ||
      !authorization.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }


    const token =
      authorization.substring(7);


    const {
      data: { user },
      error: authError,
    } = await supabaseAuth.auth.getUser(token);


    if (authError || !user) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }


    const {
      data: profile,
      error: profileError,
    } = await supabaseAdmin
      .from("profiles")
      .select(
        `
        id,
        email,
        role,
        is_active
        `
      )
      .eq("id", user.id)
      .single();


    if (profileError || !profile) {
      return res.status(403).json({
        success: false,
        message: "CRM profile not found",
      });
    }


    if (!profile.is_active) {
      return res.status(403).json({
        success: false,
        message: "CRM account is inactive",
      });
    }


    req.accessToken = token;

    req.user = {
      id: user.id,
      email: user.email,
      role: profile.role as AppRole,
    };


    next();
  } catch (error) {
    console.error(
      "Authentication middleware error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Authentication verification failed",
    });
  }
};