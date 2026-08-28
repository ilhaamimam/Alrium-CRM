import type {
  ReactNode,
} from "react";

import {
  Navigate,
  useLocation,
} from "react-router-dom";

import {
  useAuth,
} from "../../auth/useAuth";

import AppLayout
  from "../../components/layout/AppLayout";


interface Props {
  children: ReactNode;
}


export default function ProtectedRoute({
  children,
}: Props) {
  const {
    user,
    loading,
  } =
    useAuth();


  const location =
    useLocation();


  /*
   * Only show this while Supabase
   * is genuinely checking the session.
   */
  if (loading) {
    return (
      <div className="auth-loading-screen">

        <div className="auth-loading-box">

          <div className="auth-loading-spinner" />

          <span>
            Loading CRM...
          </span>

        </div>

      </div>
    );
  }


  /*
   * Session check finished,
   * but no logged-in user.
   */
  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{
          from:
            location.pathname,
        }}
        replace
      />
    );
  }


  /*
   * Logged in.
   *
   * Load permanent left sidebar.
   */
  return (
    <AppLayout>

      {children}

    </AppLayout>
  );
}