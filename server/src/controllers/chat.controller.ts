import type {
  Request,
  Response,
} from "express";

import {
  addGroupMembers,
  addMessageReaction,
  createGroupConversation,
  deleteChatMessage,
  editChatMessage,
  getAttachmentSignedUrl,
  getChatConversationMembers,
  getChatConversations,
  getConversationMessages,
  getOrCreateDirectConversation,
  markConversationRead,
  removeGroupMember,
  removeMessageReaction,
  renameGroupConversation,
  searchChatUsers,
  searchConversationMessages,
  sendChatMessage,
  uploadChatAttachment,
} from "../services/chat.service";


/*
 * =========================================================
 * ERROR RESPONSE
 * =========================================================
 */

const sendChatError =
  (
    res: Response,

    error: unknown
  ) => {

    const message =
      error instanceof Error
        ? error.message
        : "Chat request failed";


    const normalized =
      message.toLowerCase();


    let status =
      400;


    if (
      normalized.includes(
        "not a member"
      ) ||
      normalized.includes(
        "only edit"
      ) ||
      normalized.includes(
        "only delete"
      ) ||
      normalized.includes(
        "do not have access"
      )
    ) {

      status =
        403;

    } else if (
      normalized.includes(
        "not found"
      )
    ) {

      status =
        404;
    }


    return res
      .status(status)
      .json({
        success: false,

        message,
      });
  };


/*
 * =========================================================
 * USERS
 * =========================================================
 */

export const listChatUsers =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      if (
        !req.user
      ) {

        return res
          .status(401)
          .json({
            success: false,

            message:
              "Authentication required",
          });
      }


      const search =
        typeof req.query.search ===
        "string"
          ? req.query.search
          : "";


      const users =
        await searchChatUsers(
          req.user.id,
          search
        );


      return res.json({
        success: true,

        data:
          users,
      });

    } catch (error) {

      return sendChatError(
        res,
        error
      );
    }
  };


/*
 * =========================================================
 * CONVERSATIONS
 * =========================================================
 */

export const listChatConversations =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      if (
        !req.user
      ) {

        return res
          .status(401)
          .json({
            success: false,

            message:
              "Authentication required",
          });
      }


      const conversations =
        await getChatConversations(
          req.user.id
        );


      return res.json({
        success: true,

        data:
          conversations,
      });

    } catch (error) {

      return sendChatError(
        res,
        error
      );
    }
  };


export const openDirectChat =
  async (
    req: Request<{
      userId: string;
    }>,
    res: Response
  ) => {

    try {

      if (
        !req.user
      ) {

        return res
          .status(401)
          .json({
            success: false,

            message:
              "Authentication required",
          });
      }


      const conversation =
        await getOrCreateDirectConversation(
          req.user.id,
          req.params.userId
        );


      return res
        .status(200)
        .json({
          success: true,

          data:
            conversation,
        });

    } catch (error) {

      return sendChatError(
        res,
        error
      );
    }
  };


export const listConversationMembers =
  async (
    req: Request<{
      id: string;
    }>,
    res: Response
  ) => {

    try {

      if (
        !req.user
      ) {

        return res
          .status(401)
          .json({
            success: false,

            message:
              "Authentication required",
          });
      }


      const members =
        await getChatConversationMembers(
          req.params.id,
          req.user.id
        );


      return res.json({
        success: true,

        data:
          members,
      });

    } catch (error) {

      return sendChatError(
        res,
        error
      );
    }
  };


/*
 * =========================================================
 * GROUPS
 * =========================================================
 */

export const createChatGroup =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      if (
        !req.user
      ) {

        return res
          .status(401)
          .json({
            success: false,

            message:
              "Authentication required",
          });
      }


      const {
        name,
        memberIds,
      } =
        req.body ??
        {};


      if (
        typeof name !==
        "string"
      ) {

        return res
          .status(400)
          .json({
            success: false,

            message:
              "Group name is required",
          });
      }


      const conversation =
        await createGroupConversation(
          req.user.id,
          name,
          Array.isArray(
            memberIds
          )
            ? memberIds
            : []
        );


      return res
        .status(201)
        .json({
          success: true,

          message:
            "Group created",

          data:
            conversation,
        });

    } catch (error) {

      return sendChatError(
        res,
        error
      );
    }
  };


export const renameChatGroup =
  async (
    req: Request<{
      id: string;
    }>,
    res: Response
  ) => {

    try {

      if (
        !req.user
      ) {

        return res
          .status(401)
          .json({
            success: false,

            message:
              "Authentication required",
          });
      }


      const {
        name,
      } =
        req.body ??
        {};


      if (
        typeof name !==
        "string"
      ) {

        return res
          .status(400)
          .json({
            success: false,

            message:
              "Group name is required",
          });
      }


      const conversation =
        await renameGroupConversation(
          req.params.id,
          req.user.id,
          name
        );


      return res.json({
        success: true,

        data:
          conversation,
      });

    } catch (error) {

      return sendChatError(
        res,
        error
      );
    }
  };


