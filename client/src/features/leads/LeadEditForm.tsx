import axios from "axios";

import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import {
  fetchCompanies,
} from "../companies/company.api";

import {
  fetchContacts,
} from "../contacts/contact.api";

import {
  fetchSalesRepresentatives,
  updateLead,
} from "./lead.api";

import type {
  Company,
} from "../companies/company.types";

import type {
  Contact,
} from "../contacts/contact.types";

import type {
  Lead,
  SalesRepresentative,
} from "./lead.types";


interface Props {
  lead: Lead;

  onUpdated:
    (lead: Lead) => void;

  onCancel:
    () => void;
}


export default function LeadEditForm({
  lead,
  onUpdated,
  onCancel,
}: Props) {
  const [companies, setCompanies] =
    useState<Company[]>([]);

  const [contacts, setContacts] =
    useState<Contact[]>([]);

  const [salesReps, setSalesReps] =
    useState<
      SalesRepresentative[]
    >([]);


  const [companyId, setCompanyId] =
    useState(
      lead.company_id ?? ""
    );

  const [contactId, setContactId] =
    useState(
      lead.contact_id ?? ""
    );

  const [title, setTitle] =
    useState(
      lead.title
    );

  const [description, setDescription] =
    useState(
      lead.description ?? ""
    );

  const [source, setSource] =
    useState(
      lead.source ?? ""
    );

  const [
    estimatedBudget,
    setEstimatedBudget,
  ] =
    useState(
      lead.estimated_budget !==
      null
        ? String(
            lead.estimated_budget
          )
        : ""
    );

  const [
    expectedCloseDate,
    setExpectedCloseDate,
  ] =
    useState(
      lead.expected_close_date ??
        ""
    );

  const [
    assignedSalesRepId,
    setAssignedSalesRepId,
  ] =
    useState(
      lead.assigned_sales_rep_id ??
        ""
    );


  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          companyData,
          contactData,
          repsData,
        ] =
          await Promise.all([
            fetchCompanies(),
            fetchContacts(),
            fetchSalesRepresentatives(),
          ]);


        setCompanies(
          companyData
        );

        setContacts(
          contactData
        );

        setSalesReps(
          repsData
        );

      } catch (error) {
        console.error(
          error
        );
      }
    };


    loadData();

  }, []);


  const filteredContacts =
    useMemo(() => {
      return contacts.filter(
        (contact) =>
          contact.company_id ===
          companyId
      );

    }, [
      contacts,
      companyId,
    ]);


  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setLoading(true);
    setError("");


    try {
      const updated =
        await updateLead(
          lead.id,
          {
            companyId:
              companyId || null,

            contactId:
              contactId || null,

            title,

            description,

            source,

            estimatedBudget:
              estimatedBudget
                ? Number(
                    estimatedBudget
                  )
                : null,

            expectedCloseDate:
              expectedCloseDate ||
              null,

            assignedSalesRepId:
              assignedSalesRepId ||
              null,
          }
        );


      onUpdated(updated);

    } catch (error) {
      console.error(
        "UPDATE LEAD ERROR:",
        error
      );


      if (
        axios.isAxiosError(error)
      ) {
        setError(
          error.response?.data?.message ||
            "Unable to update lead"
        );
      } else {
        setError(
          "Unable to update lead"
        );
      }

    } finally {
      setLoading(false);
    }
  };


  return (
    <form onSubmit={handleSubmit}>

      <h2>Edit Lead</h2>


      <div>
        <label>
          Lead Title
        </label>

        <input
          value={title}
          onChange={(event) =>
            setTitle(
              event.target.value
            )
          }
          required
        />
      </div>


      <div>
        <label>
          Company
        </label>

        <select
          value={companyId}
          onChange={(event) => {
            setCompanyId(
              event.target.value
            );

            setContactId("");
          }}
        >
          <option value="">
            No Company
          </option>

          {companies.map(
            (company) => (
              <option
                key={company.id}
                value={company.id}
              >
                {company.name}
              </option>
            )
          )}
        </select>
      </div>


      <div>
        <label>
          Contact
        </label>

        <select
          value={contactId}
          onChange={(event) =>
            setContactId(
              event.target.value
            )
          }
        >
          <option value="">
            No Contact
          </option>

          {filteredContacts.map(
            (contact) => (
              <option
                key={contact.id}
                value={contact.id}
              >
                {contact.first_name}
                {" "}
                {contact.last_name ||
                  ""}
              </option>
            )
          )}
        </select>
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
          Source
        </label>

        <input
          value={source}
          onChange={(event) =>
            setSource(
              event.target.value
            )
          }
        />
      </div>


      <div>
        <label>
          Estimated Budget
        </label>

        <input
          type="number"
          min="0"
          value={estimatedBudget}
          onChange={(event) =>
            setEstimatedBudget(
              event.target.value
            )
          }
        />
      </div>


      <div>
        <label>
          Expected Close Date
        </label>

        <input
          type="date"
          value={expectedCloseDate}
          onChange={(event) =>
            setExpectedCloseDate(
              event.target.value
            )
          }
        />
      </div>


      <div>
        <label>
          Sales Representative
        </label>

        <select
          value={
            assignedSalesRepId
          }
          onChange={(event) =>
            setAssignedSalesRepId(
              event.target.value
            )
          }
        >
          <option value="">
            Not Assigned
          </option>

          {salesReps.map(
            (rep) => (
              <option
                key={rep.id}
                value={rep.id}
              >
                {rep.full_name ||
                  rep.email}
              </option>
            )
          )}
        </select>
      </div>


      {error && (
        <p>{error}</p>
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
      >
        Cancel
      </button>

    </form>
  );
}