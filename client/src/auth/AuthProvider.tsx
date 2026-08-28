import {
  createContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type {
  Session,
  User,
} from "@supabase/supabase-js";

import {
  supabase,
} from "../lib/supabase";


export interface AuthContextValue {
  user: User | null;

  session: Session | null;

  loading: boolean;

  signIn: (
    email: string,
    password: string
  ) => Promise<void>;

  signOut:
    () => Promise<void>;
}


export const AuthContext =
  createContext<
    AuthContextValue | undefined
  >(undefined);


interface Props {
  children: ReactNode;
}


export default function AuthProvider({
  children,
}: Props) {
  const [
    user,
    setUser,
  ] =
    useState<User | null>(
      null
    );


  const [
    session,
    setSession,
  ] =
    useState<Session | null>(
      null
    );


  const [
    loading,
    setLoading,
  ] =
    useState(true);


  /*
   * =========================================
   * INITIAL AUTH CHECK
   * =========================================
   */
  useEffect(() => {
    let active =
      true;


    const initialise =
      async () => {
        try {
          const {
            data,
            error,
          } =
            await supabase.auth
              .getSession();


          if (error) {
            console.error(
              "GET SESSION ERROR:",
              error
            );
          }


          if (!active) {
            return;
          }


          setSession(
            data.session
          );


          setUser(
            data.session?.user ??
              null
          );

        } catch (error) {
          console.error(
            "AUTH INITIALISATION ERROR:",
            error
          );


          if (active) {
            setSession(null);

            setUser(null);
          }

        } finally {
          if (active) {
            setLoading(false);
          }
        }
      };


    void initialise();


    /*
     * Listen for Supabase login/logout.
     *
     * Important:
     * Do not make awaited Supabase auth calls
     * inside this callback.
     */
    const {
      data: subscriptionData,
    } =
      supabase.auth
        .onAuthStateChange(
          (
            event,
            newSession
          ) => {
            console.log(
              "AUTH EVENT:",
              event
            );


            if (!active) {
              return;
            }


            setSession(
              newSession
            );


            setUser(
              newSession?.user ??
                null
            );


            setLoading(false);
          }
        );


    return () => {
      active =
        false;


      subscriptionData
        .subscription
        .unsubscribe();
    };

  }, []);


  /*
   * =========================================
   * LOGIN
   * =========================================
   */
  const signIn =
    async (
      email: string,
      password: string
    ) => {
      console.log(
        "Starting Supabase login..."
      );


      /*
       * Timeout prevents the UI from
       * remaining on Signing In forever.
       */
      const loginPromise =
        supabase.auth
          .signInWithPassword({
            email,
            password,
          });


      const timeoutPromise =
        new Promise<never>(
          (
            _resolve,
            reject
          ) => {
            window.setTimeout(
              () => {
                reject(
                  new Error(
                    "Login request timed out. Check Supabase URL, key, and internet connection."
                  )
                );
              },
              15000
            );
          }
        );


      const {
        data,
        error,
      } =
        await Promise.race([
          loginPromise,
          timeoutPromise,
        ]);


      if (error) {
        console.error(
          "SUPABASE LOGIN ERROR:",
          error
        );

        throw error;
      }


      if (
        !data.user ||
        !data.session
      ) {
        throw new Error(
          "Supabase did not return a valid session"
        );
      }


      console.log(
        "Supabase login successful:",
        data.user.email
      );


      setUser(
        data.user
      );


      setSession(
        data.session
      );


      setLoading(false);
    };


  /*
   * =========================================
   * LOGOUT
   * =========================================
   */
  const signOut =
    async () => {
      const {
        error,
      } =
        await supabase.auth
          .signOut();


      if (error) {
        console.error(
          "LOGOUT ERROR:",
          error
        );

        throw error;
      }


      setSession(null);

      setUser(null);

      setLoading(false);
    };


  const value =
    useMemo<AuthContextValue>(
      () => ({
        user,

        session,

        loading,

        signIn,

        signOut,
      }),
      [
        user,
        session,
        loading,
      ]
    );


  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}