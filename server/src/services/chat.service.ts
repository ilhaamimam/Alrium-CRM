import {
  supabaseAdmin,
} from "../config/supabase";


export type ChatConversationType =
  | "direct"
  | "group";


interface SendMessageInput {
  conversationId: string;

  senderId: string;

  body: string;

  replyToMessageId?:
    string | null;

  mentionedUserIds?:
    string[];
}


interface UploadAttachmentInput {
  conversationId: string;

  senderId: string;

  file:
    Express.Multer.File;

  body?:
    string | null;

  replyToMessageId?:
    string | null;

  mentionedUserIds?:
    string[];
}


/*
 * =========================================================
 * HELPERS
 * =========================================================
 */

const unique =
  <T,>(
    values: T[]
  ): T[] =>
    [
      ...new Set(
        values
      ),
    ];


const getProfileMap =
  async (
    userIds: string[]
  ) => {

    if (
      userIds.length ===
      0
    ) {

      return new Map<
        string,
        any
      >();
    }


    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from("profiles")
        .select(`
          id,
          full_name,
          email,
          role,
          availability_status,
          is_active
        `)
        .in(
          "id",
          unique(
            userIds
          )
        );


    if (
      error
    ) {

      throw new Error(
        `Unable to load chat profiles: ${error.message}`
      );
    }


    return new Map(
      (
        data ??
        []
      ).map(
        (
          profile
        ) => [
          profile.id,
          profile,
        ]
      )
    );
  };


const ensureConversationMember =
  async (
    conversationId: string,

    userId: string
  ) => {

    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from(
          "chat_conversation_members"
        )
        .select(`
          conversation_id,
          user_id,
          member_role,
          joined_at,
          last_read_at
        `)
        .eq(
          "conversation_id",
          conversationId
        )
        .eq(
          "user_id",
          userId
        )
        .maybeSingle();


    if (
      error
    ) {

      throw new Error(
        `Unable to verify chat membership: ${error.message}`
      );
    }


    if (
      !data
    ) {

      throw new Error(
        "You are not a member of this conversation"
      );
    }


    return data;
  };


const getConversation =
  async (
    conversationId: string
  ) => {

    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from(
          "chat_conversations"
        )
        .select(`
          id,
          type,
          name,
          direct_key,
          created_by,
          last_message_at,
          created_at,
          updated_at
        `)
        .eq(
          "id",
          conversationId
        )
        .maybeSingle();


    if (
      error
    ) {

      throw new Error(
        `Unable to load conversation: ${error.message}`
      );
    }


    if (
      !data
    ) {

      throw new Error(
        "Conversation not found"
      );
    }


    return data;
  };


const getConversationMemberIds =
  async (
    conversationId: string
  ) => {

    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from(
          "chat_conversation_members"
        )
        .select(
          "user_id"
        )
        .eq(
          "conversation_id",
          conversationId
        );


    if (
      error
    ) {

      throw new Error(
        `Unable to load conversation members: ${error.message}`
      );
    }


    return (
      data ??
      []
    ).map(
      (
        row
      ) =>
        row.user_id
    );
  };


const validateMentionUsers =
  async (
    conversationId: string,

    mentionedUserIds:
      string[]
  ) => {

    const ids =
      unique(
        mentionedUserIds
      );


    if (
      ids.length ===
      0
    ) {

      return [];
    }


    const memberIds =
      await getConversationMemberIds(
        conversationId
      );


    const invalid =
      ids.filter(
        (
          id
        ) =>
          !memberIds.includes(
            id
          )
      );


    if (
      invalid.length >
      0
    ) {

      throw new Error(
        "A mentioned user is not a member of this conversation"
      );
    }


    return ids;
  };


const validateReplyMessage =
  async (
    conversationId: string,

    replyToMessageId?:
      string | null
  ) => {

    if (
      !replyToMessageId
    ) {

      return;
    }


    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from(
          "chat_messages"
        )
        .select(`
          id,
          conversation_id
        `)
        .eq(
          "id",
          replyToMessageId
        )
        .maybeSingle();


    if (
      error ||
      !data
    ) {

      throw new Error(
        "Reply message not found"
      );
    }


    if (
      data.conversation_id !==
      conversationId
    ) {

      throw new Error(
        "Cannot reply to a message from another conversation"
      );
    }
  };


