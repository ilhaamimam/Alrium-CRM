import axios from "axios";

import {
  useState,
  type FormEvent,
} from "react";

import {
  createTeam,
} from "./teamAllocation.api";


interface Props {
  onCreated:
    () => void;
}


export default function TeamForm({
  onCreated,
}: Props) {

  const [
    name,
    setName,
  ] =
    useState("");


  const [
    description,
    setDescription,
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


      if (!name.trim()) {

        setError(
          "Team name is required"
        );

        return;
      }


      setLoading(true);


      try {

        await createTeam({
          name:
            name.trim(),

          description:
            description.trim(),
        });


        setName("");

        setDescription("");


        onCreated();

      } catch (error) {

        console.error(
          "CREATE TEAM ERROR:",
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
              "Unable to create team"
          );

        } else {

          setError(
            "Unable to create team"
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
        Create Team
      </h2>


      <div>
        <label>
          Team Name
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


      {error && (
        <p>
          {error}
        </p>
      )}


      <button
        type="submit"
        disabled={
          loading
        }
      >
        {loading
          ? "Creating..."
          : "Create Team"}
      </button>

    </form>
  );
}