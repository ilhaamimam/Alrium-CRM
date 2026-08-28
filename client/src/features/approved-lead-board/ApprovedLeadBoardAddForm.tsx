import axios from "axios";

import {
  useState,
  type FormEvent,
} from "react";

import {
  addApprovedLeadToBoard,
} from "./approvedLeadBoard.api";

import type {
  ApprovedLead,
} from "./approvedLeadBoard.types";


interface Props {
  availableLeads:
    ApprovedLead[];

  onAdded:
    () => void;
}


export default function ApprovedLeadBoardAddForm({
  availableLeads,
  onAdded,
}: Props) {

  const [
    leadId,
    setLeadId,
  ] =
    useState("");


  const [
    plannedStartDate,
    setPlannedStartDate,
  ] =
    useState("");


  const [
    plannedEndDate,
    setPlannedEndDate,
  ] =
    useState("");


  const [
    loading,
    setLoading,
  ] =
    useState(false);


  const [
    error,
    setError,
  ] =
    useState("");


  const handleSubmit =
    async (
      event:
        FormEvent<HTMLFormElement>
    ) => {

      event.preventDefault();

      setError("");


      if (!leadId) {
        setError(
          "Select an approved lead"
        );

        return;
      }


      setLoading(true);


      try {

        await addApprovedLeadToBoard({
          leadId,

          plannedStartDate:
            plannedStartDate ||
            undefined,

          plannedEndDate:
            plannedEndDate ||
            undefined,
        });


        setLeadId("");

        setPlannedStartDate("");

        setPlannedEndDate("");


        onAdded();

      } catch (error) {

        console.error(
          "ADD APPROVED LEAD ERROR:",
          error
        );


        if (
          axios.isAxiosError(
            error
          )
        ) {
          setError(
            error.response
              ?.data
              ?.message ||
            "Unable to add approved lead"
          );
        } else {
          setError(
            "Unable to add approved lead"
          );
        }

      } finally {

        setLoading(false);

      }
    };


  return (
    <form
      onSubmit={
        handleSubmit
      }
    >

      <h2>
        Add Approved Lead
      </h2>


      <div>
        <label>
          Approved Lead
        </label>

        <select
          value={leadId}
          onChange={(event) =>
            setLeadId(
              event.target.value
            )
          }
          required
        >
          <option value="">
            Select Approved Lead
          </option>


          {availableLeads.map(
            (lead) => (
              <option
                key={lead.id}
                value={lead.id}
              >
                {lead.title}
                {" - "}
                {lead.companies
                  ?.name ||
                  "No Company"}
              </option>
            )
          )}

        </select>
      </div>


      <div>
        <label>
          Planned Start Date
        </label>

        <input
          type="date"
          value={
            plannedStartDate
          }
          onChange={(event) =>
            setPlannedStartDate(
              event.target.value
            )
          }
        />
      </div>


      <div>
        <label>
          Planned End Date
        </label>

        <input
          type="date"
          value={
            plannedEndDate
          }
          onChange={(event) =>
            setPlannedEndDate(
              event.target.value
            )
          }
        />
      </div>


      {error && (
        <p>{error}</p>
      )}


      <button
        type="submit"
        disabled={
          loading
        }
      >
        {loading
          ? "Adding..."
          : "Add to Lead Board"}
      </button>

    </form>
  );
}