const hydrateMessages =
  async (
    messageRows: any[],

    currentUserId:
      string
  ) => {

    if (
      messageRows.length ===
      0
    ) {

      return [];
    }


    const messageIds =
      messageRows.map(
        (
          message
        ) =>
          message.id
      );


    const replyIds =
      unique(
        messageRows
          .map(
            (
              message
            ) =>
              message
                .reply_to_message_id
          )
          .filter(
            Boolean
          )
      ) as string[];


    let replyRows:
      any[] =
      [];


    if (
      replyIds.length >
      0
    ) {

      const {
        data,
        error,
      } =
        await supabaseAdmin
          .from(
            "chat_messages"
          )
          .select(`
            id,
            body,
            sender_id,
            deleted_at,
            created_at
          `)
          .in(
            "id",
            replyIds
          );


      if (
        error
      ) {

        throw new Error(
          `Unable to load replied messages: ${error.message}`
        );
      }


      replyRows =
        data ??
        [];
    }


    const senderIds =
      unique(
        [
          ...messageRows.map(
            (
              message
            ) =>
              message.sender_id
          ),

          ...replyRows.map(
            (
              reply
            ) =>
              reply.sender_id
          ),
        ]
      );


    const profileMap =
      await getProfileMap(
        senderIds
      );


    const [
      attachmentsResult,
      reactionsResult,
      mentionsResult,
      readsResult,
    ] =
      await Promise.all([
        supabaseAdmin
          .from(
            "chat_attachments"
          )
          .select(`
            id,
            message_id,
            conversation_id,
            uploaded_by,
            storage_path,
            file_name,
            mime_type,
            size_bytes,
            created_at
          `)
          .in(
            "message_id",
            messageIds
          ),

        supabaseAdmin
          .from(
            "chat_reactions"
          )
          .select(`
            message_id,
            user_id,
            emoji,
            created_at
          `)
          .in(
            "message_id",
            messageIds
          ),

        supabaseAdmin
          .from(
            "chat_mentions"
          )
          .select(`
            message_id,
            user_id
          `)
          .in(
            "message_id",
            messageIds
          ),

        supabaseAdmin
          .from(
            "chat_message_reads"
          )
          .select(`
            message_id,
            user_id,
            read_at
          `)
          .in(
            "message_id",
            messageIds
          ),
      ]);


    if (
      attachmentsResult.error
    ) {

      throw new Error(
        `Unable to load attachments: ${attachmentsResult.error.message}`
      );
    }


    if (
      reactionsResult.error
    ) {

      throw new Error(
        `Unable to load reactions: ${reactionsResult.error.message}`
      );
    }


    if (
      mentionsResult.error
    ) {

      throw new Error(
        `Unable to load mentions: ${mentionsResult.error.message}`
      );
    }


    if (
      readsResult.error
    ) {

      throw new Error(
        `Unable to load read receipts: ${readsResult.error.message}`
      );
    }


    const mentionedProfileIds =
      unique(
        (
          mentionsResult.data ??
          []
        ).map(
          (
            mention
          ) =>
            mention.user_id
        )
      );


    const mentionProfileMap =
      await getProfileMap(
        mentionedProfileIds
      );


    return messageRows.map(
      (
        message
      ) => {

        const messageReactions =
          (
            reactionsResult.data ??
            []
          ).filter(
            (
              reaction
            ) =>
              reaction.message_id ===
              message.id
          );


        const reactionGroups =
          unique(
            messageReactions.map(
              (
                reaction
              ) =>
                reaction.emoji
            )
          ).map(
            (
              emoji
            ) => {

              const matching =
                messageReactions.filter(
                  (
                    reaction
                  ) =>
                    reaction.emoji ===
                    emoji
                );


              return {
                emoji,

                count:
                  matching.length,

                user_ids:
                  matching.map(
                    (
                      reaction
                    ) =>
                      reaction.user_id
                  ),

                reacted_by_me:
                  matching.some(
                    (
                      reaction
                    ) =>
                      reaction.user_id ===
                      currentUserId
                  ),
              };
            }
          );


        const reply =
          replyRows.find(
            (
              item
            ) =>
              item.id ===
              message
                .reply_to_message_id
          );


        return {
          ...message,

          sender:
            profileMap.get(
              message.sender_id
            ) ??
            null,

          reply_to:
            reply
              ? {
                  ...reply,

                  sender:
                    profileMap.get(
                      reply.sender_id
                    ) ??
                    null,
                }
              : null,

          attachments:
            (
              attachmentsResult.data ??
              []
            ).filter(
              (
                attachment
              ) =>
                attachment.message_id ===
                message.id
            ),

          reactions:
            reactionGroups,

          mentions:
            (
              mentionsResult.data ??
              []
            )
              .filter(
                (
                  mention
                ) =>
                  mention.message_id ===
                  message.id
              )
              .map(
                (
                  mention
                ) => ({
                  user_id:
                    mention.user_id,

                  profile:
                    mentionProfileMap.get(
                      mention.user_id
                    ) ??
                    null,
                })
              ),

          read_by:
            (
              readsResult.data ??
              []
            )
              .filter(
                (
                  read
                ) =>
                  read.message_id ===
                  message.id
              )
              .map(
                (
                  read
                ) =>
                  read.user_id
              ),
        };
      }
    );
  };


const getMessageById =
  async (
    messageId: string,

    currentUserId:
      string
  ) => {

    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from(
          "chat_messages"
        )
        .select("*")
        .eq(
          "id",
          messageId
        )
        .maybeSingle();


    if (
      error ||
      !data
    ) {

      throw new Error(
        "Message not found"
      );
    }


    await ensureConversationMember(
      data.conversation_id,
      currentUserId
    );


    const hydrated =
      await hydrateMessages(
        [
          data,
        ],
        currentUserId
      );


    return hydrated[0];
  };


/*
 * =========================================================
 * CHAT USERS
 * =========================================================
 */

