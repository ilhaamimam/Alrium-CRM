import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  fetchApprovedLeadBoardItem,
} from "./approvedLeadBoard.api";

import ApprovedLeadBoardEditForm
  from "./ApprovedLeadBoardEditForm";

import type {
  ApprovedLeadBoardItem,
} from "./approvedLeadBoard.types";


export default function ApprovedLeadBoardDetailsPage() {

  const { id } =
    useParams<{
      id: string;
    }>();


  const [
    item,
    setItem,
  ] =
    useState<
      ApprovedLeadBoardItem |
      null
    >(null);


  const [
    editing,
    setEditing,
  ] =
    useState(false);


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


  useEffect(() => {

    const loadItem =
      async () => {

        if (!id) {
          setError(
            "Lead Board ID is missing"
          );

          setLoading(false);

          return;
        }


        try {

          const data =
            await fetchApprovedLeadBoardItem(
              id
            );


          setItem(
            data
          );

        } catch (error) {

          console.error(
            error
          );


          setError(
            "Unable to load approved lead"
          );

        } finally {

          setLoading(false);

        }
      };


    loadItem();

  }, [
    id,
  ]);


  if (loading) {
    return (
      <p>
        Loading approved lead...
      </p>
    );
  }


  if (error) {
    return (
      <div>

        <p>{error}</p>

        <Link
          to="/lead-board"
        >
          Back to Lead Board
        </Link>

      </div>
    );
  }


  if (!item) {
    return (
      <p>
        Approved lead not found.
      </p>
    );
  }


  if (editing) {
    return (
      <ApprovedLeadBoardEditForm
        item={item}

        onUpdated={(
          updated
        ) => {

          setItem(
            updated
          );

          setEditing(
            false
          );

        }}

        onCancel={() =>
          setEditing(
            false
          )
        }
      />
    );
  }


  const lead =
    item.leads;


  return (
    <div>

      <Link
        to="/lead-board"
      >
        ← Back to Lead Board
      </Link>


      <h1>
        {item.name}
      </h1>


      <button
        onClick={() =>
          setEditing(
            true
          )
        }
      >
        Edit Approved Lead
      </button>


      <hr />


      <h2>
        Lead Information
      </h2>


      <p>
        <strong>
          Original Lead:
        </strong>{" "}

        {lead?.title ||
          "-"}
      </p>


      <p>
        <strong>
          Company:
        </strong>{" "}

        {lead
          ?.companies
          ?.name ||
          "-"}
      </p>


      <p>
        <strong>
          Contact:
        </strong>{" "}

        {lead?.contacts
          ? `${lead.contacts.first_name} ${lead.contacts.last_name || ""}`
          : "-"}
      </p>


      <p>
        <strong>
          Contact Email:
        </strong>{" "}

        {lead
          ?.contacts
          ?.email ||
          "-"}
      </p>


      <p>
        <strong>
          Budget:
        </strong>{" "}

        {lead
          ?.estimated_budget ??
          "-"}
      </p>


      <p>
        <strong>
          Source:
        </strong>{" "}

        {lead?.source ||
          "-"}
      </p>


      <p>
        <strong>
          Temperature:
        </strong>{" "}

        {lead
          ?.temperature ||
          "-"}
      </p>


      <p>
        <strong>
          Approval Stage:
        </strong>{" "}

        {lead
          ?.workflow_stage ||
          "-"}
      </p>


      <hr />


      <h2>
        Lead Board Information
      </h2>


      <p>
        <strong>
          Board Status:
        </strong>{" "}

        {item.status}
      </p>


      <p>
        <strong>
          Description:
        </strong>{" "}

        {item.description ||
          "-"}
      </p>


      <p>
        <strong>
          Planned Start:
        </strong>{" "}

        {item.planned_start_date ||
          "-"}
      </p>


      <p>
        <strong>
          Planned End:
        </strong>{" "}

        {item.planned_end_date ||
          "-"}
      </p>


      <p>
        <strong>
          Actual End:
        </strong>{" "}

        {item.actual_end_date ||
          "-"}
      </p>


      <p>
        <strong>
          Created:
        </strong>{" "}

        {new Date(
          item.created_at
        ).toLocaleString()}
      </p>


      <p>
        <strong>
          Last Updated:
        </strong>{" "}

        {new Date(
          item.updated_at
        ).toLocaleString()}
      </p>

    </div>
  );
}