import axios from "axios";

import {
  useState,
  type FormEvent,
} from "react";

import {
  updateProjectProgressStatus,
} from "./teamProgress.api";

import type {
  ProjectProgressStatus,
  TeamProgressProjectDetails,
} from "./teamProgress.types";


interface Props {
  project:
    TeamProgressProjectDetails;

  onUpdated:
    () => void;
}


type EditableStatus =
  | "assigned"
  | "ongoing"
  | "on_hold";


export default function ProjectStatusForm({
  project,
  onUpdated,
}: Props) {

  const initialStatus:
    EditableStatus =
    project.status ===
      "on_hold"
      ? "on_hold"
      : project.status ===
          "assigned"
        ? "assigned"
        : "ongoing";


  const [
    status,
    setStatus,
  ] =
    useState<
      EditableStatus
    >(
      initialStatus
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


  const handleSubmit =
    async (
      event:
        FormEvent<HTMLFormElement>
    ) => {

      event.preventDefault();

      setError("");

      setLoading(true);


      try {

        await updateProjectProgressStatus(
          project.id,
          status as
            ProjectProgressStatus
        );


        await onUpdated();

      } catch (error) {

        console.error(
          "PROJECT STATUS ERROR:",
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
              "Unable to update project status"
          );

        } else {

          setError(
            "Unable to update project status"
          );
        }

      } finally {

        setLoading(false);

      }
    };


  if (
    project.status ===
    "done"
  ) {

    return (
      <div>

        <h2 className="card-title">
          Project Stage
        </h2>

        <div className="completion-message completion-confirmed">
          Project is confirmed Done.
        </div>

      </div>
    );
  }


  return (
    <form
      className="form-grid"
      onSubmit={
        handleSubmit
      }
    >

      <div className="form-group form-group-full">

        <h2 className="card-title">
          Project Stage
        </h2>

      </div>


      <div className="form-group form-group-full">

        <label>
          Working Status
        </label>

        <select
          value={status}
          onChange={(event) =>
            setStatus(
              event.target
                .value as
                EditableStatus
            )
          }
        >

          <option value="assigned">
            Assigned
          </option>

          <option value="ongoing">
            Ongoing
          </option>

          <option value="on_hold">
            On Hold
          </option>

        </select>

      </div>


      <p className="project-status-help form-group-full">
        To finish the overall project,
        use the Project Completion section.
        Senior Manager confirmation is
        required before the Lead Board
        becomes Done.
      </p>


      {error && (
        <p className="error-message form-group-full">
          {error}
        </p>
      )}


      <div className="button-row form-group-full">

        <button
          type="submit"
          disabled={
            loading
          }
        >

          {loading
            ? "Updating..."
            : "Update Project Status"}

        </button>

      </div>

    </form>
  );
}