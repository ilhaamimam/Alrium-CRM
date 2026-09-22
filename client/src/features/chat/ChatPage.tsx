import axios from "axios";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { api } from "../../api/http";

import {
  addChatGroupMembers,
  addChatReaction,
  createChatGroup,
  deleteChatMessage,
  editChatMessage,
  fetchChatAttachmentUrl,
  fetchChatConversations,
  fetchChatMessages,
  fetchChatUsers,
  fetchConversationMembers,
  markChatConversationRead,
  openDirectConversation,
  removeChatGroupMember,
  removeChatReaction,
  renameChatGroup,
  searchChatMessages,
  sendChatMessage,
  uploadChatAttachment,
} from "./chat.api";

import type {
  ChatConversation,
  ChatConversationMember,
  ChatMessage,
  ChatProfile,
} from "./chat.types";

import useChatRealtime from "./useChatRealtime";

import "./chat.css";


const reactionOptions = [
  "👍",
  "❤️",
  "😂",
  "✅",
  "👀",
];


export default function ChatPage() {
  /*
   * =========================================================
   * CURRENT USER
   * =========================================================
   */

  const [
    currentUser,
    setCurrentUser,
  ] = useState<ChatProfile | null>(
    null
  );


  /*
   * =========================================================
   * CHAT DATA
   * =========================================================
   */

  const [
    conversations,
    setConversations,
  ] = useState<ChatConversation[]>(
    []
  );


  const [
    users,
    setUsers,
  ] = useState<ChatProfile[]>(
    []
  );


  const [
    selectedConversationId,
    setSelectedConversationId,
  ] = useState<string | null>(
    null
  );


  const [
    members,
    setMembers,
  ] = useState<
    ChatConversationMember[]
  >([]);


  const [
    messages,
    setMessages,
  ] = useState<ChatMessage[]>(
    []
  );


  /*
   * =========================================================
   * MESSAGE COMPOSER
   * =========================================================
   */

  const [
    messageBody,
    setMessageBody,
  ] = useState("");


  const [
    replyTo,
    setReplyTo,
  ] = useState<ChatMessage | null>(
    null
  );


  const [
    editingMessageId,
    setEditingMessageId,
  ] = useState<string | null>(
    null
  );


  const [
    mentionUserIds,
    setMentionUserIds,
  ] = useState<string[]>(
    []
  );


  /*
   * =========================================================
   * SEARCH
   * =========================================================
   */

  const [
    conversationSearch,
    setConversationSearch,
  ] = useState("");


  const [
    messageSearch,
    setMessageSearch,
  ] = useState("");


  const [
    messageSearchResults,
    setMessageSearchResults,
  ] = useState<
    ChatMessage[] | null
  >(null);


  /*
   * =========================================================
   * MODALS
   * =========================================================
   */

  const [
    showNewChat,
    setShowNewChat,
  ] = useState(false);


  const [
    showNewGroup,
    setShowNewGroup,
  ] = useState(false);


  const [
    showManageGroup,
    setShowManageGroup,
  ] = useState(false);


  const [
    groupName,
    setGroupName,
  ] = useState("");


  const [
    selectedGroupUserIds,
    setSelectedGroupUserIds,
  ] = useState<string[]>(
    []
  );


  const [
    manageAddUserIds,
    setManageAddUserIds,
  ] = useState<string[]>(
    []
  );


  /*
   * =========================================================
   * PAGE STATE
   * =========================================================
   */

  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    loadingMessages,
    setLoadingMessages,
  ] = useState(false);


  const [
    sending,
    setSending,
  ] = useState(false);


  const [
    uploading,
    setUploading,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  const [
    success,
    setSuccess,
  ] = useState("");


  /*
   * =========================================================
   * REFS
   * =========================================================
   */

  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null
    );


  const typingStopTimer =
    useRef<
      ReturnType<
        typeof setTimeout
      > | null
    >(null);


  const messagesBottomRef =
    useRef<HTMLDivElement | null>(
      null
    );


  /*
   * =========================================================
   * SELECTED CONVERSATION
   * =========================================================
   */

  const selectedConversation =
    useMemo(
      () =>
        conversations.find(
          (
            conversation
          ) =>
            conversation.id ===
            selectedConversationId
        ) ??
        null,
      [
        conversations,
        selectedConversationId,
      ]
    );


  /*
   * =========================================================
   * GROUP PERMISSIONS
   *
   * EVERY authenticated CRM user can create groups.
   *
   * Only the creator of the selected group can:
   *
   * - rename group
   * - add members
   * - remove members
   * =========================================================
   */

  const canCreateGroups =
    Boolean(
      currentUser
    );


  const canManageSelectedGroup =
    Boolean(
      currentUser &&
      selectedConversation &&
      selectedConversation.type ===
        "group" &&
      selectedConversation
        .created_by ===
        currentUser.id
    );


  /*
   * =========================================================
   * LOAD CURRENT USER
   * =========================================================
   */

  const loadCurrentUser =
    useCallback(
      async () => {
        const response =
          await api.get(
            "/me"
          );


        const raw =
          response.data
            ?.data
            ?.user ??
          response.data
            ?.user ??
          response.data
            ?.data ??
          response.data;


        setCurrentUser(
          raw
        );
      },
      []
    );


  /*
   * =========================================================
   * LOAD CHAT USERS
   * =========================================================
   */

  const loadUsers =
    useCallback(
      async () => {
        const data =
          await fetchChatUsers();


        setUsers(
          data
        );
      },
      []
    );


  /*
   * =========================================================
   * LOAD CONVERSATIONS
   * =========================================================
   */

  const loadConversations =
    useCallback(
      async () => {
        const data =
          await fetchChatConversations();


        setConversations(
          data
        );


        setSelectedConversationId(
          (
            current
          ) => {
            if (
              current &&
              data.some(
                (
                  conversation
                ) =>
                  conversation.id ===
                  current
              )
            ) {
              return current;
            }


            return (
              data[0]?.id ??
              null
            );
          }
        );
      },
      []
    );


  /*
   * =========================================================
   * INITIAL CHAT LOAD
   * =========================================================
   */

  useEffect(() => {
    const load =
      async () => {
        try {
          setLoading(
            true
          );

          setError("");


          await Promise.all([
            loadCurrentUser(),
            loadUsers(),
            loadConversations(),
          ]);
        } catch (error) {
          console.error(
            "CHAT LOAD ERROR:",
            error
          );


          setError(
            getErrorMessage(
              error,
              "Unable to load chat"
            )
          );
        } finally {
          setLoading(
            false
          );
        }
      };


    void load();
  }, [
    loadConversations,
    loadCurrentUser,
    loadUsers,
  ]);


  /*
   * =========================================================
   * LOAD SELECTED CONVERSATION
   * =========================================================
   */

  const loadSelectedConversation =
    useCallback(
      async (
        showLoader:
          boolean =
          true
      ) => {
        if (
          !selectedConversationId
        ) {
          setMessages(
            []
          );

          setMembers(
            []
          );

          return;
        }


        try {
          if (
            showLoader
          ) {
            setLoadingMessages(
              true
            );
          }


          const [
            messageData,
            memberData,
          ] =
            await Promise.all([
              fetchChatMessages(
                selectedConversationId
              ),

              fetchConversationMembers(
                selectedConversationId
              ),
            ]);


          setMessages(
            messageData
          );


          setMembers(
            memberData
          );


          await markChatConversationRead(
            selectedConversationId
          );


          await loadConversations();
        } catch (error) {
          console.error(
            "LOAD CONVERSATION ERROR:",
            error
          );


          setError(
            getErrorMessage(
              error,
              "Unable to load conversation"
            )
          );
        } finally {
          if (
            showLoader
          ) {
            setLoadingMessages(
              false
            );
          }
        }
      },
      [
        loadConversations,
        selectedConversationId,
      ]
    );


  /*
   * =========================================================
   * SILENT MESSAGE REFRESH
   * =========================================================
   */

  const refreshMessagesSilently =
    useCallback(
      async () => {
        if (
          !selectedConversationId
        ) {
          return;
        }


        try {
          const messageData =
            await fetchChatMessages(
              selectedConversationId
            );


          setMessages(
            messageData
          );
        } catch (error) {
          console.error(
            "SILENT MESSAGE REFRESH ERROR:",
            error
          );
        }
      },
      [
        selectedConversationId,
      ]
    );


  /*
   * =========================================================
   * CONVERSATION CHANGED
   * =========================================================
   */

  useEffect(() => {
    setReplyTo(
      null
    );

    setEditingMessageId(
      null
    );

    setMessageBody("");

    setMentionUserIds(
      []
    );

    setMessageSearch("");

    setMessageSearchResults(
      null
    );


    void loadSelectedConversation(
      true
    );
  }, [
    loadSelectedConversation,
  ]);


  /*
   * =========================================================
   * REALTIME
   * =========================================================
   */

  const handleRealtimeConversationChange =
    useCallback(
      () => {
        void loadSelectedConversation(
          false
        );
      },
      [
        loadSelectedConversation,
      ]
    );


  const handleRealtimeReadChange =
    useCallback(
      () => {
        void refreshMessagesSilently();
      },
      [
        refreshMessagesSilently,
      ]
    );


  const {
    typingUserIds,
    onlineUserIds,
    sendTyping,
  } =
    useChatRealtime({
      conversationId:
        selectedConversationId,

      currentUser,

      onConversationChange:
        handleRealtimeConversationChange,

      onReadReceiptChange:
        handleRealtimeReadChange,
    });


  /*
   * =========================================================
   * AUTO SCROLL
   * =========================================================
   */

  useEffect(() => {
    if (
      loadingMessages
    ) {
      return;
    }


    messagesBottomRef
      .current
      ?.scrollIntoView({
        behavior:
          "smooth",
      });
  }, [
    loadingMessages,
    messages.length,
    selectedConversationId,
  ]);


  /*
   * =========================================================
   * CONVERSATION FILTER
   * =========================================================
   */

  const filteredConversations =
    useMemo(
      () => {
        const search =
          conversationSearch
            .trim()
            .toLowerCase();


        if (
          !search
        ) {
          return conversations;
        }


        return conversations.filter(
          (
            conversation
          ) => {
            const name =
              getConversationName(
                conversation,
                currentUser
              )
                .toLowerCase();


            return name.includes(
              search
            );
          }
        );
      },
      [
        conversationSearch,
        conversations,
        currentUser,
      ]
    );


  /*
   * =========================================================
   * MENTION FRAGMENT
   * =========================================================
   */

  const mentionFragment =
    useMemo(
      () => {
        const match =
          messageBody.match(
            /(?:^|\s)@([a-zA-Z0-9._-]*)$/
          );


        return (
          match?.[1] ??
          null
        );
      },
      [
        messageBody,
      ]
    );


  /*
   * =========================================================
   * MENTION SUGGESTIONS
   * =========================================================
   */

  const mentionSuggestions =
    useMemo(
      () => {
        if (
          mentionFragment ===
          null
        ) {
          return [];
        }


        const search =
          mentionFragment
            .toLowerCase();


        return members
          .filter(
            (
              member
            ) =>
              member.user_id !==
              currentUser?.id
          )
          .filter(
            (
              member
            ) => {
              const profile =
                member.profile;


              if (
                !profile
              ) {
                return false;
              }


              return (
                profile.email
                  .toLowerCase()
                  .includes(
                    search
                  ) ||
                (
                  profile
                    .full_name ??
                  ""
                )
                  .toLowerCase()
                  .includes(
                    search
                  )
              );
            }
          )
          .slice(
            0,
            6
          );
      },
      [
        currentUser?.id,
        members,
        mentionFragment,
      ]
    );


  /*
   * =========================================================
   * MESSAGE BODY + TYPING
   * =========================================================
   */

  const handleBodyChange =
    (
      value:
        string
    ) => {
      setMessageBody(
        value
      );


      sendTyping(
        true
      );


      if (
        typingStopTimer
          .current
      ) {
        clearTimeout(
          typingStopTimer
            .current
        );
      }


      typingStopTimer.current =
        setTimeout(
          () => {
            sendTyping(
              false
            );
          },
          1200
        );
    };


  /*
   * =========================================================
   * SELECT MENTION
   * =========================================================
   */

  const selectMention =
    (
      member:
        ChatConversationMember
    ) => {
      if (
        !member.profile
      ) {
        return;
      }


      const atIndex =
        messageBody
          .lastIndexOf(
            "@"
          );


      if (
        atIndex <
        0
      ) {
        return;
      }


      const prefix =
        messageBody.slice(
          0,
          atIndex
        );


      const token =
        `@${member.profile.email}`;


      setMessageBody(
        `${prefix}${token} `
      );


      setMentionUserIds(
        (
          current
        ) =>
          current.includes(
            member.user_id
          )
            ? current
            : [
                ...current,
                member.user_id,
              ]
      );
    };


  /*
   * =========================================================
   * ACTIVE MENTIONS
   * =========================================================
   */

  const getActiveMentionIds =
    () => {
      return mentionUserIds.filter(
        (
          id
        ) => {
          const member =
            members.find(
              (
                item
              ) =>
                item.user_id ===
                id
            );


          const email =
            member
              ?.profile
              ?.email;


          if (
            !email
          ) {
            return false;
          }


          return messageBody.includes(
            `@${email}`
          );
        }
      );
    };


  /*
   * =========================================================
   * SEND / EDIT MESSAGE
   * =========================================================
   */

  const handleSend =
    async () => {
      if (
        !selectedConversationId
      ) {
        return;
      }


      const body =
        messageBody.trim();


      if (
        !body
      ) {
        return;
      }


      try {
        setSending(
          true
        );

        setError("");


        const activeMentions =
          getActiveMentionIds();


        if (
          editingMessageId
        ) {
          await editChatMessage(
            editingMessageId,
            body,
            activeMentions
          );
        } else {
          await sendChatMessage(
            selectedConversationId,
            {
              body,

              replyToMessageId:
                replyTo?.id ??
                null,

              mentionedUserIds:
                activeMentions,
            }
          );
        }


        setMessageBody("");

        setReplyTo(
          null
        );

        setEditingMessageId(
          null
        );

        setMentionUserIds(
          []
        );


        sendTyping(
          false
        );


        await loadSelectedConversation(
          false
        );
      } catch (error) {
        setError(
          getErrorMessage(
            error,
            "Unable to send message"
          )
        );
      } finally {
        setSending(
          false
        );
      }
    };


  /*
   * =========================================================
   * LOAD OLDER MESSAGES
   * =========================================================
   */

  const handleLoadOlder =
    async () => {
      if (
        !selectedConversationId ||
        messages.length ===
          0
      ) {
        return;
      }


      try {
        const older =
          await fetchChatMessages(
            selectedConversationId,
            messages[0]
              .created_at
          );


        setMessages(
          (
            current
          ) => [
            ...older,
            ...current,
          ]
        );
      } catch (error) {
        setError(
          getErrorMessage(
            error,
            "Unable to load older messages"
          )
        );
      }
    };


  /*
   * =========================================================
   * PERSONAL CHAT
   * =========================================================
   */

  const handleStartDirectChat =
    async (
      userId:
        string
    ) => {
      try {
        setError("");


        const conversation =
          await openDirectConversation(
            userId
          );


        await loadConversations();


        setSelectedConversationId(
          conversation.id
        );


        setShowNewChat(
          false
        );
      } catch (error) {
        setError(
          getErrorMessage(
            error,
            "Unable to create personal chat"
          )
        );
      }
    };


  /*
   * =========================================================
   * CREATE GROUP
   *
   * AVAILABLE TO EVERY AUTHENTICATED USER
   * =========================================================
   */

  const handleCreateGroup =
  async () => {

    const cleanGroupName =
      groupName.trim();


    if (
      !cleanGroupName
    ) {

      setError(
        "Please enter a group name."
      );

      return;
    }


    try {

      setError("");

      setSuccess("");


      const conversation =
        await createChatGroup(
          cleanGroupName,
          selectedGroupUserIds
        );


      setGroupName("");

      setSelectedGroupUserIds(
        []
      );

      setShowNewGroup(
        false
      );


      await loadConversations();


      setSelectedConversationId(
        conversation.id
      );


      setSuccess(
        "Group created successfully."
      );

    } catch (error) {

      console.error(
        "CREATE GROUP ERROR:",
        error
      );


      setError(
        getErrorMessage(
          error,
          "Unable to create group"
        )
      );
    }
  };


  /*
   * =========================================================
   * RENAME GROUP
   * =========================================================
   */

  const handleRenameGroup =
    async () => {
      if (
        !selectedConversation
      ) {
        return;
      }


      try {
        setError("");


        await renameChatGroup(
          selectedConversation.id,
          groupName
        );


        await loadConversations();


        setSuccess(
          "Group updated successfully"
        );
      } catch (error) {
        setError(
          getErrorMessage(
            error,
            "Unable to rename group"
          )
        );
      }
    };


  /*
   * =========================================================
   * ADD GROUP MEMBERS
   * =========================================================
   */

  const handleAddGroupMembers =
    async () => {
      if (
        !selectedConversation ||
        manageAddUserIds
          .length ===
          0
      ) {
        return;
      }


      try {
        setError("");


        await addChatGroupMembers(
          selectedConversation.id,
          manageAddUserIds
        );


        setManageAddUserIds(
          []
        );


        const newMembers =
          await fetchConversationMembers(
            selectedConversation.id
          );


        setMembers(
          newMembers
        );


        await loadConversations();
      } catch (error) {
        setError(
          getErrorMessage(
            error,
            "Unable to add group members"
          )
        );
      }
    };


  /*
   * =========================================================
   * REMOVE GROUP MEMBER
   * =========================================================
   */

  const handleRemoveGroupMember =
    async (
      userId:
        string
    ) => {
      if (
        !selectedConversation
      ) {
        return;
      }


      if (
        !window.confirm(
          "Remove this person from the group?"
        )
      ) {
        return;
      }


      try {
        setError("");


        await removeChatGroupMember(
          selectedConversation.id,
          userId
        );


        const newMembers =
          await fetchConversationMembers(
            selectedConversation.id
          );


        setMembers(
          newMembers
        );


        await loadConversations();
      } catch (error) {
        setError(
          getErrorMessage(
            error,
            "Unable to remove group member"
          )
        );
      }
    };


  /*
   * =========================================================
   * SEARCH MESSAGES
   * =========================================================
   */

  const handleMessageSearch =
    async () => {
      if (
        !selectedConversationId
      ) {
        return;
      }


      const search =
        messageSearch.trim();


      if (
        !search
      ) {
        setMessageSearchResults(
          null
        );

        return;
      }


      try {
        setError("");


        const data =
          await searchChatMessages(
            selectedConversationId,
            search
          );


        setMessageSearchResults(
          data
        );
      } catch (error) {
        setError(
          getErrorMessage(
            error,
            "Unable to search messages"
          )
        );
      }
    };


  /*
   * =========================================================
   * REACTIONS
   * =========================================================
   */

  const handleReaction =
    async (
      message:
        ChatMessage,

      emoji:
        string
    ) => {
      const reaction =
        message.reactions
          .find(
            (
              item
            ) =>
              item.emoji ===
              emoji
          );


      try {
        setError("");


        if (
          reaction
            ?.reacted_by_me
        ) {
          await removeChatReaction(
            message.id,
            emoji
          );
        } else {
          await addChatReaction(
            message.id,
            emoji
          );
        }


        await loadSelectedConversation(
          false
        );
      } catch (error) {
        setError(
          getErrorMessage(
            error,
            "Unable to update reaction"
          )
        );
      }
    };


  /*
   * =========================================================
   * DELETE MESSAGE
   * =========================================================
   */

  const handleDeleteMessage =
    async (
      messageId:
        string
    ) => {
      if (
        !window.confirm(
          "Delete this message?"
        )
      ) {
        return;
      }


      try {
        setError("");


        await deleteChatMessage(
          messageId
        );


        await loadSelectedConversation(
          false
        );
      } catch (error) {
        setError(
          getErrorMessage(
            error,
            "Unable to delete message"
          )
        );
      }
    };


  /*
   * =========================================================
   * EDIT MESSAGE
   * =========================================================
   */

  const handleEditMessage =
    (
      message:
        ChatMessage
    ) => {
      if (
        message.deleted_at
      ) {
        return;
      }


      setEditingMessageId(
        message.id
      );


      setReplyTo(
        null
      );


      setMessageBody(
        message.body ??
        ""
      );


      setMentionUserIds(
        message.mentions.map(
          (
            mention
          ) =>
            mention.user_id
        )
      );
    };


  /*
   * =========================================================
   * FILE UPLOAD
   * =========================================================
   */

  const handleFileSelected =
    async (
      event:
        React.ChangeEvent<
          HTMLInputElement
        >
    ) => {
      const file =
        event.target
          .files?.[0];


      event.target.value =
        "";


      if (
        !file ||
        !selectedConversationId
      ) {
        return;
      }


      try {
        setUploading(
          true
        );

        setError("");


        await uploadChatAttachment(
          selectedConversationId,
          file,
          {
            body:
              messageBody.trim(),

            replyToMessageId:
              replyTo?.id ??
              null,

            mentionedUserIds:
              getActiveMentionIds(),
          }
        );


        setMessageBody("");

        setReplyTo(
          null
        );

        setMentionUserIds(
          []
        );


        await loadSelectedConversation(
          false
        );
      } catch (error) {
        setError(
          getErrorMessage(
            error,
            "Unable to upload attachment"
          )
        );
      } finally {
        setUploading(
          false
        );
      }
    };


  /*
   * =========================================================
   * OPEN ATTACHMENT
   * =========================================================
   */

  const handleOpenAttachment =
    async (
      attachmentId:
        string
    ) => {
      try {
        const data =
          await fetchChatAttachmentUrl(
            attachmentId
          );


        window.open(
          data.url,
          "_blank",
          "noopener,noreferrer"
        );
      } catch (error) {
        setError(
          getErrorMessage(
            error,
            "Unable to open attachment"
          )
        );
      }
    };


  /*
   * =========================================================
   * LOADING
   * =========================================================
   */

  if (
    loading
  ) {
    return (
      <div className="page-shell">

        <div className="empty-state">
          Loading communication...
        </div>

      </div>
    );
  }


  /*
   * =========================================================
   * PAGE
   * =========================================================
   */

  return (
    <div className="page-shell chat-feature-shell">

      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <div className="page-header">

        <h1 className="page-title">
          Communication
        </h1>


        <p className="page-subtitle">
          Connect with colleagues through
          private conversations and managed
          group discussions.
        </p>

      </div>


      {error &&
        !selectedConversation && (

        <div className="error-message">
          {error}
        </div>

      )}


      {/* =====================================================
          CHAT
      ====================================================== */}

      <div className="chat-page">

        {/* ===================================================
            CONVERSATIONS
        ==================================================== */}

        <aside className="chat-conversations">

          <div className="chat-sidebar-header">

            <div>

              <span className="chat-eyebrow">
                Messages
              </span>


              <h1>
                Conversations
              </h1>

            </div>


            <div className="chat-header-actions">

              {/* PERSONAL CHAT */}

              <button
                type="button"
                title="New personal chat"
                aria-label="New personal chat"
                onClick={() =>
                  setShowNewChat(
                    true
                  )
                }
              >
                +
              </button>


              {/* =================================================
                  CREATE GROUP

                  ALL authenticated CRM users see this button.
              ================================================== */}

              {canCreateGroups && (

                <button
                  type="button"
                  title="Create group"
                  aria-label="Create group"
                  onClick={() => {
                    setGroupName("");

                    setSelectedGroupUserIds(
                      []
                    );

                    setShowNewGroup(
                      true
                    );
                  }}
                >
                  G+
                </button>

              )}

            </div>

          </div>


          {/* =================================================
              SEARCH CONVERSATIONS
          ================================================== */}

          <div className="chat-conversation-search">

            <input
              type="search"
              value={
                conversationSearch
              }
              onChange={(
                event
              ) =>
                setConversationSearch(
                  event.target.value
                )
              }
              placeholder="Search conversations..."
            />

          </div>


          {/* =================================================
              CONVERSATION LIST
          ================================================== */}

          <div className="chat-conversation-list">

            {filteredConversations.length ===
            0 ? (

              <div className="chat-empty-small">
                No conversations yet.
              </div>

            ) : (

              filteredConversations.map(
                (
                  conversation
                ) => {
                  const active =
                    conversation.id ===
                    selectedConversationId;


                  const name =
                    getConversationName(
                      conversation,
                      currentUser
                    );


                  return (
                    <button
                      key={
                        conversation.id
                      }
                      type="button"
                      className={
                        active
                          ? "chat-conversation-item chat-conversation-item-active"
                          : "chat-conversation-item"
                      }
                      onClick={() =>
                        setSelectedConversationId(
                          conversation.id
                        )
                      }
                    >

                      <div className="chat-avatar">

                        {getInitials(
                          name
                        )}

                      </div>


                      <div className="chat-conversation-copy">

                        <div className="chat-conversation-title">

                          <strong>
                            {name}
                          </strong>


                          {conversation
                            .unread_mention_count >
                            0 && (

                            <span className="chat-mention-badge">
                              @
                            </span>

                          )}

                        </div>


                        <span>

                          {getLastMessageText(
                            conversation
                          )}

                        </span>

                      </div>


                      {conversation
                        .unread_count >
                        0 && (

                        <span className="chat-unread-badge">

                          {
                            conversation
                              .unread_count
                          }

                        </span>

                      )}

                    </button>
                  );
                }
              )

            )}

          </div>

        </aside>


        {/* ===================================================
            CHAT WINDOW
        ==================================================== */}

        <main className="chat-window">

          {!selectedConversation ? (

            <div className="chat-no-conversation">

              <div className="chat-no-conversation-icon">
                CH
              </div>


              <h2>
                Select a conversation
              </h2>


              <p>
                Start a private conversation
                or open one of your group chats.
              </p>

            </div>

          ) : (

            <>

              {/* =================================================
                  ACTIVE CHAT HEADER
              ================================================== */}

              <header className="chat-window-header">

                <div className="chat-active-person">

                  <div className="chat-avatar chat-avatar-large">

                    {getInitials(
                      getConversationName(
                        selectedConversation,
                        currentUser
                      )
                    )}

                  </div>


                  <div>

                    <h2>

                      {getConversationName(
                        selectedConversation,
                        currentUser
                      )}

                    </h2>


                    <span>

                      {selectedConversation.type ===
                      "group"
                        ? `${members.length} members`
                        : getDirectPresenceLabel(
                            selectedConversation,
                            currentUser,
                            onlineUserIds
                          )}

                    </span>

                  </div>

                </div>


                <div className="chat-window-tools">

                  {/* SEARCH */}

                  <div className="chat-message-search">

                    <input
                      type="search"
                      value={
                        messageSearch
                      }
                      onChange={(
                        event
                      ) =>
                        setMessageSearch(
                          event.target.value
                        )
                      }
                      onKeyDown={(
                        event
                      ) => {
                        if (
                          event.key ===
                          "Enter"
                        ) {
                          void handleMessageSearch();
                        }
                      }}
                      placeholder="Search messages..."
                    />


                    <button
                      type="button"
                      onClick={() =>
                        void handleMessageSearch()
                      }
                    >
                      Search
                    </button>


                    {messageSearchResults !==
                      null && (

                      <button
                        type="button"
                        onClick={() => {
                          setMessageSearch("");

                          setMessageSearchResults(
                            null
                          );
                        }}
                      >
                        Clear
                      </button>

                    )}

                  </div>


                  {/* =================================================
                      MANAGE GROUP

                      Only group creator / owner sees this.
                  ================================================== */}

                  {canManageSelectedGroup && (

                    <button
                      type="button"
                      className="chat-manage-group"
                      onClick={() => {
                        setGroupName(
                          selectedConversation
                            .name ??
                            ""
                        );

                        setManageAddUserIds(
                          []
                        );

                        setShowManageGroup(
                          true
                        );
                      }}
                    >
                      Manage Group
                    </button>

                  )}

                </div>

              </header>


              {/* =================================================
                  ERRORS
              ================================================== */}

              {error && (

                <div className="chat-error">
                  {error}
                </div>

              )}


              {/* =================================================
                  SUCCESS
              ================================================== */}

              {success && (

                <div className="chat-success">
                  {success}
                </div>

              )}


              {/* =================================================
                  SEARCH RESULTS
              ================================================== */}

              {messageSearchResults !==
                null && (

                <div className="chat-search-result-label">

                  {
                    messageSearchResults.length
                  }{" "}
                  search result(s)

                </div>

              )}


              {/* =================================================
                  MESSAGES
              ================================================== */}

              <section className="chat-messages">

                {loadingMessages ? (

                  <div className="chat-empty">
                    Loading messages...
                  </div>

                ) : (

                  <>

                    {/* LOAD OLDER */}

                    {messages.length >
                      0 &&
                      messageSearchResults ===
                        null && (

                      <button
                        type="button"
                        className="chat-load-older"
                        onClick={() =>
                          void handleLoadOlder()
                        }
                      >
                        Load older messages
                      </button>

                    )}


                    {(messageSearchResults ??
                      messages)
                      .length ===
                    0 ? (

                      <div className="chat-empty">

                        {messageSearchResults !==
                        null
                          ? "No matching messages."
                          : "No messages yet. Start the conversation."}

                      </div>

                    ) : (

                      (
                        messageSearchResults ??
                        messages
                      ).map(
                        (
                          message
                        ) => {
                          const mine =
                            message.sender_id ===
                            currentUser?.id;


                          return (
                            <article
                              key={
                                message.id
                              }
                              className={
                                mine
                                  ? "chat-message-row chat-message-row-mine"
                                  : "chat-message-row"
                              }
                            >

                              {/* OTHER USER AVATAR */}

                              {!mine && (

                                <div className="chat-avatar chat-message-avatar">

                                  {getInitials(
                                    message.sender
                                      ?.full_name ||
                                    message.sender
                                      ?.email ||
                                    "U"
                                  )}

                                </div>

                              )}


                              {/* MESSAGE */}

                              <div
                                className={
                                  mine
                                    ? "chat-message chat-message-mine"
                                    : "chat-message"
                                }
                              >

                                {/* GROUP SENDER */}

                                {!mine &&
                                  selectedConversation.type ===
                                    "group" && (

                                  <strong className="chat-message-sender">

                                    {message.sender
                                      ?.full_name ||
                                      message.sender
                                        ?.email ||
                                      "User"}

                                  </strong>

                                )}


                                {/* REPLY */}

                                {message.reply_to && (

                                  <div className="chat-reply-preview">

                                    <strong>

                                      {message.reply_to
                                        .sender
                                        ?.full_name ||
                                        message.reply_to
                                          .sender
                                          ?.email ||
                                        "User"}

                                    </strong>


                                    <span>

                                      {message.reply_to
                                        .deleted_at
                                        ? "Deleted message"
                                        : message.reply_to
                                            .body ||
                                          "Attachment"}

                                    </span>

                                  </div>

                                )}


                                {/* CONTENT */}

                                {message.deleted_at ? (

                                  <p className="chat-deleted-message">
                                    This message was deleted
                                  </p>

                                ) : (

                                  <>

                                    {message.body && (

                                      <p className="chat-message-body">

                                        {renderMessageBody(
                                          message.body,
                                          message
                                            .mentions
                                        )}

                                      </p>

                                    )}


                                    {/* ATTACHMENTS */}

                                    {message.attachments.map(
                                      (
                                        attachment
                                      ) => (

                                        <button
                                          key={
                                            attachment.id
                                          }
                                          type="button"
                                          className="chat-attachment"
                                          onClick={() =>
                                            void handleOpenAttachment(
                                              attachment.id
                                            )
                                          }
                                        >

                                          <span className="chat-attachment-icon">
                                            📎
                                          </span>


                                          <span>

                                            <strong>
                                              {
                                                attachment
                                                  .file_name
                                              }
                                            </strong>


                                            <small>

                                              {formatFileSize(
                                                attachment
                                                  .size_bytes
                                              )}

                                            </small>

                                          </span>

                                        </button>

                                      )
                                    )}

                                  </>

                                )}


                                {/* REACTIONS */}

                                {!message.deleted_at && (

                                  <div className="chat-message-reactions">

                                    {message.reactions.map(
                                      (
                                        reaction
                                      ) => (

                                        <button
                                          key={
                                            reaction
                                              .emoji
                                          }
                                          type="button"
                                          className={
                                            reaction
                                              .reacted_by_me
                                              ? "chat-reaction chat-reaction-active"
                                              : "chat-reaction"
                                          }
                                          onClick={() =>
                                            void handleReaction(
                                              message,
                                              reaction
                                                .emoji
                                            )
                                          }
                                        >

                                          {reaction
                                            .emoji}{" "}

                                          {reaction
                                            .count}

                                        </button>

                                      )
                                    )}

                                  </div>

                                )}


                                {/* ACTIONS */}

                                {!message.deleted_at && (

                                  <div className="chat-message-actions">

                                    <button
                                      type="button"
                                      onClick={() =>
                                        setReplyTo(
                                          message
                                        )
                                      }
                                    >
                                      Reply
                                    </button>


                                    {reactionOptions.map(
                                      (
                                        emoji
                                      ) => (

                                        <button
                                          key={
                                            emoji
                                          }
                                          type="button"
                                          title={`React ${emoji}`}
                                          onClick={() =>
                                            void handleReaction(
                                              message,
                                              emoji
                                            )
                                          }
                                        >
                                          {emoji}
                                        </button>

                                      )
                                    )}


                                    {mine && (

                                      <>

                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleEditMessage(
                                              message
                                            )
                                          }
                                        >
                                          Edit
                                        </button>


                                        <button
                                          type="button"
                                          onClick={() =>
                                            void handleDeleteMessage(
                                              message.id
                                            )
                                          }
                                        >
                                          Delete
                                        </button>

                                      </>

                                    )}

                                  </div>

                                )}


                                {/* META */}

                                <div className="chat-message-meta">

                                  <span>

                                    {formatTime(
                                      message
                                        .created_at
                                    )}

                                  </span>


                                  {message
                                    .edited_at && (

                                    <span>
                                      edited
                                    </span>

                                  )}


                                  {mine &&
                                    selectedConversation.type ===
                                      "direct" && (

                                    <span>

                                      {message
                                        .read_by
                                        .some(
                                          (
                                            userId
                                          ) =>
                                            userId !==
                                            currentUser
                                              ?.id
                                        )
                                        ? "✓✓ Read"
                                        : "✓ Sent"}

                                    </span>

                                  )}

                                </div>

                              </div>

                            </article>
                          );
                        }
                      )

                    )}


                    {/* TYPING */}

                    {typingUserIds.length >
                      0 && (

                      <div className="chat-typing">

                        {getTypingLabel(
                          typingUserIds,
                          members
                        )}

                      </div>

                    )}


                    <div
                      ref={
                        messagesBottomRef
                      }
                    />

                  </>

                )}

              </section>


              {/* =================================================
                  REPLY / EDIT
              ================================================== */}

              {(replyTo ||
                editingMessageId) && (

                <div className="chat-composer-context">

                  <div>

                    <strong>

                      {editingMessageId
                        ? "Editing message"
                        : `Replying to ${
                            replyTo
                              ?.sender
                              ?.full_name ||
                            replyTo
                              ?.sender
                              ?.email ||
                            "message"
                          }`}

                    </strong>


                    {!editingMessageId &&
                      replyTo && (

                      <span>

                        {replyTo.body ||
                          "Attachment"}

                      </span>

                    )}

                  </div>


                  <button
                    type="button"
                    onClick={() => {
                      setReplyTo(
                        null
                      );

                      setEditingMessageId(
                        null
                      );

                      setMessageBody("");

                      setMentionUserIds(
                        []
                      );
                    }}
                  >
                    ×
                  </button>

                </div>

              )}


              {/* =================================================
                  MENTION PICKER
              ================================================== */}

              {mentionSuggestions.length >
                0 && (

                <div className="chat-mention-picker">

                  {mentionSuggestions.map(
                    (
                      member
                    ) => (

                      <button
                        key={
                          member.user_id
                        }
                        type="button"
                        onClick={() =>
                          selectMention(
                            member
                          )
                        }
                      >

                        <span className="chat-avatar">

                          {getInitials(
                            member.profile
                              ?.full_name ||
                              member.profile
                                ?.email ||
                              "U"
                          )}

                        </span>


                        <span>

                          <strong>

                            {member.profile
                              ?.full_name ||
                              member.profile
                                ?.email}

                          </strong>


                          <small>
                            {member.profile
                              ?.email}
                          </small>

                        </span>

                      </button>

                    )
                  )}

                </div>

              )}


              {/* =================================================
                  COMPOSER
              ================================================== */}

              <footer className="chat-composer">

                <input
                  ref={
                    fileInputRef
                  }
                  type="file"
                  hidden
                  onChange={
                    handleFileSelected
                  }
                  accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.txt,.csv,.doc,.docx,.xls,.xlsx"
                />


                <button
                  type="button"
                  className="chat-attach-button"
                  disabled={
                    uploading
                  }
                  onClick={() =>
                    fileInputRef
                      .current
                      ?.click()
                  }
                  title="Attach file"
                >
                  {uploading
                    ? "..."
                    : "📎"}
                </button>


                <textarea
                  value={
                    messageBody
                  }
                  onChange={(
                    event
                  ) =>
                    handleBodyChange(
                      event.target
                        .value
                    )
                  }
                  onKeyDown={(
                    event
                  ) => {
                    if (
                      event.key ===
                        "Enter" &&
                      !event.shiftKey
                    ) {
                      event
                        .preventDefault();

                      void handleSend();
                    }
                  }}
                  placeholder="Type a message... Use @ to mention someone"
                  rows={1}
                />


                <button
                  type="button"
                  className="chat-send-button"
                  disabled={
                    sending ||
                    !messageBody.trim()
                  }
                  onClick={() =>
                    void handleSend()
                  }
                >
                  {sending
                    ? "Sending..."
                    : editingMessageId
                      ? "Save"
                      : "Send"}
                </button>

              </footer>

            </>

          )}

        </main>

      </div>


      {/* =====================================================
          NEW PERSONAL CHAT
      ====================================================== */}

      {showNewChat && (

        <Modal
          title="New Personal Chat"
          onClose={() =>
            setShowNewChat(
              false
            )
          }
        >

          <p className="chat-modal-copy">
            Select a CRM user. Only you and
            that user can access this private
            conversation.
          </p>


          <div className="chat-user-picker">

            {users.map(
              (
                user
              ) => (

                <button
                  key={
                    user.id
                  }
                  type="button"
                  onClick={() =>
                    void handleStartDirectChat(
                      user.id
                    )
                  }
                >

                  <span className="chat-avatar">

                    {getInitials(
                      user.full_name ||
                        user.email
                    )}

                  </span>


                  <span>

                    <strong>

                      {user.full_name ||
                        user.email}

                    </strong>


                    <small>
                      {user.email}
                    </small>


                    <small>
                      {formatRole(
                        user.role
                      )}
                    </small>

                  </span>

                </button>

              )
            )}

          </div>

        </Modal>

      )}


      {/* =====================================================
          CREATE GROUP

          ALL authenticated users can create groups.
      ====================================================== */}

      {showNewGroup &&
  canCreateGroups && (

  <Modal
    title="Create Group"
    onClose={() => {

      setShowNewGroup(
        false
      );

      setGroupName("");

      setSelectedGroupUserIds(
        []
      );

    }}
  >

    <div className="form-group">

      <label>
        Group Name
      </label>


      <input
        type="text"
        value={
          groupName
        }
        onChange={(
          event
        ) =>
          setGroupName(
            event.target.value
          )
        }
        placeholder="Enter group name"
        autoFocus
      />

    </div>


    {!groupName.trim() && (

      <p className="chat-modal-copy">

        Enter a group name to enable
        the Create Group button.

      </p>

    )}


    <h3>
      Add Members
    </h3>


    <div className="chat-checkbox-list">

      {users
        .filter(
          (
            user
          ) =>
            user.id !==
            currentUser?.id
        )
        .map(
          (
            user
          ) => {

            const selected =
              selectedGroupUserIds
                .includes(
                  user.id
                );


            return (

              <label
                key={
                  user.id
                }
              >

                <input
                  type="checkbox"
                  checked={
                    selected
                  }
                  onChange={() =>
                    setSelectedGroupUserIds(
                      (
                        current
                      ) =>
                        selected
                          ? current.filter(
                              (
                                id
                              ) =>
                                id !==
                                user.id
                            )
                          : [
                              ...current,
                              user.id,
                            ]
                    )
                  }
                />


                <span>

                  <strong>

                    {user.full_name ||
                      user.email}

                  </strong>


                  <small>
                    {user.email}
                  </small>


                  <small>
                    {formatRole(
                      user.role
                    )}
                  </small>

                </span>

              </label>

            );
          }
        )}

    </div>


    <button
      type="button"
      className="chat-primary-modal-button"
      disabled={
        !groupName.trim()
      }
      onClick={() =>
        void handleCreateGroup()
      }
    >

      Create Group

    </button>

  </Modal>

)}

      


      {/* =====================================================
          MANAGE GROUP

          ONLY group creator / owner can manage group.
      ====================================================== */}

      {showManageGroup &&
        selectedConversation &&
        canManageSelectedGroup && (

        <Modal
          title="Manage Group"
          onClose={() =>
            setShowManageGroup(
              false
            )
          }
        >

          {/* GROUP NAME */}

          <div className="form-group">

            <label>
              Group Name
            </label>


            <div className="chat-inline-form">

              <input
                type="text"
                value={
                  groupName
                }
                onChange={(
                  event
                ) =>
                  setGroupName(
                    event.target
                      .value
                  )
                }
              />


              <button
                type="button"
                disabled={
                  !groupName.trim()
                }
                onClick={() =>
                  void handleRenameGroup()
                }
              >
                Rename
              </button>

            </div>

          </div>


          {/* CURRENT MEMBERS */}

          <h3>
            Current Members
          </h3>


          <div className="chat-manage-members">

            {members.map(
              (
                member
              ) => {
                const isOwner =
                  member.member_role ===
                  "owner";


                const isCurrentUser =
                  member.user_id ===
                  currentUser?.id;


                return (
                  <div
                    key={
                      member.user_id
                    }
                  >

                    <span>

                      <strong>

                        {member.profile
                          ?.full_name ||
                          member.profile
                            ?.email ||
                          "User"}

                      </strong>


                      <small>

                        {member.profile
                          ?.email}

                      </small>

                    </span>


                    <span>

                      {isOwner ? (

                        <strong>
                          Owner
                        </strong>

                      ) : isCurrentUser ? (

                        <span>
                          You
                        </span>

                      ) : (

                        <button
                          type="button"
                          onClick={() =>
                            void handleRemoveGroupMember(
                              member.user_id
                            )
                          }
                        >
                          Remove
                        </button>

                      )}

                    </span>

                  </div>
                );
              }
            )}

          </div>


          {/* ADD MORE PEOPLE */}

          <h3>
            Add More People
          </h3>


          <div className="chat-checkbox-list">

            {users
              .filter(
                (
                  user
                ) =>
                  !members.some(
                    (
                      member
                    ) =>
                      member
                        .user_id ===
                      user.id
                  )
              )
              .map(
                (
                  user
                ) => {
                  const selected =
                    manageAddUserIds
                      .includes(
                        user.id
                      );


                  return (
                    <label
                      key={
                        user.id
                      }
                    >

                      <input
                        type="checkbox"
                        checked={
                          selected
                        }
                        onChange={() =>
                          setManageAddUserIds(
                            (
                              current
                            ) =>
                              selected
                                ? current.filter(
                                    (
                                      id
                                    ) =>
                                      id !==
                                      user.id
                                  )
                                : [
                                    ...current,
                                    user.id,
                                  ]
                          )
                        }
                      />


                      <span>

                        <strong>

                          {user.full_name ||
                            user.email}

                        </strong>


                        <small>
                          {user.email}
                        </small>


                        <small>
                          {formatRole(
                            user.role
                          )}
                        </small>

                      </span>

                    </label>
                  );
                }
              )}

          </div>


          <button
            type="button"
            className="chat-primary-modal-button"
            disabled={
              manageAddUserIds
                .length ===
                0
            }
            onClick={() =>
              void handleAddGroupMembers()
            }
          >
            Add Selected Members
          </button>

        </Modal>

      )}

    </div>
  );
}