export const searchChatUsers =
  async (
    currentUserId: string,

    search:
      string
  ) => {

    let query =
      supabaseAdmin
        .from("profiles")
        .select(`
          id,
          full_name,
          email,
          role,
          availability_status
        `)
        .eq(
          "is_active",
          true
        )
        .neq(
          "id",
          currentUserId
        )
        .order(
          "full_name",
          {
            ascending: true,
          }
        )
        .limit(100);


    const normalized =
      search.trim();


    if (
      normalized
    ) {

      query =
        query.or(
          `full_name.ilike.%${normalized}%,email.ilike.%${normalized}%`
        );
    }


    const {
      data,
      error,
    } =
      await query;


    if (
      error
    ) {

      throw new Error(
        `Unable to search users: ${error.message}`
      );
    }


    return (
      data ??
      []
    );
  };


/*
 * =========================================================
 * CONVERSATION MEMBERS
 * =========================================================
 */

export const getChatConversationMembers =
  async (
    conversationId: string,

    currentUserId:
      string
  ) => {

    await ensureConversationMember(
      conversationId,
      currentUserId
    );


    const {
      data:
        members,

      error,
    } =
      await supabaseAdmin
        .from(
          "chat_conversation_members"
        )
        .select(`
          conversation_id,
          user_id,
          member_role,
          joined_at,
          last_read_at
        `)
        .eq(
          "conversation_id",
          conversationId
        )
        .order(
          "joined_at",
          {
            ascending: true,
          }
        );


    if (
      error
    ) {

      throw new Error(
        `Unable to load conversation members: ${error.message}`
      );
    }


    const profileMap =
      await getProfileMap(
        (
          members ??
          []
        ).map(
          (
            member
          ) =>
            member.user_id
        )
      );


    return (
      members ??
      []
    ).map(
      (
        member
      ) => ({
        ...member,

        profile:
          profileMap.get(
            member.user_id
          ) ??
          null,
      })
    );
  };


/*
 * =========================================================
 * CONVERSATION LIST
 * =========================================================
 */

export const getChatConversations =
  async (
    userId: string
  ) => {

    const {
      data:
        currentMemberships,

      error:
        membershipError,
    } =
      await supabaseAdmin
        .from(
          "chat_conversation_members"
        )
        .select(`
          conversation_id,
          joined_at,
          last_read_at,
          member_role
        `)
        .eq(
          "user_id",
          userId
        );


    if (
      membershipError
    ) {

      throw new Error(
        `Unable to load conversations: ${membershipError.message}`
      );
    }


    const memberships =
      currentMemberships ??
      [];


    const conversationIds =
      memberships.map(
        (
          membership
        ) =>
          membership
            .conversation_id
      );


    if (
      conversationIds.length ===
      0
    ) {

      return [];
    }


    const {
      data:
        conversations,

      error:
        conversationError,
    } =
      await supabaseAdmin
        .from(
          "chat_conversations"
        )
        .select(`
          id,
          type,
          name,
          direct_key,
          created_by,
          last_message_at,
          created_at,
          updated_at
        `)
        .in(
          "id",
          conversationIds
        );


    if (
      conversationError
    ) {

      throw new Error(
        `Unable to load conversations: ${conversationError.message}`
      );
    }


    const {
      data:
        allMemberships,

      error:
        allMembershipsError,
    } =
      await supabaseAdmin
        .from(
          "chat_conversation_members"
        )
        .select(`
          conversation_id,
          user_id,
          member_role,
          joined_at,
          last_read_at
        `)
        .in(
          "conversation_id",
          conversationIds
        );


    if (
      allMembershipsError
    ) {

      throw new Error(
        `Unable to load conversation users: ${allMembershipsError.message}`
      );
    }


    const profileMap =
      await getProfileMap(
        unique(
          (
            allMemberships ??
            []
          ).map(
            (
              member
            ) =>
              member.user_id
          )
        )
      );


    const result =
      await Promise.all(
        (
          conversations ??
          []
        ).map(
          async (
            conversation
          ) => {

            const myMembership =
              memberships.find(
                (
                  membership
                ) =>
                  membership
                    .conversation_id ===
                  conversation.id
              );


            const conversationMembers =
              (
                allMemberships ??
                []
              )
                .filter(
                  (
                    member
                  ) =>
                    member
                      .conversation_id ===
                    conversation.id
                )
                .map(
                  (
                    member
                  ) => ({
                    ...member,

                    profile:
                      profileMap.get(
                        member.user_id
                      ) ??
                      null,
                  })
                );


            const {
              data:
                lastMessages,

              error:
                lastMessageError,
            } =
              await supabaseAdmin
                .from(
                  "chat_messages"
                )
                .select(`
                  id,
                  sender_id,
                  body,
                  message_type,
                  deleted_at,
                  created_at
                `)
                .eq(
                  "conversation_id",
                  conversation.id
                )
                .order(
                  "created_at",
                  {
                    ascending:
                      false,
                  }
                )
                .limit(1);


            if (
              lastMessageError
            ) {

              throw new Error(
                `Unable to load last message: ${lastMessageError.message}`
              );
            }


            const lastMessage =
              lastMessages?.[0];


            let unreadQuery =
              supabaseAdmin
                .from(
                  "chat_messages"
                )
                .select(
                  "id",
                  {
                    count:
                      "exact",

                    head:
                      true,
                  }
                )
                .eq(
                  "conversation_id",
                  conversation.id
                )
                .neq(
                  "sender_id",
                  userId
                )
                .is(
                  "deleted_at",
                  null
                );


            const readBoundary =
              myMembership
                ?.last_read_at ||
              myMembership
                ?.joined_at;


            if (
              readBoundary
            ) {

              unreadQuery =
                unreadQuery.gt(
                  "created_at",
                  readBoundary
                );
            }


            const {
              count:
                unreadCount,

              error:
                unreadError,
            } =
              await unreadQuery;


            if (
              unreadError
            ) {

              throw new Error(
                `Unable to calculate unread messages: ${unreadError.message}`
              );
            }


            let mentionQuery =
              supabaseAdmin
                .from(
                  "chat_mentions"
                )
                .select(
                  "message_id",
                  {
                    count:
                      "exact",

                    head:
                      true,
                  }
                )
                .eq(
                  "conversation_id",
                  conversation.id
                )
                .eq(
                  "user_id",
                  userId
                );


            if (
              readBoundary
            ) {

              mentionQuery =
                mentionQuery.gt(
                  "created_at",
                  readBoundary
                );
            }


            const {
              count:
                mentionCount,

              error:
                mentionError,
            } =
              await mentionQuery;


            if (
              mentionError
            ) {

              throw new Error(
                `Unable to calculate mentions: ${mentionError.message}`
              );
            }


            return {
              ...conversation,

              members:
                conversationMembers,

              unread_count:
                unreadCount ??
                0,

              unread_mention_count:
                mentionCount ??
                0,

              last_message:
                lastMessage
                  ? {
                      ...lastMessage,

                      sender:
                        profileMap.get(
                          lastMessage.sender_id
                        ) ??
                        null,
                    }
                  : null,
            };
          }
        )
      );


    return result.sort(
      (
        a,
        b
      ) => {

        const aTime =
          a.last_message_at ||
          a.created_at;

        const bTime =
          b.last_message_at ||
          b.created_at;


        return (
          new Date(
            bTime
          ).getTime() -
          new Date(
            aTime
          ).getTime()
        );
      }
    );
  };


