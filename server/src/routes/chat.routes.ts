import {
  Router,
} from "express";

import multer from "multer";

import {
  addChatGroupMembers,
  addChatReaction,
  createChatGroup,
  createChatMessage,
  getChatAttachmentUrl,
  listChatConversations,
  listChatMessages,
  listChatUsers,
  listConversationMembers,
  markChatRead,
  openDirectChat,
  removeChatGroupMember,
  removeChatMessage,
  removeChatReaction,
  renameChatGroup,
  searchChatMessages,
  updateChatMessage,
  uploadChatFile,
} from "../controllers/chat.controller";

import {
  requireAuth,
} from "../middleware/auth.middleware";

import {
  requireChatGroupOwner,
} from "../middleware/chatGroupOwner.middleware";


const router =
  Router();


/*
 * =========================================================
 * FILE UPLOAD CONFIGURATION
 * =========================================================
 */

const allowedMimeTypes =
  new Set([
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",

    "application/pdf",

    "text/plain",
    "text/csv",

    "application/msword",

    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

    "application/vnd.ms-excel",

    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ]);


const upload =
  multer({
    storage:
      multer.memoryStorage(),

    limits: {
      fileSize:
        10 *
        1024 *
        1024,
    },

    fileFilter: (
      _req,
      file,
      callback
    ) => {

      if (
        allowedMimeTypes.has(
          file.mimetype
        )
      ) {

        callback(
          null,
          true
        );

        return;
      }


      callback(
        new Error(
          "Unsupported file type"
        )
      );
    },
  });


/*
 * =========================================================
 * CHAT USERS
 *
 * All authenticated CRM users can access Chat.
 * =========================================================
 */

router.get(
  "/chat/users",

  requireAuth,

  listChatUsers
);


/*
 * =========================================================
 * CONVERSATIONS
 * =========================================================
 */

router.get(
  "/chat/conversations",

  requireAuth,

  listChatConversations
);


/*
 * =========================================================
 * DIRECT / PERSONAL CHAT
 *
 * Every authenticated CRM user can start a direct chat.
 * =========================================================
 */

router.post(
  "/chat/direct/:userId",

  requireAuth,

  openDirectChat
);


/*
 * =========================================================
 * CONVERSATION MEMBERS
 * =========================================================
 */

router.get(
  "/chat/conversations/:id/members",

  requireAuth,

  listConversationMembers
);


/*
 * =========================================================
 * CREATE GROUP
 *
 * IMPORTANT:
 *
 * EVERY authenticated CRM user can create groups.
 *
 * There is NO:
 *
 * allowRoles(...)
 *
 * sales_manager restriction
 *
 * senior_manager restriction
 *
 * role check of any kind.
 * =========================================================
 */

router.post(
  "/chat/groups",

  requireAuth,

  createChatGroup
);


/*
 * =========================================================
 * MANAGE EXISTING GROUP
 *
 * The creator/owner manages their own group.
 * CRM role does not matter.
 * =========================================================
 */

router.patch(
  "/chat/groups/:id",

  requireAuth,

  requireChatGroupOwner,

  renameChatGroup
);


router.post(
  "/chat/groups/:id/members",

  requireAuth,

  requireChatGroupOwner,

  addChatGroupMembers
);


router.delete(
  "/chat/groups/:id/members/:userId",

  requireAuth,

  requireChatGroupOwner,

  removeChatGroupMember
);


/*
 * =========================================================
 * MESSAGES
 * =========================================================
 */

router.get(
  "/chat/conversations/:id/messages",

  requireAuth,

  listChatMessages
);


router.get(
  "/chat/conversations/:id/search",

  requireAuth,

  searchChatMessages
);


router.post(
  "/chat/conversations/:id/messages",

  requireAuth,

  createChatMessage
);


router.post(
  "/chat/conversations/:id/read",

  requireAuth,

  markChatRead
);


/*
 * =========================================================
 * EDIT MESSAGE
 * =========================================================
 */

router.patch(
  "/chat/messages/:id",

  requireAuth,

  updateChatMessage
);


/*
 * =========================================================
 * DELETE MESSAGE
 * =========================================================
 */

router.delete(
  "/chat/messages/:id",

  requireAuth,

  removeChatMessage
);


/*
 * =========================================================
 * REACTIONS
 * =========================================================
 */

router.post(
  "/chat/messages/:id/reactions",

  requireAuth,

  addChatReaction
);


router.delete(
  "/chat/messages/:id/reactions",

  requireAuth,

  removeChatReaction
);


/*
 * =========================================================
 * ATTACHMENTS
 * =========================================================
 */

router.post(
  "/chat/conversations/:id/attachments",

  requireAuth,

  upload.single(
    "file"
  ),

  uploadChatFile
);


router.get(
  "/chat/attachments/:id/url",

  requireAuth,

  getChatAttachmentUrl
);


export default router;