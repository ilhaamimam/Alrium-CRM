import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  fetchApprovedLeadBoard,
  fetchAvailableApprovedLeads,
} from "./approvedLeadBoard.api";

import ApprovedLeadBoardAddForm
  from "./ApprovedLeadBoardAddForm";

import ApprovedLeadBoardTable
  from "./ApprovedLeadBoardTable";

import type {
  ApprovedLead,
  ApprovedLeadBoardItem,
} from "./approvedLeadBoard.types";

import "./approvedLeadBoard.css";


export default function ApprovedLeadBoardPage() {
  const [
    boardItems,
    setBoardItems,
  ] =
    useState<
      ApprovedLeadBoardItem[]
    >([]);

  const [
    availableLeads,
    setAvailableLeads,
  ] =
    useState<
      ApprovedLead[]
    >([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState("");


  const loadBoard =
    useCallback(
      async () => {
        try {
          setError("");

          const [
            board,
            available,
          ] =
            await Promise.all([
              fetchApprovedLeadBoard(),
              fetchAvailableApprovedLeads(),
            ]);


          setBoardItems(board);

          setAvailableLeads(
            available
          );

        } catch (error) {
          console.error(
            "LOAD LEAD BOARD ERROR:",
            error
          );

          setError(
            "Unable to load Approved Lead Board"
          );

        } finally {
          setLoading(false);
        }
      },
      []
    );


  useEffect(() => {
    loadBoard();
  }, [loadBoard]);


  if (loading) {
    return (
      <div className="page-shell">

        <div className="empty-state">
          Loading Approved Lead Board...
        </div>

      </div>
    );
  }


  return (
    <div className="page-shell">

      <div className="page-header">

        <h1 className="page-title">
          Approved Lead Board
        </h1>

        <p className="page-subtitle">
          Manage approved Hot leads from
          planning through completion.
        </p>

      </div>


      {error && (
        <p className="error-message">
          {error}
        </p>
      )}


      <div className="lead-board-grid">

        <div className="card">

          <ApprovedLeadBoardAddForm
            availableLeads={
              availableLeads
            }

            onAdded={
              loadBoard
            }
          />

        </div>


        <div className="card">

          <h2 className="card-title">
            Lead Board
          </h2>

          <ApprovedLeadBoardTable
            items={
              boardItems
            }
          />

        </div>

      </div>

    </div>
  );
}