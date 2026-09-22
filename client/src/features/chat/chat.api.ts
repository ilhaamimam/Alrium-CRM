import {
  api,
} from "../../api/http";

import type {
  ChatConversation,
  ChatConversationMember,
  ChatMessage,
  ChatProfile,
} from "./chat.types";


export const fetchChatUsers =
  async (
    search:
      string =
      ""
  ): Promise<
    ChatProfile[]
  > => {

    const response =
      await api.get(
        "/chat/users",
        {
          params:
            search
              ? {
                  search,
                }
              : {},
        }
      );


    return (
      response.data?.data ??
      []
    );
  };


export const fetchChatConversations =
  async (): Promise<
    ChatConversation[]
  > => {

    const response =
      await api.get(
        "/chat/conversations"
      );


    return (
      response.data?.data ??
      []
    );
  };


export const openDirectConversation =
  async (
    userId: string
  ) => {

    const response =
      await api.post(
        `/chat/direct/${userId}`
      );


    return response.data
      ?.data;
  };


export const fetchConversationMembers =
  async (
    conversationId:
      string
  ): Promise<
    ChatConversationMember[]
  > => {

    const response =
      await api.get(
        `/chat/conversations/${conversationId}/members`
      );


    return (
      response.data?.data ??
      []
    );
  };


export const createChatGroup =
  async (
    name: string,

    memberIds:
      string[]
  ) => {

    const response =
      await api.post(
        "/chat/groups",
        {
          name,
          memberIds,
        }
      );


    return response.data
      ?.data;
  };


export const renameChatGroup =
  async (
    conversationId:
      string,

    name: string
  ) => {

    const response =
      await api.patch(
        `/chat/groups/${conversationId}`,
        {
          name,
        }
      );


    return response.data
      ?.data;
  };


export const addChatGroupMembers =
  async (
    conversationId:
      string,

    memberIds:
      string[]
  ) => {

    const response =
      await api.post(
        `/chat/groups/${conversationId}/members`,
        {
          memberIds,
        }
      );


    return response.data
      ?.data;
  };


export const removeChatGroupMember =
  async (
    conversationId:
      string,

    userId: string
  ) => {

    await api.delete(
      `/chat/groups/${conversationId}/members/${userId}`
    );
  };


export const fetchChatMessages =
  async (
    conversationId:
      string,

    before?:
      string
  ): Promise<
    ChatMessage[]
  > => {

    const response =
      await api.get(
        `/chat/conversations/${conversationId}/messages`,
        {
          params: {
            limit:
              50,

            ...(before
              ? {
                  before,
                }
              : {}),
          },
        }
      );


    return (
      response.data?.data ??
      []
    );
  };


export const searchChatMessages =
  async (
    conversationId:
      string,

    search: string
  ): Promise<
    ChatMessage[]
  > => {

    const response =
      await api.get(
        `/chat/conversations/${conversationId}/search`,
        {
          params: {
            q:
              search,
          },
        }
      );


    return (
      response.data?.data ??
      []
    );
  };


export const sendChatMessage =
  async (
    conversationId:
      string,

    input: {
      body: string;

      replyToMessageId?:
        string | null;

      mentionedUserIds?:
        string[];
    }
  ): Promise<
    ChatMessage
  > => {

    const response =
      await api.post(
        `/chat/conversations/${conversationId}/messages`,
        input
      );


    return response.data
      ?.data;
  };


export const editChatMessage =
  async (
    messageId: string,

    body: string,

    mentionedUserIds:
      string[]
  ) => {

    const response =
      await api.patch(
        `/chat/messages/${messageId}`,
        {
          body,
          mentionedUserIds,
        }
      );


    return response.data
      ?.data;
  };


export const deleteChatMessage =
  async (
    messageId: string
  ) => {

    await api.delete(
      `/chat/messages/${messageId}`
    );
  };


export const markChatConversationRead =
  async (
    conversationId:
      string
  ) => {

    const response =
      await api.post(
        `/chat/conversations/${conversationId}/read`
      );


    return response.data
      ?.data;
  };


export const addChatReaction =
  async (
    messageId: string,

    emoji: string
  ) => {

    const response =
      await api.post(
        `/chat/messages/${messageId}/reactions`,
        {
          emoji,
        }
      );


    return response.data
      ?.data;
  };


export const removeChatReaction =
  async (
    messageId: string,

    emoji: string
  ) => {

    await api.delete(
      `/chat/messages/${messageId}/reactions`,
      {
        data: {
          emoji,
        },
      }
    );
  };


export const uploadChatAttachment =
  async (
    conversationId:
      string,

    file: File,

    input?: {
      body?: string;

      replyToMessageId?:
        string | null;

      mentionedUserIds?:
        string[];
    }
  ) => {

    const form =
      new FormData();


    form.append(
      "file",
      file
    );


    if (
      input?.body
    ) {

      form.append(
        "body",
        input.body
      );
    }


    if (
      input
        ?.replyToMessageId
    ) {

      form.append(
        "replyToMessageId",
        input
          .replyToMessageId
      );
    }


    form.append(
      "mentionedUserIds",
      JSON.stringify(
        input
          ?.mentionedUserIds ??
          []
      )
    );


    const response =
      await api.post(
        `/chat/conversations/${conversationId}/attachments`,
        form
      );


    return response.data
      ?.data;
  };


export const fetchChatAttachmentUrl =
  async (
    attachmentId:
      string
  ) => {

    const response =
      await api.get(
        `/chat/attachments/${attachmentId}/url`
      );


    return response.data
      ?.data as {
        url: string;

        file_name:
          string;

        mime_type:
          string;
      };
  };