/*
 * =========================================================
 * MODAL
 * =========================================================
 */

function Modal({
  title,
  onClose,
  children,
}: {
  title:
    string;

  onClose:
    () => void;

  children:
    React.ReactNode;
}) {
  return (
    <div className="chat-modal-backdrop">

      <div className="chat-modal">

        <div className="chat-modal-header">

          <h2>
            {title}
          </h2>


          <button
            type="button"
            onClick={
              onClose
            }
            aria-label="Close"
          >
            ×
          </button>

        </div>


        <div className="chat-modal-body">

          {children}

        </div>

      </div>

    </div>
  );
}


/*
 * =========================================================
 * CONVERSATION NAME
 * =========================================================
 */

function getConversationName(
  conversation:
    ChatConversation,

  currentUser:
    ChatProfile | null
) {
  if (
    conversation.type ===
    "group"
  ) {
    return (
      conversation.name ||
      "Unnamed Group"
    );
  }


  const other =
    conversation.members
      .find(
        (
          member
        ) =>
          member.user_id !==
          currentUser?.id
      );


  return (
    other?.profile
      ?.full_name ||
    other?.profile
      ?.email ||
    "Personal Chat"
  );
}


/*
 * =========================================================
 * ONLINE / OFFLINE
 * =========================================================
 */

