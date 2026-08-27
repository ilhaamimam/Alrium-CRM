import axios from "axios";

import {
  useState,
  type FormEvent,
} from "react";

import {
  updateApprovedLeadBoardItem,
} from "./approvedLeadBoard.api";

import type {
  ApprovedLeadBoardItem,
  ApprovedLeadBoardStatus,
} from "./approvedLeadBoard.types";


interface Props {
  item: ApprovedLeadBoardItem;

  onUpdated: (
    item: ApprovedLeadBoardItem
  ) => void;

  onCancel: () => void;
}


export default function ApprovedLeadBoardEditForm({
  item,
  onUpdated,
  onCancel,
}: Props) {
  const [name, setName] =
    useState(item.name);

  const [
    description,
    setDescription,
  ] =
    useState(
      item.description ?? ""
    );

  const [
    status,
    setStatus,
  ] =
    useState<ApprovedLeadBoardStatus>(
      item.status
    );

  const [
    plannedStartDate,
    setPlannedStartDate,
  ] =
    useState(
      item.planned_start_date ?? ""
    );

  const [
    plannedEndDate,
    setPlannedEndDate,
  ] =
    useState(
      item.planned_end_date ?? ""
    );

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


  const handleStatusChange = (
    value: string
  ) => {
    const newStatus =
      value as ApprovedLeadBoardStatus;

    setStatus(newStatus);
  };


  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const updated =
        await updateApprovedLeadBoardItem(
          item.id,
          {
            name:
              name.trim(),

            description:
              description.trim(),

            status,

            plannedStartDate:
              plannedStartDate ||
              null,

            plannedEndDate:
              plannedEndDate ||
              null,
          }
        );

      onUpdated(updated);

    } catch (error) {
      console.error(
        "UPDATE LEAD BOARD ERROR:",
        error
      );

      if (
        axios.isAxiosError(error)
      ) {
        setError(
          error.response?.data?.message ||
            error.message ||
            "Unable to update approved lead"
        );
      } else {
        setError(
          "Unable to update approved lead"
        );
      }

    } finally {
      setLoading(false);
    }
  };


  return (
    <form
      onSubmit={handleSubmit}
    >
      <h2>
        Edit Approved Lead
      </h2>


      <div>
        <label>
          Board Name
        </label>

        <input
          type="text"
          value={name}
          onChange={(event) =>
            setName(
              event.target.value
            )
          }
          required
        />
      </div>


      <div>
        <label>
          Description
        </label>

        <textarea
          value={description}
          onChange={(event) =>
            setDescription(
              event.target.value
            )
          }
        />
      </div>


      <div>
        <label>
          Status
        </label>

        <select
          value={status}
          onChange={(event) =>
            handleStatusChange(
              event.target.value
            )
          }
        >
          <option value="pending">
            Pending
          </option>

          <option value="planned">
            Planned
          </option>

          <option value="assigned">
            Assigned
          </option>

          <option value="ongoing">
            Ongoing
          </option>

          <option value="done">
            Done
          </option>
        </select>
      </div>


      <div>
        <label>
          Planned Start Date
        </label>

        <input
          type="date"
          value={plannedStartDate}
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
          value={plannedEndDate}
          onChange={(event) =>
            setPlannedEndDate(
              event.target.value
            )
          }
        />
      </div>


      {error && (
        <p>
          {error}
        </p>
      )}


      <button
        type="submit"
        disabled={loading}
      >
        {loading
          ? "Updating..."
          : "Save Changes"}
      </button>


      <button
        type="button"
        onClick={onCancel}
        disabled={loading}
      >
        Cancel
      </button>
    </form>
  );
}