import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  supabase,
} from "../../lib/supabase";

import type {
  ChatProfile,
} from "./chat.types";


interface UseChatRealtimeInput {
  conversationId:
    string | null;

  currentUser:
    ChatProfile | null;

  /*
   * New message / reaction.
   *
   * This should refresh silently.
   */
  onConversationChange:
    () => void;

  /*
   * Read receipt update.
   *
   * Kept separate so it does NOT
   * mark the conversation read again.
   */
  onReadReceiptChange:
    () => void;
}


export default function useChatRealtime({
  conversationId,
  currentUser,
  onConversationChange,
  onReadReceiptChange,
}: UseChatRealtimeInput) {
  const [
    typingUserIds,
    setTypingUserIds,
  ] =
    useState<string[]>([]);


  const [
    onlineUserIds,
    setOnlineUserIds,
  ] =
    useState<string[]>([]);


  const channelRef =
    useRef<any>(
      null
    );


  const typingTimers =
    useRef<
      Map<
        string,
        ReturnType<
          typeof setTimeout
        >
      >
    >(
      new Map()
    );


  /*
   * =========================================================
   * DEBOUNCE REALTIME REFRESHES
   *
   * Multiple Supabase events can arrive very quickly.
   * We combine them into one refresh.
   * =========================================================
   */

  const conversationRefreshTimer =
    useRef<
      ReturnType<
        typeof setTimeout
      > |
      null
    >(null);


  const readRefreshTimer =
    useRef<
      ReturnType<
        typeof setTimeout
      > |
      null
    >(null);


  const scheduleConversationRefresh =
    useCallback(
      () => {

        if (
          conversationRefreshTimer
            .current
        ) {

          clearTimeout(
            conversationRefreshTimer
              .current
          );
        }


        conversationRefreshTimer.current =
          setTimeout(
            () => {

              onConversationChange();

            },
            150
          );

      },
      [
        onConversationChange,
      ]
    );


  const scheduleReadRefresh =
    useCallback(
      () => {

        if (
          readRefreshTimer
            .current
        ) {

          clearTimeout(
            readRefreshTimer
              .current
          );
        }


        readRefreshTimer.current =
          setTimeout(
            () => {

              onReadReceiptChange();

            },
            300
          );

      },
      [
        onReadReceiptChange,
      ]
    );


  /*
   * =========================================================
   * REALTIME CHANNEL
   * =========================================================
   */

  useEffect(() => {
    if (
      !conversationId ||
      !currentUser
    ) {

      setTypingUserIds(
        []
      );

      setOnlineUserIds(
        []
      );

      return;
    }


    const channel =
      supabase.channel(
        `chat:${conversationId}`,
        {
          config: {
            presence: {
              key:
                currentUser.id,
            },

            broadcast: {
              self:
                false,
            },
          },
        }
      );


    channelRef.current =
      channel;


    /*
     * =======================================================
     * NEW / UPDATED / DELETED MESSAGE
     * =======================================================
     */

    channel.on(
      "postgres_changes",
      {
        event:
          "*",

        schema:
          "public",

        table:
          "chat_messages",

        filter:
          `conversation_id=eq.${conversationId}`,
      },
      () => {

        scheduleConversationRefresh();

      }
    );


    /*
     * =======================================================
     * REACTIONS
     * =======================================================
     */

    channel.on(
      "postgres_changes",
      {
        event:
          "*",

        schema:
          "public",

        table:
          "chat_reactions",

        filter:
          `conversation_id=eq.${conversationId}`,
      },
      () => {

        scheduleConversationRefresh();

      }
    );


    /*
     * =======================================================
     * READ RECEIPTS
     *
     * IMPORTANT:
     *
     * This does NOT call the normal conversation refresh.
     *
     * Otherwise:
     *
     * read
     * → realtime
     * → mark read
     * → realtime
     * → infinite refresh
     * =======================================================
     */

    channel.on(
      "postgres_changes",
      {
        event:
          "*",

        schema:
          "public",

        table:
          "chat_message_reads",

        filter:
          `conversation_id=eq.${conversationId}`,
      },
      () => {

        scheduleReadRefresh();

      }
    );


    /*
     * =======================================================
     * TYPING
     * =======================================================
     */

    channel.on(
      "broadcast",
      {
        event:
          "typing",
      },
      (
        payload
      ) => {

        const userId =
          payload.payload
            ?.userId as
            string |
            undefined;


        const isTyping =
          Boolean(
            payload.payload
              ?.isTyping
          );


        if (
          !userId ||
          userId ===
            currentUser.id
        ) {

          return;
        }


        const oldTimer =
          typingTimers
            .current
            .get(
              userId
            );


        if (
          oldTimer
        ) {

          clearTimeout(
            oldTimer
          );
        }


        if (
          !isTyping
        ) {

          setTypingUserIds(
            (
              current
            ) =>
              current.filter(
                (
                  id
                ) =>
                  id !==
                  userId
              )
          );


          typingTimers
            .current
            .delete(
              userId
            );


          return;
        }


        setTypingUserIds(
          (
            current
          ) =>
            current.includes(
              userId
            )
              ? current
              : [
                  ...current,
                  userId,
                ]
        );


        const timer =
          setTimeout(
            () => {

              setTypingUserIds(
                (
                  current
                ) =>
                  current.filter(
                    (
                      id
                    ) =>
                      id !==
                      userId
                  )
              );


              typingTimers
                .current
                .delete(
                  userId
                );

            },
            2500
          );


        typingTimers
          .current
          .set(
            userId,
            timer
          );
      }
    );


    /*
     * =======================================================
     * ONLINE PRESENCE
     * =======================================================
     */

    channel.on(
      "presence",
      {
        event:
          "sync",
      },
      () => {

        const state =
          channel
            .presenceState();


        const ids:
          string[] =
          [];


        Object.values(
          state
        ).forEach(
          (
            presences:
              any
          ) => {

            (
              presences ??
              []
            ).forEach(
              (
                presence:
                  any
              ) => {

                const id =
                  presence
                    ?.userId;


                if (
                  typeof id ===
                  "string"
                ) {

                  ids.push(
                    id
                  );
                }
              }
            );
          }
        );


        setOnlineUserIds(
          [
            ...new Set(
              ids
            ),
          ]
        );
      }
    );


    /*
     * =======================================================
     * SUBSCRIBE
     * =======================================================
     */

    channel.subscribe(
      async (
        status
      ) => {

        if (
          status ===
          "SUBSCRIBED"
        ) {

          await channel.track({
            userId:
              currentUser.id,

            fullName:
              currentUser
                .full_name,

            email:
              currentUser.email,

            onlineAt:
              new Date()
                .toISOString(),
          });
        }
      }
    );


    /*
     * =======================================================
     * CLEANUP
     * =======================================================
     */

    return () => {

      typingTimers
        .current
        .forEach(
          (
            timer
          ) => {

            clearTimeout(
              timer
            );
          }
        );


      typingTimers
        .current
        .clear();


      if (
        conversationRefreshTimer
          .current
      ) {

        clearTimeout(
          conversationRefreshTimer
            .current
        );
      }


      if (
        readRefreshTimer
          .current
      ) {

        clearTimeout(
          readRefreshTimer
            .current
        );
      }


      channelRef.current =
        null;


      void supabase
        .removeChannel(
          channel
        );
    };

  }, [
    conversationId,
    currentUser,
    scheduleConversationRefresh,
    scheduleReadRefresh,
  ]);


  /*
   * =========================================================
   * SEND TYPING EVENT
   * =========================================================
   */

  const sendTyping =
    useCallback(
      (
        isTyping:
          boolean
      ) => {

        if (
          !channelRef.current ||
          !currentUser
        ) {

          return;
        }


        void channelRef
          .current
          .send({
            type:
              "broadcast",

            event:
              "typing",

            payload: {
              userId:
                currentUser.id,

              isTyping,
            },
          });

      },
      [
        currentUser,
      ]
    );


  return {
    typingUserIds,

    onlineUserIds,

    sendTyping,
  };
}