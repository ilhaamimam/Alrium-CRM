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
  createLead,
  fetchSalesRepresentatives,
} from "./lead.api";

import type {
  Company,
} from "../companies/company.types";

import type {
  Contact,
} from "../contacts/contact.types";

import type {
  SalesRepresentative,
} from "./lead.types";


interface Props {
  onCreated: () => void;
}


export default function LeadForm({
  onCreated,
}: Props) {
  const [companies, setCompanies] =
    useState<Company[]>([]);

  const [contacts, setContacts] =
    useState<Contact[]>([]);

  const [
    salesRepresentatives,
    setSalesRepresentatives,
  ] =
    useState<
      SalesRepresentative[]
    >([]);


  const [companyId, setCompanyId] =
    useState("");

  const [contactId, setContactId] =
    useState("");

  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [source, setSource] =
    useState("");

  const [
    estimatedBudget,
    setEstimatedBudget,
  ] =
    useState("");

  const [
    expectedCloseDate,
    setExpectedCloseDate,
  ] =
    useState("");

  const [
    assignedSalesRepId,
    setAssignedSalesRepId,
  ] =
    useState("");


  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  useEffect(() => {
    const loadFormData = async () => {
      try {
        const [
          companiesData,
          contactsData,
          repsData,
        ] =
          await Promise.all([
            fetchCompanies(),
            fetchContacts(),
            fetchSalesRepresentatives(),
          ]);


        setCompanies(
          companiesData
        );

        setContacts(
          contactsData
        );

        setSalesRepresentatives(
          repsData
        );

      } catch (error) {
        console.error(
          "LOAD LEAD FORM DATA ERROR:",
          error
        );

        setError(
          "Unable to load lead form data"
        );
      }
    };


    loadFormData();

  }, []);


  const filteredContacts =
    useMemo(() => {
      if (!companyId) {
        return [];
      }


      return contacts.filter(
        (contact) =>
          contact.company_id ===
          companyId
      );

    }, [
      contacts,
      companyId,
    ]);


  const handleCompanyChange = (
    newCompanyId: string
  ) => {
    setCompanyId(
      newCompanyId
    );

    // Reset contact whenever
    // company changes
    setContactId("");
  };


  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setLoading(true);


    try {
      await createLead({
        companyId:
          companyId || undefined,

        contactId:
          contactId || undefined,

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
          undefined,

        assignedSalesRepId:
          assignedSalesRepId ||
          undefined,
      });


      setCompanyId("");
      setContactId("");
      setTitle("");
      setDescription("");
      setSource("");
      setEstimatedBudget("");
      setExpectedCloseDate("");
      setAssignedSalesRepId("");


      onCreated();

    } catch (error) {
      console.error(
        "CREATE LEAD ERROR:",
        error
      );


      if (
        axios.isAxiosError(error)
      ) {
        setError(
          error.response?.data?.message ||
            error.message ||
            "Unable to create lead"
        );
      } else {
        setError(
          "Unable to create lead"
        );
      }

    } finally {
      setLoading(false);
    }
  };


  return (
    <form onSubmit={handleSubmit}>

      <h2>Add Lead</h2>


      <div>
        <label>
          Lead Title
        </label>

        <input
          type="text"
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
          onChange={(event) =>
            handleCompanyChange(
              event.target.value
            )
          }
        >
          <option value="">
            Select Company
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
          disabled={!companyId}
        >
          <option value="">
            Select Contact
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
          type="text"
          value={source}
          onChange={(event) =>
            setSource(
              event.target.value
            )
          }
          placeholder="Website, Referral, Phone..."
        />
      </div>


      <div>
        <label>
          Estimated Budget
        </label>

        <input
          type="number"
          min="0"
          step="0.01"
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
          Assign Sales Representative
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

          {salesRepresentatives.map(
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
          ? "Creating..."
          : "Create Lead"}
      </button>

    </form>
  );
}