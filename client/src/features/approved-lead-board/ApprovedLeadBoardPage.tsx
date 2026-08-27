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


          setBoardItems(
            board
          );


          setAvailableLeads(
            available
          );

        } catch (error) {

          console.error(
            "LOAD LEAD BOARD ERROR:",
            error
          );


          setError(
            "Unable to load approved Lead Board"
          );

        } finally {

          setLoading(false);

        }
      },
      []
    );


  useEffect(() => {

    loadBoard();

  }, [
    loadBoard,
  ]);


  if (loading) {
    return (
      <p>
        Loading approved Lead Board...
      </p>
    );
  }


  return (
    <div>

      <h1>
        Approved Lead Board
      </h1>


      <p>
        Senior Manager Management
      </p>


      {error && (
        <p>{error}</p>
      )}


      <ApprovedLeadBoardAddForm
        availableLeads={
          availableLeads
        }

        onAdded={
          loadBoard
        }
      />


      <hr />


      <h2>
        Board
      </h2>


      <ApprovedLeadBoardTable
        items={
          boardItems
        }
      />

    </div>
  );
}