export const addChatGroupMembers =
  async (
    req: Request<{
      id: string;
    }>,
    res: Response
  ) => {

    try {

      if (
        !req.user
      ) {

        return res
          .status(401)
          .json({
            success: false,

            message:
              "Authentication required",
          });
      }


      const {
        memberIds,
      } =
        req.body ??
        {};


      const members =
        await addGroupMembers(
          req.params.id,
          req.user.id,
          Array.isArray(
            memberIds
          )
            ? memberIds
            : []
        );


      return res.json({
        success: true,

        data:
          members,
      });

    } catch (error) {

      return sendChatError(
        res,
        error
      );
    }
  };


export const removeChatGroupMember =
  async (
    req: Request<{
      id: string;

      userId: string;
    }>,
    res: Response
  ) => {

    try {

      if (
        !req.user
      ) {

        return res
          .status(401)
          .json({
            success: false,

            message:
              "Authentication required",
          });
      }


      await removeGroupMember(
        req.params.id,
        req.user.id,
        req.params.userId
      );


      return res.json({
        success: true,

        message:
          "Member removed",
      });

    } catch (error) {

      return sendChatError(
        res,
        error
      );
    }
  };


/*
 * =========================================================
 * MESSAGES
 * =========================================================
 */

export const listChatMessages =
  async (
    req: Request<{
      id: string;
    }>,
    res: Response
  ) => {

    try {

      if (
        !req.user
      ) {

        return res
          .status(401)
          .json({
            success: false,

            message:
              "Authentication required",
          });
      }


      const before =
        typeof req.query.before ===
        "string"
          ? req.query.before
          : undefined;


      const parsedLimit =
        Number(
          req.query.limit ??
          50
        );


      const messages =
        await getConversationMessages(
          req.params.id,
          req.user.id,
          before,
          Number.isFinite(
            parsedLimit
          )
            ? parsedLimit
            : 50
        );


      return res.json({
        success: true,

        data:
          messages,
      });

    } catch (error) {

      return sendChatError(
        res,
        error
      );
    }
  };


export const searchChatMessages =
  async (
    req: Request<{
      id: string;
    }>,
    res: Response
  ) => {

    try {

      if (
        !req.user
      ) {

        return res
          .status(401)
          .json({
            success: false,

            message:
              "Authentication required",
          });
      }


      const search =
        typeof req.query.q ===
        "string"
          ? req.query.q
          : "";


      const messages =
        await searchConversationMessages(
          req.params.id,
          req.user.id,
          search
        );


      return res.json({
        success: true,

        data:
          messages,
      });

    } catch (error) {

      return sendChatError(
        res,
        error
      );
    }
  };


export const createChatMessage =
  async (
    req: Request<{
      id: string;
    }>,
    res: Response
  ) => {

    try {

      if (
        !req.user
      ) {

        return res
          .status(401)
          .json({
            success: false,

            message:
              "Authentication required",
          });
      }


      const {
        body,
        replyToMessageId,
        mentionedUserIds,
      } =
        req.body ??
        {};


      if (
        typeof body !==
        "string"
      ) {

        return res
          .status(400)
          .json({
            success: false,

            message:
              "Message is required",
          });
      }


      const message =
        await sendChatMessage({
          conversationId:
            req.params.id,

          senderId:
            req.user.id,

          body,

          replyToMessageId:
            typeof replyToMessageId ===
              "string"
              ? replyToMessageId
              : null,

          mentionedUserIds:
            Array.isArray(
              mentionedUserIds
            )
              ? mentionedUserIds
              : [],
        });


      return res
        .status(201)
        .json({
          success: true,

          data:
            message,
        });

    } catch (error) {

      return sendChatError(
        res,
        error
      );
    }
  };


export const updateChatMessage =
  async (
    req: Request<{
      id: string;
    }>,
    res: Response
  ) => {

    try {

      if (
        !req.user
      ) {

        return res
          .status(401)
          .json({
            success: false,

            message:
              "Authentication required",
          });
      }


      const {
        body,
        mentionedUserIds,
      } =
        req.body ??
        {};


      if (
        typeof body !==
        "string"
      ) {

        return res
          .status(400)
          .json({
            success: false,

            message:
              "Message is required",
          });
      }


      const message =
        await editChatMessage(
          req.params.id,
          req.user.id,
          body,
          Array.isArray(
            mentionedUserIds
          )
            ? mentionedUserIds
            : []
        );


      return res.json({
        success: true,

        data:
          message,
      });

    } catch (error) {

      return sendChatError(
        res,
        error
      );
    }
  };