function getDirectPresenceLabel(
  conversation:
    ChatConversation,

  currentUser:
    ChatProfile | null,

  onlineUserIds:
    string[]
) {
  const other =
    conversation.members
      .find(
        (
          member
        ) =>
          member.user_id !==
          currentUser?.id
      );


  if (
    !other
  ) {
    return "Offline";
  }


  return onlineUserIds.includes(
    other.user_id
  )
    ? "Online"
    : "Offline";
}


/*
 * =========================================================
 * LAST MESSAGE
 * =========================================================
 */

function getLastMessageText(
  conversation:
    ChatConversation
) {
  const message =
    conversation
      .last_message;


  if (
    !message
  ) {
    return "No messages yet";
  }


  if (
    message.deleted_at
  ) {
    return "Message deleted";
  }


  if (
    message.message_type ===
      "file" &&
    !message.body
  ) {
    return "📎 Attachment";
  }


  return (
    message.body ||
    "Message"
  );
}


/*
 * =========================================================
 * INITIALS
 * =========================================================
 */

function getInitials(
  value:
    string
) {
  return value
    .split(
      /[\s@._-]+/
    )
    .filter(
      Boolean
    )
    .slice(
      0,
      2
    )
    .map(
      (
        part
      ) =>
        part
          .charAt(0)
          .toUpperCase()
    )
    .join("");
}


