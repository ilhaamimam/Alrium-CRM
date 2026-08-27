import type {
  ReactNode,
} from "react";

import {
  Navigate,
} from "react-router-dom";

import { useAuth } from "../../auth/useAuth";


interface Props {
  children: ReactNode;
}


export default function ProtectedRoute({
  children,
}: Props) {
  const {
    user,
    loading,
  } = useAuth();


  if (loading) {
    return <p>Loading...</p>;
  }


  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }


  return children;
}