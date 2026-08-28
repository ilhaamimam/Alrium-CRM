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


export default function ProjectStatusForm({
  project,
  onUpdated,
}: Props) {

  const [
    status,
    setStatus,
  ] =
    useState<
      ProjectProgressStatus
    >(
      project.status
    );


  const [
    completionNotes,
    setCompletionNotes,
  ] =
    useState(
      project.completion_notes ??
      ""
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
          status,
          completionNotes
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


      <div className="form-group">

        <label>
          Project Status
        </label>

        <select
          value={status}
          onChange={(event) =>
            setStatus(
              event.target
                .value as
                ProjectProgressStatus
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

          <option value="done">
            Done
          </option>

        </select>

      </div>


      <div className="form-group form-group-full">

        <label>
          Completion Notes
        </label>

        <textarea
          value={
            completionNotes
          }
          onChange={(event) =>
            setCompletionNotes(
              event.target.value
            )
          }
          placeholder="Add completion notes when the project is finished..."
        />

      </div>


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