/*
 * =========================================================
 * ROLE
 * =========================================================
 */

function formatRole(
  value:
    string
) {
  return value
    .split("_")
    .map(
      (
        word
      ) =>
        word
          .charAt(0)
          .toUpperCase() +
        word.slice(1)
    )
    .join(" ");
}


/*
 * =========================================================
 * TIME
 * =========================================================
 */

function formatTime(
  value:
    string
) {
  return new Date(
    value
  ).toLocaleString(
    [],
    {
      month:
        "short",

      day:
        "numeric",

      hour:
        "2-digit",

      minute:
        "2-digit",
    }
  );
}


/*
 * =========================================================
 * FILE SIZE
 * =========================================================
 */

function formatFileSize(
  bytes:
    number
) {
  if (
    bytes <
    1024
  ) {
    return `${bytes} B`;
  }


  if (
    bytes <
    1024 *
      1024
  ) {
    return `${(
      bytes /
      1024
    ).toFixed(1)} KB`;
  }


  return `${(
    bytes /
    1024 /
    1024
  ).toFixed(1)} MB`;
}


/*
 * =========================================================
 * TYPING
 * =========================================================
 */

function getTypingLabel(
  typingUserIds:
    string[],

  members:
    ChatConversationMember[]
) {
  const names =
    typingUserIds
      .map(
        (
          id
        ) => {
          const member =
            members.find(
              (
                item
              ) =>
                item.user_id ===
                id
            );


          return (
            member
              ?.profile
              ?.full_name ||
            member
              ?.profile
              ?.email
          );
        }
      )
      .filter(
        Boolean
      );


  if (
    names.length ===
    0
  ) {
    return "";
  }


  if (
    names.length ===
    1
  ) {
    return `${names[0]} is typing...`;
  }


  return `${names.length} people are typing...`;
}