export const removeChatMessage =
  async (
    req: Request<{
      id: string;
    }>,
    res: Response
  ) => {

    try {

      if (
        !req.user
      ) {

        return res
          .status(401)
          .json({
            success: false,

            message:
              "Authentication required",
          });
      }


      await deleteChatMessage(
        req.params.id,
        req.user.id
      );


      return res.json({
        success: true,

        message:
          "Message deleted",
      });

    } catch (error) {

      return sendChatError(
        res,
        error
      );
    }
  };


/*
 * =========================================================
 * READ
 * =========================================================
 */

export const markChatRead =
  async (
    req: Request<{
      id: string;
    }>,
    res: Response
  ) => {

    try {

      if (
        !req.user
      ) {

        return res
          .status(401)
          .json({
            success: false,

            message:
              "Authentication required",
          });
      }


      const data =
        await markConversationRead(
          req.params.id,
          req.user.id
        );


      return res.json({
        success: true,

        data,
      });

    } catch (error) {

      return sendChatError(
        res,
        error
      );
    }
  };


/*
 * =========================================================
 * REACTIONS
 * =========================================================
 */

export const addChatReaction =
  async (
    req: Request<{
      id: string;
    }>,
    res: Response
  ) => {

    try {

      if (
        !req.user
      ) {

        return res
          .status(401)
          .json({
            success: false,

            message:
              "Authentication required",
          });
      }


      const {
        emoji,
      } =
        req.body ??
        {};


      if (
        typeof emoji !==
        "string"
      ) {

        return res
          .status(400)
          .json({
            success: false,

            message:
              "Emoji is required",
          });
      }


      const reaction =
        await addMessageReaction(
          req.params.id,
          req.user.id,
          emoji
        );


      return res
        .status(201)
        .json({
          success: true,

          data:
            reaction,
        });

    } catch (error) {

      return sendChatError(
        res,
        error
      );
    }
  };


export const removeChatReaction =
  async (
    req: Request<{
      id: string;
    }>,
    res: Response
  ) => {

    try {

      if (
        !req.user
      ) {

        return res
          .status(401)
          .json({
            success: false,

            message:
              "Authentication required",
          });
      }


      const {
        emoji,
      } =
        req.body ??
        {};


      if (
        typeof emoji !==
        "string"
      ) {

        return res
          .status(400)
          .json({
            success: false,

            message:
              "Emoji is required",
          });
      }


      await removeMessageReaction(
        req.params.id,
        req.user.id,
        emoji
      );


      return res.json({
        success: true,
      });

    } catch (error) {

      return sendChatError(
        res,
        error
      );
    }
  };


/*
 * =========================================================
 * FILES
 * =========================================================
 */

export const uploadChatFile =
  async (
    req: Request<{
      id: string;
    }>,
    res: Response
  ) => {

    try {

      if (
        !req.user
      ) {

        return res
          .status(401)
          .json({
            success: false,

            message:
              "Authentication required",
          });
      }


      if (
        !req.file
      ) {

        return res
          .status(400)
          .json({
            success: false,

            message:
              "File is required",
          });
      }


      let mentionedUserIds:
        string[] =
        [];


      if (
        typeof req.body
          ?.mentionedUserIds ===
        "string"
      ) {

        try {

          const parsed =
            JSON.parse(
              req.body
                .mentionedUserIds
            );


          if (
            Array.isArray(
              parsed
            )
          ) {

            mentionedUserIds =
              parsed;
          }

        } catch {

          mentionedUserIds =
            [];
        }
      }


      const message =
        await uploadChatAttachment({
          conversationId:
            req.params.id,

          senderId:
            req.user.id,

          file:
            req.file,

          body:
            typeof req.body
              ?.body ===
              "string"
              ? req.body.body
              : null,

          replyToMessageId:
            typeof req.body
              ?.replyToMessageId ===
              "string"
              ? req.body
                  .replyToMessageId
              : null,

          mentionedUserIds,
        });


      return res
        .status(201)
        .json({
          success: true,

          data:
            message,
        });

    } catch (error) {

      return sendChatError(
        res,
        error
      );
    }
  };


export const getChatAttachmentUrl =
  async (
    req: Request<{
      id: string;
    }>,
    res: Response
  ) => {

    try {

      if (
        !req.user
      ) {

        return res
          .status(401)
          .json({
            success: false,

            message:
              "Authentication required",
          });
      }


      const data =
        await getAttachmentSignedUrl(
          req.params.id,
          req.user.id
        );


      return res.json({
        success: true,

        data,
      });

    } catch (error) {

      return sendChatError(
        res,
        error
      );
    }
  };