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

import { supabase } from "../lib/supabase";


interface AuthContextValue {
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
  createContext<AuthContextValue | undefined>(
    undefined
  );


interface Props {
  children: ReactNode;
}


export const AuthProvider = ({
  children,
}: Props) => {
  const [user, setUser] =
    useState<User | null>(null);

  const [session, setSession] =
    useState<Session | null>(null);

  const [loading, setLoading] =
    useState(true);


  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => {
        setSession(data.session);

        setUser(
          data.session?.user ?? null
        );

        setLoading(false);
      });


    const {
      data: { subscription },
    } =
      supabase.auth.onAuthStateChange(
        (_event, session) => {
          setSession(session);

          setUser(
            session?.user ?? null
          );

          setLoading(false);
        }
      );


    return () => {
      subscription.unsubscribe();
    };
  }, []);


  const signIn = async (
    email: string,
    password: string
  ) => {
    const { error } =
      await supabase.auth
        .signInWithPassword({
          email,
          password,
        });


    if (error) {
      throw error;
    }
  };


  const signOut = async () => {
    const { error } =
      await supabase.auth.signOut();

    if (error) {
      throw error;
    }
  };


  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};