/*
 * =========================================================
 * RENDER MENTIONS
 * =========================================================
 */

function renderMessageBody(
  body:
    string,

  mentions:
    ChatMessage["mentions"]
) {
  if (
    mentions.length ===
    0
  ) {
    return body;
  }


  const tokens =
    mentions
      .map(
        (
          mention
        ) =>
          mention.profile
            ?.email
            ? `@${mention.profile.email}`
            : null
      )
      .filter(
        (
          token
        ):
          token is string =>
            Boolean(
              token
            )
      );


  if (
    tokens.length ===
    0
  ) {
    return body;
  }


  const escaped =
    tokens.map(
      (
        token
      ) =>
        token.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        )
    );


  const regex =
    new RegExp(
      `(${escaped.join("|")})`,
      "g"
    );


  return body
    .split(
      regex
    )
    .map(
      (
        part,
        index
      ) => {
        if (
          tokens.includes(
            part
          )
        ) {
          return (
            <strong
              key={
                `${part}-${index}`
              }
              className="chat-mentioned-user"
            >
              {part}
            </strong>
          );
        }


        return (
          <span
            key={
              `${index}-${part}`
            }
          >
            {part}
          </span>
        );
      }
    );
}


/*
 * =========================================================
 * ERROR
 * =========================================================
 */

function getErrorMessage(
  error:
    unknown,

  fallback:
    string
) {
  if (
    axios.isAxiosError(
      error
    )
  ) {
    return (
      error.response
        ?.data
        ?.message ||
      fallback
    );
  }


  if (
    error instanceof Error
  ) {
    return error.message;
  }


  return fallback;
}