/*
 * =========================================================
 * DIRECT CHAT
 * =========================================================
 */

export const getOrCreateDirectConversation =
  async (
    currentUserId: string,

    otherUserId: string
  ) => {

    if (
      currentUserId ===
      otherUserId
    ) {

      throw new Error(
        "You cannot create a direct chat with yourself"
      );
    }


    const {
      data:
        otherUser,

      error:
        otherUserError,
    } =
      await supabaseAdmin
        .from("profiles")
        .select(`
          id,
          is_active
        `)
        .eq(
          "id",
          otherUserId
        )
        .maybeSingle();


    if (
      otherUserError ||
      !otherUser ||
      otherUser
        .is_active ===
        false
    ) {

      throw new Error(
        "Chat user not found"
      );
    }


    const directKey =
      [
        currentUserId,
        otherUserId,
      ]
        .sort()
        .join(":");


    const {
      data:
        existing,
    } =
      await supabaseAdmin
        .from(
          "chat_conversations"
        )
        .select(`
          id,
          type,
          name,
          direct_key,
          created_by,
          last_message_at,
          created_at,
          updated_at
        `)
        .eq(
          "direct_key",
          directKey
        )
        .maybeSingle();


    if (
      existing
    ) {

      /*
       * Repair memberships if necessary.
       */

      await supabaseAdmin
        .from(
          "chat_conversation_members"
        )
        .upsert(
          [
            {
              conversation_id:
                existing.id,

              user_id:
                currentUserId,

              member_role:
                "member",
            },

            {
              conversation_id:
                existing.id,

              user_id:
                otherUserId,

              member_role:
                "member",
            },
          ],
          {
            onConflict:
              "conversation_id,user_id",
          }
        );


      return existing;
    }


    const {
      data:
        conversation,

      error:
        conversationError,
    } =
      await supabaseAdmin
        .from(
          "chat_conversations"
        )
        .insert({
          type:
            "direct",

          direct_key:
            directKey,

          created_by:
            currentUserId,
        })
        .select()
        .single();


    if (
      conversationError ||
      !conversation
    ) {

      /*
       * A simultaneous request may have created it.
       */

      const {
        data:
          retry,
      } =
        await supabaseAdmin
          .from(
            "chat_conversations"
          )
          .select()
          .eq(
            "direct_key",
            directKey
          )
          .maybeSingle();


      if (
        retry
      ) {

        return retry;
      }


      throw new Error(
        `Unable to create direct chat: ${
          conversationError
            ?.message ||
          "Unknown error"
        }`
      );
    }


    const {
      error:
        memberError,
    } =
      await supabaseAdmin
        .from(
          "chat_conversation_members"
        )
        .insert([
          {
            conversation_id:
              conversation.id,

            user_id:
              currentUserId,

            member_role:
              "member",
          },

          {
            conversation_id:
              conversation.id,

            user_id:
              otherUserId,

            member_role:
              "member",
          },
        ]);


    if (
      memberError
    ) {

      await supabaseAdmin
        .from(
          "chat_conversations"
        )
        .delete()
        .eq(
          "id",
          conversation.id
        );


      throw new Error(
        `Unable to create direct chat members: ${memberError.message}`
      );
    }


    return conversation;
  };


