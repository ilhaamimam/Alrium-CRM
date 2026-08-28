import axios from "axios";

import {
  useState,
  type FormEvent,
} from "react";

import {
  createProjectTask,
} from "./teamProgress.api";

import type {
  AvailableProjectMember,
} from "./teamProgress.types";


interface Props {
  projectId: string;

  members:
    AvailableProjectMember[];

  onCreated:
    () => void;
}


export default function TaskForm({
  projectId,
  members,
  onCreated,
}: Props) {

  const [
    title,
    setTitle,
  ] =
    useState("");


  const [
    description,
    setDescription,
  ] =
    useState("");


  const [
    assignedTo,
    setAssignedTo,
  ] =
    useState("");


  const [
    dueDate,
    setDueDate,
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


      if (!title.trim()) {

        setError(
          "Task title is required"
        );

        return;
      }


      setLoading(true);


      try {

        await createProjectTask(
          projectId,
          {
            title:
              title.trim(),

            description:
              description.trim(),

            assignedTo:
              assignedTo ||
              undefined,

            dueDate:
              dueDate ||
              undefined,
          }
        );


        setTitle("");

        setDescription("");

        setAssignedTo("");

        setDueDate("");


        await onCreated();

      } catch (error) {

        console.error(
          "CREATE TASK ERROR:",
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
              "Unable to create task"
          );

        } else {

          setError(
            "Unable to create task"
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
          Add Task
        </h2>

      </div>


      <div className="form-group form-group-full">

        <label>
          Task Title
        </label>

        <input
          value={title}
          onChange={(event) =>
            setTitle(
              event.target.value
            )
          }
          placeholder="Example: Build login screen"
          required
        />

      </div>


      <div className="form-group form-group-full">

        <label>
          Description
        </label>

        <textarea
          value={
            description
          }
          onChange={(event) =>
            setDescription(
              event.target.value
            )
          }
        />

      </div>


      <div className="form-group">

        <label>
          Assign To
        </label>

        <select
          value={
            assignedTo
          }
          onChange={(event) =>
            setAssignedTo(
              event.target.value
            )
          }
        >

          <option value="">
            Assign to Me
          </option>


          {members.map(
            (member) => (

              <option
                key={
                  member.id
                }
                value={
                  member.id
                }
              >

                {member.full_name ||
                  member.email}

                {member.role_in_team
                  ? ` - ${member.role_in_team}`
                  : ""}

              </option>
            )
          )}

        </select>

      </div>


      <div className="form-group">

        <label>
          Due Date
        </label>

        <input
          type="date"
          value={
            dueDate
          }
          onChange={(event) =>
            setDueDate(
              event.target.value
            )
          }
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
            ? "Creating..."
            : "Create Task"}
        </button>

      </div>

    </form>
  );
}