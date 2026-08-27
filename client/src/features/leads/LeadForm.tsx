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
  const [
    companies,
    setCompanies,
  ] =
    useState<Company[]>([]);


  const [
    contacts,
    setContacts,
  ] =
    useState<Contact[]>([]);


  const [
    salesRepresentatives,
    setSalesRepresentatives,
  ] =
    useState<
      SalesRepresentative[]
    >([]);


  const [
    companyId,
    setCompanyId,
  ] =
    useState("");


  const [
    contactId,
    setContactId,
  ] =
    useState("");


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
    source,
    setSource,
  ] =
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


  const [
    loading,
    setLoading,
  ] =
    useState(false);


  const [
    loadingData,
    setLoadingData,
  ] =
    useState(true);


  const [
    error,
    setError,
  ] =
    useState("");


  /*
   * Load Companies,
   * Contacts,
   * Sales Representatives
   */
  useEffect(() => {
    const loadFormData =
      async () => {
        try {
          setError("");

          const [
            companiesData,
            contactsData,
            salesRepsData,
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
            salesRepsData
          );

        } catch (error) {
          console.error(
            "LOAD LEAD FORM DATA ERROR:",
            error
          );


          setError(
            "Unable to load Lead form data"
          );

        } finally {
          setLoadingData(
            false
          );
        }
      };


    loadFormData();

  }, []);


  /*
   * Only show Contacts
   * belonging to selected Company.
   */
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


  /*
   * Changing Company must
   * clear selected Contact.
   */
  const handleCompanyChange = (
    newCompanyId: string
  ) => {
    setCompanyId(
      newCompanyId
    );

    setContactId("");
  };


  /*
   * Create Lead.
   */
  const handleSubmit = async (
    event:
      FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");


    if (!title.trim()) {
      setError(
        "Lead title is required"
      );

      return;
    }


    if (
      estimatedBudget &&
      Number(
        estimatedBudget
      ) < 0
    ) {
      setError(
        "Estimated budget cannot be negative"
      );

      return;
    }


    setLoading(true);


    try {
      await createLead({
        companyId:
          companyId ||
          undefined,

        contactId:
          contactId ||
          undefined,

        title:
          title.trim(),

        description:
          description.trim(),

        source:
          source.trim(),

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


      /*
       * Clear form after creation.
       */
      setCompanyId("");
      setContactId("");
      setTitle("");
      setDescription("");
      setSource("");
      setEstimatedBudget("");
      setExpectedCloseDate("");
      setAssignedSalesRepId("");


      /*
       * Reload lead list.
       */
      onCreated();

    } catch (error) {
      console.error(
        "CREATE LEAD ERROR:",
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


  if (loadingData) {
    return (
      <div className="empty-state">
        Loading Lead form...
      </div>
    );
  }


  return (
    <form
      className="form-grid"
      onSubmit={handleSubmit}
    >

      <div className="form-group form-group-full">

        <h2 className="card-title">
          Add Lead
        </h2>

      </div>


      {/* LEAD TITLE */}

      <div className="form-group form-group-full">

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
          placeholder="Example: Website Redesign"
          required
        />

      </div>


      {/* COMPANY */}

      <div className="form-group">

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


      {/* CONTACT */}

      <div className="form-group">

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
            {companyId
              ? "Select Contact"
              : "Select Company First"}
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


      {/* DESCRIPTION */}

      <div className="form-group form-group-full">

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
          placeholder="Describe the customer requirement..."
        />

      </div>


      {/* SOURCE */}

      <div className="form-group">

        <label>
          Lead Source
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


      {/* BUDGET */}

      <div className="form-group">

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
          placeholder="25000"
        />

      </div>


      {/* CLOSE DATE */}

      <div className="form-group">

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


      {/* SALES REP */}

      <div className="form-group">

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


      {/* DEFAULT TEMPERATURE */}

      <div className="form-group form-group-full">

        <label>
          Lead Temperature
        </label>

        <div>
          <span className="badge badge-primary">
            Cold
          </span>
        </div>

        <small
          style={{
            color:
              "var(--text-muted)",
          }}
        >
          New leads start as Cold.
          Hot status will be applied
          after the required approvals.
        </small>

      </div>


      {/* ERROR */}

      {error && (
        <p className="error-message form-group-full">
          {error}
        </p>
      )}


      {/* BUTTON */}

      <div className="button-row form-group-full">

        <button
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Creating..."
            : "Create Lead"}
        </button>

      </div>

    </form>
  );
}