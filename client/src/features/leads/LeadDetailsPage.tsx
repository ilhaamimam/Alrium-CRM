import axios from "axios";

import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  fetchLeadById,
  removeLead,
} from "./lead.api";

import LeadEditForm from "./LeadEditForm";

import type {
  Lead,
} from "./lead.types";


export default function LeadDetailsPage() {
  const { id } =
    useParams<{ id: string }>();

  const navigate =
    useNavigate();


  const [lead, setLead] =
    useState<Lead | null>(null);

  const [editing, setEditing] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  useEffect(() => {
    const loadLead = async () => {
      if (!id) {
        setError(
          "Lead ID is missing"
        );

        setLoading(false);

        return;
      }


      try {
        const data =
          await fetchLeadById(
            id
          );

        setLead(data);

      } catch (error) {
        console.error(
          error
        );

        setError(
          "Unable to load lead"
        );

      } finally {
        setLoading(false);
      }
    };


    loadLead();

  }, [id]);


  const handleRemove =
    async () => {
      if (!lead) {
        return;
      }


      const confirmed =
        window.confirm(
          `Remove lead "${lead.title}"? The lead will be archived and its history will be kept.`
        );


      if (!confirmed) {
        return;
      }


      try {
        await removeLead(
          lead.id
        );

        navigate(
          "/leads"
        );

      } catch (error) {
        console.error(
          error
        );


        if (
          axios.isAxiosError(error)
        ) {
          setError(
            error.response?.data?.message ||
              "Unable to remove lead"
          );
        } else {
          setError(
            "Unable to remove lead"
          );
        }
      }
    };


  if (loading) {
    return (
      <p>Loading lead...</p>
    );
  }


  if (error) {
    return (
      <div>
        <p>{error}</p>

        <Link to="/leads">
          Back to Leads
        </Link>
      </div>
    );
  }


  if (!lead) {
    return (
      <p>Lead not found.</p>
    );
  }


  if (editing) {
    return (
      <LeadEditForm
        lead={lead}

        onUpdated={(
          updated
        ) => {
          setLead(
            updated
          );

          setEditing(false);
        }}

        onCancel={() =>
          setEditing(false)
        }
      />
    );
  }


  return (
    <div>

      <Link to="/leads">
        ← Back to Leads
      </Link>


      <h1>{lead.title}</h1>


      <button
        onClick={() =>
          setEditing(true)
        }
      >
        Edit Lead
      </button>


      <button
        onClick={
          handleRemove
        }
      >
        Remove Lead
      </button>


      <hr />


      <p>
        <strong>
          Company:
        </strong>{" "}

        {lead.companies?.name ||
          "-"}
      </p>


      <p>
        <strong>
          Contact:
        </strong>{" "}

        {lead.contacts
          ? `${lead.contacts.first_name} ${lead.contacts.last_name || ""}`
          : "-"}
      </p>


      <p>
        <strong>
          Contact Email:
        </strong>{" "}

        {lead.contacts?.email ||
          "-"}
      </p>


      <p>
        <strong>
          Description:
        </strong>{" "}

        {lead.description ||
          "-"}
      </p>


      <p>
        <strong>
          Source:
        </strong>{" "}

        {lead.source ||
          "-"}
      </p>


      <p>
        <strong>
          Estimated Budget:
        </strong>{" "}

        {lead.estimated_budget ??
          "-"}
      </p>


      <p>
        <strong>
          Expected Close:
        </strong>{" "}

        {lead.expected_close_date ||
          "-"}
      </p>


      <p>
        <strong>
          Temperature:
        </strong>{" "}

        {lead.temperature}
      </p>


      <p>
        <strong>
          Workflow Stage:
        </strong>{" "}

        {lead.workflow_stage}
      </p>


      <p>
        <strong>
          Created:
        </strong>{" "}

        {new Date(
          lead.created_at
        ).toLocaleString()}
      </p>


      <p>
        <strong>
          Last Updated:
        </strong>{" "}

        {new Date(
          lead.updated_at
        ).toLocaleString()}
      </p>

    </div>
  );
}