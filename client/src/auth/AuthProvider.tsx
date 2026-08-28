import {
  createContext,
  useEffect,
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

  signOut: () => Promise<void>;
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


  useEffect(() => {
    let mounted =
      true;


    /*
     * ---------------------------------------
     * Load current Supabase session
     * ---------------------------------------
     */
    const initialiseAuth =
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


          if (!mounted) {
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


          if (mounted) {
            setSession(null);

            setUser(null);
          }

        } finally {
          /*
           * THIS IS THE IMPORTANT FIX.
           *
           * loading must always become false,
           * even if Supabase returns an error.
           */
          if (mounted) {
            setLoading(false);
          }
        }
      };


    initialiseAuth();


    /*
     * ---------------------------------------
     * Listen for login/logout/session changes
     * ---------------------------------------
     */
    const {
      data: authListener,
    } =
      supabase.auth
        .onAuthStateChange(
          (
            _event,
            newSession
          ) => {
            if (!mounted) {
              return;
            }


            setSession(
              newSession
            );


            setUser(
              newSession?.user ??
                null
            );


            /*
             * Never leave the app
             * permanently loading.
             */
            setLoading(false);
          }
        );


    return () => {
      mounted =
        false;


      authListener
        .subscription
        .unsubscribe();
    };

  }, []);


  /*
   * ---------------------------------------
   * LOGIN
   * ---------------------------------------
   */
  const signIn =
    async (
      email: string,
      password: string
    ) => {
      const {
        data,
        error,
      } =
        await supabase.auth
          .signInWithPassword({
            email,
            password,
          });


      if (error) {
        throw error;
      }


      setSession(
        data.session
      );


      setUser(
        data.user
      );
    };


  /*
   * ---------------------------------------
   * LOGOUT
   * ---------------------------------------
   */
  const signOut =
    async () => {
      const {
        error,
      } =
        await supabase.auth
          .signOut();


      if (error) {
        throw error;
      }


      setSession(null);

      setUser(null);
    };


  const value:
    AuthContextValue =
    {
      user,

      session,

      loading,

      signIn,

      signOut,
    };


  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}