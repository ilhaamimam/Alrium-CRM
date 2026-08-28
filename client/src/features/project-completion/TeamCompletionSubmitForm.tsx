import axios from "axios";

import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from "react";

import {
  fetchProjectCompletionStatus,
  submitProjectCompletion,
} from "./projectCompletion.api";

import type {
  ProjectCompletionStatus,
} from "./projectCompletion.types";


interface Props {
  projectId: string;

  incompleteTaskCount:
    number;

  onSubmitted:
    () => void;
}


export default function TeamCompletionSubmitForm({
  projectId,
  incompleteTaskCount,
  onSubmitted,
}: Props) {

  const [
    completion,
    setCompletion,
  ] =
    useState<
      ProjectCompletionStatus |
      null
    >(null);


  const [
    notes,
    setNotes,
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


  const [
    success,
    setSuccess,
  ] =
    useState("");


  const loadStatus =
    useCallback(
      async () => {

        try {

          const data =
            await fetchProjectCompletionStatus(
              projectId
            );


          setCompletion(
            data
          );


          setNotes(
            data.completion_notes ??
            ""
          );

        } catch (error) {

          console.error(
            "LOAD COMPLETION STATUS ERROR:",
            error
          );

        }
      },

      [
        projectId,
      ]
    );


  useEffect(() => {

    loadStatus();

  }, [
    loadStatus,
  ]);


  const handleSubmit =
    async (
      event:
        FormEvent<HTMLFormElement>
    ) => {

      event.preventDefault();

      setError("");
      setSuccess("");


      if (
        incompleteTaskCount >
        0
      ) {

        setError(
          `Complete the remaining ${incompleteTaskCount} task(s) before submitting the project.`
        );

        return;
      }


      setLoading(true);


      try {

        await submitProjectCompletion(
          projectId,
          notes.trim()
        );


        setSuccess(
          "Project submitted to the Senior Manager for final review."
        );


        await loadStatus();

        await onSubmitted();

      } catch (error) {

        console.error(
          "SUBMIT COMPLETION ERROR:",
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
              "Unable to submit project completion"
          );

        } else {

          setError(
            "Unable to submit project completion"
          );
        }

      } finally {

        setLoading(false);

      }
    };


  const reviewStatus =
    completion
      ?.completion_review_status;


  if (
    reviewStatus ===
    "confirmed"
  ) {

    return (
      <div>

        <h2 className="card-title">
          Project Completion
        </h2>


        <div className="completion-message completion-confirmed">

          <strong>
            Project Confirmed Done
          </strong>

          <p>
            The Senior Manager has
            completed the final review.
          </p>

        </div>

      </div>
    );
  }


  if (
    reviewStatus ===
    "pending_review"
  ) {

    return (
      <div>

        <h2 className="card-title">
          Project Completion
        </h2>


        <div className="completion-message completion-pending">

          <strong>
            Waiting for Senior Manager Review
          </strong>

          <p>
            The team has submitted this
            project as completed.
          </p>

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
          Submit Project Completion
        </h2>

      </div>


      {reviewStatus ===
        "changes_requested" && (

        <div className="completion-message completion-changes form-group-full">

          <strong>
            Senior Manager Requested Changes
          </strong>


          <p>
            {completion
              ?.senior_review_notes ||
              "Additional changes are required."}
          </p>

        </div>
      )}


      <div className="form-group form-group-full">

        <label>
          Completion Notes
        </label>

        <textarea
          value={notes}
          onChange={(event) =>
            setNotes(
              event.target.value
            )
          }
          placeholder="Summarize completed work, delivery notes and anything the Senior Manager should review..."
        />

      </div>


      <div className="completion-check form-group-full">

        <span>
          Remaining Tasks
        </span>

        <strong>
          {incompleteTaskCount}
        </strong>

      </div>


      {error && (
        <p className="error-message form-group-full">
          {error}
        </p>
      )}


      {success && (
        <p className="success-message form-group-full">
          {success}
        </p>
      )}


      <div className="button-row form-group-full">

        <button
          type="submit"
          disabled={
            loading ||
            incompleteTaskCount >
              0
          }
        >

          {loading
            ? "Submitting..."
            : reviewStatus ===
                "changes_requested"
              ? "Resubmit Project"
              : "Submit Project as Completed"}

        </button>

      </div>

    </form>
  );
}