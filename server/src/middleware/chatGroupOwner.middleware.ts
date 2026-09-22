import type {
  NextFunction,
  Request,
  Response,
} from "express";

import {
  supabaseAdmin,
} from "../config/supabase";


/*
 * =========================================================
 * CHAT GROUP OWNER PERMISSION
 *
 * This middleware has NOTHING to do with CRM roles.
 *
 * sales_manager
 * senior_manager
 * sales_rep
 * financial_officer
 * technical_officer
 * team_member
 *
 * can all CREATE groups.
 *
 * This middleware is only used AFTER a group exists,
 * when somebody wants to manage that group.
 * =========================================================
 */

export const requireChatGroupOwner =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {

    try {

      if (
        !req.user
      ) {

        return res
          .status(401)
          .json({
            success:
              false,

            message:
              "Authentication required",
          });
      }


      const conversationId =
        req.params.id;


      if (
        !conversationId
      ) {

        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Group ID is required",
          });
      }


      const {
        data:
          conversation,

        error,
      } =
        await supabaseAdmin
          .from(
            "chat_conversations"
          )
          .select(`
            id,
            type,
            created_by
          `)
          .eq(
            "id",
            conversationId
          )
          .maybeSingle();


      if (
        error
      ) {

        console.error(
          "CHAT GROUP OWNER CHECK ERROR:",
          error
        );


        return res
          .status(500)
          .json({
            success:
              false,

            message:
              "Unable to verify group ownership",
          });
      }


      if (
        !conversation
      ) {

        return res
          .status(404)
          .json({
            success:
              false,

            message:
              "Chat group not found",
          });
      }


      if (
        conversation.type !==
        "group"
      ) {

        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "This conversation is not a group",
          });
      }


      if (
        conversation
          .created_by !==
        req.user.id
      ) {

        return res
          .status(403)
          .json({
            success:
              false,

            message:
              "Only the group owner can manage this group",
          });
      }


      next();

    } catch (error) {

      console.error(
        "CHAT GROUP OWNER MIDDLEWARE ERROR:",
        error
      );


      return res
        .status(500)
        .json({
          success:
            false,

          message:
            "Unable to verify group permissions",
        });
    }
  };