/*
 * =========================================================
 * GROUP CHAT
 * =========================================================
 */

export const createGroupConversation =
  async (
    userId: string,
    name: string,
    memberUserIds: string[]
  ) => {

    const cleanName =
      name.trim();


    if (
      !cleanName
    ) {

      throw new Error(
        "Group name is required"
      );
    }


    const uniqueMemberIds =
      Array.from(
        new Set([
          userId,
          ...memberUserIds,
        ])
      );


    /*
     * create conversation
     */

    const {
      data:
        conversation,

      error:
        conversationError,
    } =
      await supabaseAdmin
        .from(
          "chat_conversations"
        )
        .insert({
          type:
            "group",

          name:
            cleanName,

          created_by:
            userId,
        })
        .select()
        .single();


    if (
      conversationError ||
      !conversation
    ) {

      throw new Error(
        conversationError
          ?.message ||
        "Unable to create group"
      );
    }


    /*
     * creator = owner
     * everybody else = member
     */

    const rows =
      uniqueMemberIds.map(
        (
          memberUserId
        ) => ({
          conversation_id:
            conversation.id,

          user_id:
            memberUserId,

          member_role:
            memberUserId ===
            userId
              ? "owner"
              : "member",
        })
      );


    const {
      error:
        memberError,
    } =
      await supabaseAdmin
        .from(
          "chat_conversation_members"
        )
        .insert(
          rows
        );


    if (
      memberError
    ) {

      /*
       * Clean up incomplete conversation.
       */

      await supabaseAdmin
        .from(
          "chat_conversations"
        )
        .delete()
        .eq(
          "id",
          conversation.id
        );


      throw new Error(
        memberError.message
      );
    }


    return conversation;
  };


export const renameGroupConversation =
  async (
    conversationId: string,

    managerId: string,

    name: string
  ) => {

    await ensureConversationMember(
      conversationId,
      managerId
    );


    const conversation =
      await getConversation(
        conversationId
      );


    if (
      conversation.type !==
      "group"
    ) {

      throw new Error(
        "Only group chats can be renamed"
      );
    }


    const normalized =
      name.trim();


    if (
      !normalized
    ) {

      throw new Error(
        "Group name is required"
      );
    }


    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from(
          "chat_conversations"
        )
        .update({
          name:
            normalized,
        })
        .eq(
          "id",
          conversationId
        )
        .select()
        .single();


    if (
      error ||
      !data
    ) {

      throw new Error(
        `Unable to rename group: ${
          error?.message ||
          "Unknown error"
        }`
      );
    }


    return data;
  };


export const addGroupMembers =
  async (
    conversationId: string,

    managerId: string,

    memberIds:
      string[]
  ) => {

    await ensureConversationMember(
      conversationId,
      managerId
    );


    const conversation =
      await getConversation(
        conversationId
      );


    if (
      conversation.type !==
      "group"
    ) {

      throw new Error(
        "Members can only be added to a group chat"
      );
    }


    const ids =
      unique(
        memberIds
      );


    if (
      ids.length ===
      0
    ) {

      return [];
    }


    const profileMap =
      await getProfileMap(
        ids
      );


    if (
      profileMap.size !==
      ids.length
    ) {

      throw new Error(
        "One or more selected users do not exist"
      );
    }


    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from(
          "chat_conversation_members"
        )
        .upsert(
          ids.map(
            (
              userId
            ) => ({
              conversation_id:
                conversationId,

              user_id:
                userId,

              member_role:
                "member",
            })
          ),
          {
            onConflict:
              "conversation_id,user_id",
          }
        )
        .select();


    if (
      error
    ) {

      throw new Error(
        `Unable to add group members: ${error.message}`
      );
    }


    return (
      data ??
      []
    );
  };


export const removeGroupMember =
  async (
    conversationId: string,

    managerId: string,

    userId: string
  ) => {

    await ensureConversationMember(
      conversationId,
      managerId
    );


    const conversation =
      await getConversation(
        conversationId
      );


    if (
      conversation.type !==
      "group"
    ) {

      throw new Error(
        "Members can only be removed from group chats"
      );
    }


    if (
      conversation.created_by ===
      userId
    ) {

      throw new Error(
        "The group owner cannot be removed"
      );
    }


    const {
      error,
    } =
      await supabaseAdmin
        .from(
          "chat_conversation_members"
        )
        .delete()
        .eq(
          "conversation_id",
          conversationId
        )
        .eq(
          "user_id",
          userId
        );


    if (
      error
    ) {

      throw new Error(
        `Unable to remove group member: ${error.message}`
      );
    }
  };


