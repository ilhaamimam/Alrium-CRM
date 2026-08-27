import type {
  ReactNode,
} from "react";

import {
  Navigate,
} from "react-router-dom";

import {
  useAuth,
} from "../../auth/useAuth";

import AppHeader
  from "../../components/AppHeader";


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


  if (loading) {
    return (
      <div className="page-shell">

        <div className="empty-state">
          Loading...
        </div>

      </div>
    );
  }


  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }


  return (
    <>
      <AppHeader />

      {children}
    </>
  );
}