/*
 * =========================================================
 * MESSAGES
 * =========================================================
 */

export const getConversationMessages =
  async (
    conversationId: string,

    currentUserId:
      string,

    before?:
      string,

    limit:
      number =
      50
  ) => {

    await ensureConversationMember(
      conversationId,
      currentUserId
    );


    let query =
      supabaseAdmin
        .from(
          "chat_messages"
        )
        .select("*")
        .eq(
          "conversation_id",
          conversationId
        )
        .order(
          "created_at",
          {
            ascending:
              false,
          }
        )
        .limit(
          Math.min(
            Math.max(
              limit,
              1
            ),
            100
          )
        );


    if (
      before
    ) {

      query =
        query.lt(
          "created_at",
          before
        );
    }


    const {
      data,
      error,
    } =
      await query;


    if (
      error
    ) {

      throw new Error(
        `Unable to load messages: ${error.message}`
      );
    }


    const rows =
      (
        data ??
        []
      ).reverse();


    return hydrateMessages(
      rows,
      currentUserId
    );
  };


export const searchConversationMessages =
  async (
    conversationId: string,

    currentUserId:
      string,

    search: string
  ) => {

    await ensureConversationMember(
      conversationId,
      currentUserId
    );


    const normalized =
      search.trim();


    if (
      !normalized
    ) {

      return [];
    }


    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from(
          "chat_messages"
        )
        .select("*")
        .eq(
          "conversation_id",
          conversationId
        )
        .is(
          "deleted_at",
          null
        )
        .ilike(
          "body",
          `%${normalized}%`
        )
        .order(
          "created_at",
          {
            ascending:
              false,
          }
        )
        .limit(50);


    if (
      error
    ) {

      throw new Error(
        `Unable to search messages: ${error.message}`
      );
    }


    return hydrateMessages(
      data ??
      [],
      currentUserId
    );
  };


export const sendChatMessage =
  async (
    input:
      SendMessageInput
  ) => {

    await ensureConversationMember(
      input.conversationId,
      input.senderId
    );


    const body =
      input.body.trim();


    if (
      !body
    ) {

      throw new Error(
        "Message cannot be empty"
      );
    }


    await validateReplyMessage(
      input.conversationId,
      input.replyToMessageId
    );


    const mentions =
      await validateMentionUsers(
        input.conversationId,
        input
          .mentionedUserIds ??
          []
      );


    const {
      data:
        message,

      error:
        messageError,
    } =
      await supabaseAdmin
        .from(
          "chat_messages"
        )
        .insert({
          conversation_id:
            input.conversationId,

          sender_id:
            input.senderId,

          body,

          message_type:
            "text",

          reply_to_message_id:
            input.replyToMessageId ??
            null,
        })
        .select()
        .single();


    if (
      messageError ||
      !message
    ) {

      throw new Error(
        `Unable to send message: ${
          messageError
            ?.message ||
          "Unknown error"
        }`
      );
    }


    if (
      mentions.length >
      0
    ) {

      const {
        error:
          mentionError,
      } =
        await supabaseAdmin
          .from(
            "chat_mentions"
          )
          .insert(
            mentions.map(
              (
                userId
              ) => ({
                message_id:
                  message.id,

                conversation_id:
                  input
                    .conversationId,

                user_id:
                  userId,
              })
            )
          );


      if (
        mentionError
      ) {

        console.warn(
          "MESSAGE MENTION WARNING:",
          mentionError
        );
      }
    }


    await supabaseAdmin
      .from(
        "chat_conversations"
      )
      .update({
        last_message_at:
          message.created_at,
      })
      .eq(
        "id",
        input.conversationId
      );


    return getMessageById(
      message.id,
      input.senderId
    );
  };


export const editChatMessage =
  async (
    messageId: string,

    userId: string,

    body: string,

    mentionedUserIds:
      string[] =
      []
  ) => {

    const {
      data:
        existing,

      error:
        existingError,
    } =
      await supabaseAdmin
        .from(
          "chat_messages"
        )
        .select(`
          id,
          conversation_id,
          sender_id,
          deleted_at
        `)
        .eq(
          "id",
          messageId
        )
        .maybeSingle();


    if (
      existingError ||
      !existing
    ) {

      throw new Error(
        "Message not found"
      );
    }


    await ensureConversationMember(
      existing.conversation_id,
      userId
    );


    if (
      existing.sender_id !==
      userId
    ) {

      throw new Error(
        "You can only edit your own messages"
      );
    }


    if (
      existing.deleted_at
    ) {

      throw new Error(
        "Deleted messages cannot be edited"
      );
    }


    const normalized =
      body.trim();


    if (
      !normalized
    ) {

      throw new Error(
        "Message cannot be empty"
      );
    }


    const mentions =
      await validateMentionUsers(
        existing.conversation_id,
        mentionedUserIds
      );


    const {
      error,
    } =
      await supabaseAdmin
        .from(
          "chat_messages"
        )
        .update({
          body:
            normalized,

          edited_at:
            new Date()
              .toISOString(),
        })
        .eq(
          "id",
          messageId
        );


    if (
      error
    ) {

      throw new Error(
        `Unable to edit message: ${error.message}`
      );
    }


    await supabaseAdmin
      .from(
        "chat_mentions"
      )
      .delete()
      .eq(
        "message_id",
        messageId
      );


    if (
      mentions.length >
      0
    ) {

      await supabaseAdmin
        .from(
          "chat_mentions"
        )
        .insert(
          mentions.map(
            (
              mentionedUserId
            ) => ({
              message_id:
                messageId,

              conversation_id:
                existing
                  .conversation_id,

              user_id:
                mentionedUserId,
            })
          )
        );
    }


    return getMessageById(
      messageId,
      userId
    );
  };


export const deleteChatMessage =
  async (
    messageId: string,

    userId: string
  ) => {

    const {
      data:
        message,

      error:
        messageError,
    } =
      await supabaseAdmin
        .from(
          "chat_messages"
        )
        .select(`
          id,
          conversation_id,
          sender_id
        `)
        .eq(
          "id",
          messageId
        )
        .maybeSingle();


    if (
      messageError ||
      !message
    ) {

      throw new Error(
        "Message not found"
      );
    }


    await ensureConversationMember(
      message.conversation_id,
      userId
    );


    if (
      message.sender_id !==
      userId
    ) {

      throw new Error(
        "You can only delete your own messages"
      );
    }


    const {
      error,
    } =
      await supabaseAdmin
        .from(
          "chat_messages"
        )
        .update({
          body:
            null,

          deleted_at:
            new Date()
              .toISOString(),
        })
        .eq(
          "id",
          messageId
        );


    if (
      error
    ) {

      throw new Error(
        `Unable to delete message: ${error.message}`
      );
    }
  };


/*
 * =========================================================
 * READ RECEIPTS
 * =========================================================
 */

export const markConversationRead =
  async (
    conversationId: string,

    userId: string
  ) => {

    await ensureConversationMember(
      conversationId,
      userId
    );


    const now =
      new Date()
        .toISOString();


    const {
      error:
        memberError,
    } =
      await supabaseAdmin
        .from(
          "chat_conversation_members"
        )
        .update({
          last_read_at:
            now,
        })
        .eq(
          "conversation_id",
          conversationId
        )
        .eq(
          "user_id",
          userId
        );


    if (
      memberError
    ) {

      throw new Error(
        `Unable to mark conversation read: ${memberError.message}`
      );
    }


    const {
      data:
        unreadMessages,

      error:
        unreadError,
    } =
      await supabaseAdmin
        .from(
          "chat_messages"
        )
        .select(
          "id"
        )
        .eq(
          "conversation_id",
          conversationId
        )
        .neq(
          "sender_id",
          userId
        )
        .lte(
          "created_at",
          now
        )
        .limit(500);


    if (
      unreadError
    ) {

      throw new Error(
        `Unable to load unread messages: ${unreadError.message}`
      );
    }


    if (
      unreadMessages &&
      unreadMessages.length >
        0
    ) {

      const {
        error:
          readError,
      } =
        await supabaseAdmin
          .from(
            "chat_message_reads"
          )
          .upsert(
            unreadMessages.map(
              (
                message
              ) => ({
                message_id:
                  message.id,

                conversation_id:
                  conversationId,

                user_id:
                  userId,

                read_at:
                  now,
              })
            ),
            {
              onConflict:
                "message_id,user_id",
            }
          );


      if (
        readError
      ) {

        throw new Error(
          `Unable to save read receipts: ${readError.message}`
        );
      }
    }


    return {
      read_at:
        now,
    };
  };


/*
 * =========================================================
 * REACTIONS
 * =========================================================
 */

export const addMessageReaction =
  async (
    messageId: string,

    userId: string,

    emoji: string
  ) => {

    const normalized =
      emoji.trim();


    if (
      !normalized
    ) {

      throw new Error(
        "Reaction is required"
      );
    }


    const {
      data:
        message,

      error:
        messageError,
    } =
      await supabaseAdmin
        .from(
          "chat_messages"
        )
        .select(`
          id,
          conversation_id
        `)
        .eq(
          "id",
          messageId
        )
        .maybeSingle();


    if (
      messageError ||
      !message
    ) {

      throw new Error(
        "Message not found"
      );
    }


    await ensureConversationMember(
      message.conversation_id,
      userId
    );


    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from(
          "chat_reactions"
        )
        .upsert(
          {
            message_id:
              messageId,

            conversation_id:
              message
                .conversation_id,

            user_id:
              userId,

            emoji:
              normalized,
          },
          {
            onConflict:
              "message_id,user_id,emoji",
          }
        )
        .select()
        .single();


    if (
      error
    ) {

      throw new Error(
        `Unable to add reaction: ${error.message}`
      );
    }


    return data;
  };


export const removeMessageReaction =
  async (
    messageId: string,

    userId: string,

    emoji: string
  ) => {

    const {
      data:
        message,

      error:
        messageError,
    } =
      await supabaseAdmin
        .from(
          "chat_messages"
        )
        .select(
          "conversation_id"
        )
        .eq(
          "id",
          messageId
        )
        .maybeSingle();


    if (
      messageError ||
      !message
    ) {

      throw new Error(
        "Message not found"
      );
    }


    await ensureConversationMember(
      message.conversation_id,
      userId
    );


    const {
      error,
    } =
      await supabaseAdmin
        .from(
          "chat_reactions"
        )
        .delete()
        .eq(
          "message_id",
          messageId
        )
        .eq(
          "user_id",
          userId
        )
        .eq(
          "emoji",
          emoji
        );


    if (
      error
    ) {

      throw new Error(
        `Unable to remove reaction: ${error.message}`
      );
    }
  };


/*
 * =========================================================
 * ATTACHMENTS
 * =========================================================
 */

export const uploadChatAttachment =
  async (
    input:
      UploadAttachmentInput
  ) => {

    await ensureConversationMember(
      input.conversationId,
      input.senderId
    );


    await validateReplyMessage(
      input.conversationId,
      input.replyToMessageId
    );


    const mentions =
      await validateMentionUsers(
        input.conversationId,
        input
          .mentionedUserIds ??
          []
      );


    const {
      data:
        message,

      error:
        messageError,
    } =
      await supabaseAdmin
        .from(
          "chat_messages"
        )
        .insert({
          conversation_id:
            input.conversationId,

          sender_id:
            input.senderId,

          body:
            input.body?.trim() ||
            null,

          message_type:
            "file",

          reply_to_message_id:
            input.replyToMessageId ??
            null,
        })
        .select()
        .single();


    if (
      messageError ||
      !message
    ) {

      throw new Error(
        `Unable to create attachment message: ${
          messageError
            ?.message ||
          "Unknown error"
        }`
      );
    }


    const safeName =
      input.file
        .originalname
        .replace(
          /[^a-zA-Z0-9._-]/g,
          "_"
        );


    const storagePath =
      `${input.conversationId}/${message.id}/${Date.now()}-${safeName}`;


    const {
      error:
        uploadError,
    } =
      await supabaseAdmin
        .storage
        .from(
          "chat-attachments"
        )
        .upload(
          storagePath,
          input.file.buffer,
          {
            contentType:
              input.file
                .mimetype,

            upsert:
              false,
          }
        );


    if (
      uploadError
    ) {

      await supabaseAdmin
        .from(
          "chat_messages"
        )
        .delete()
        .eq(
          "id",
          message.id
        );


      throw new Error(
        `Unable to upload attachment: ${uploadError.message}`
      );
    }


    const {
      error:
        attachmentError,
    } =
      await supabaseAdmin
        .from(
          "chat_attachments"
        )
        .insert({
          message_id:
            message.id,

          conversation_id:
            input.conversationId,

          uploaded_by:
            input.senderId,

          storage_path:
            storagePath,

          file_name:
            input.file
              .originalname,

          mime_type:
            input.file
              .mimetype,

          size_bytes:
            input.file
              .size,
        });


    if (
      attachmentError
    ) {

      await supabaseAdmin
        .storage
        .from(
          "chat-attachments"
        )
        .remove([
          storagePath,
        ]);


      await supabaseAdmin
        .from(
          "chat_messages"
        )
        .delete()
        .eq(
          "id",
          message.id
        );


      throw new Error(
        `Unable to save attachment: ${attachmentError.message}`
      );
    }


    if (
      mentions.length >
      0
    ) {

      await supabaseAdmin
        .from(
          "chat_mentions"
        )
        .insert(
          mentions.map(
            (
              mentionedUserId
            ) => ({
              message_id:
                message.id,

              conversation_id:
                input
                  .conversationId,

              user_id:
                mentionedUserId,
            })
          )
        );
    }


    await supabaseAdmin
      .from(
        "chat_conversations"
      )
      .update({
        last_message_at:
          message.created_at,
      })
      .eq(
        "id",
        input.conversationId
      );


    return getMessageById(
      message.id,
      input.senderId
    );
  };


export const getAttachmentSignedUrl =
  async (
    attachmentId: string,

    userId: string
  ) => {

    const {
      data:
        attachment,

      error:
        attachmentError,
    } =
      await supabaseAdmin
        .from(
          "chat_attachments"
        )
        .select(`
          id,
          conversation_id,
          storage_path,
          file_name,
          mime_type
        `)
        .eq(
          "id",
          attachmentId
        )
        .maybeSingle();


    if (
      attachmentError ||
      !attachment
    ) {

      throw new Error(
        "Attachment not found"
      );
    }


    await ensureConversationMember(
      attachment.conversation_id,
      userId
    );


    const {
      data,
      error,
    } =
      await supabaseAdmin
        .storage
        .from(
          "chat-attachments"
        )
        .createSignedUrl(
          attachment.storage_path,
          3600
        );


    if (
      error ||
      !data
    ) {

      throw new Error(
        `Unable to open attachment: ${
          error?.message ||
          "Unknown error"
        }`
      );
    }


    return {
      url:
        data.signedUrl,

      file_name:
        attachment
          .file_name,

      mime_type:
        attachment
          .mime_type,
    };
  };
