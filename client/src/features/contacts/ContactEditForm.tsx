import axios from "axios";

import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import {
  updateContact,
} from "./contact.api";

import {
  fetchCompanies,
} from "../companies/company.api";

import type {
  Contact,
} from "./contact.types";

import type {
  Company,
} from "../companies/company.types";


interface Props {
  contact: Contact;

  onUpdated: (
    contact: Contact
  ) => void;

  onCancel: () => void;
}


export default function ContactEditForm({
  contact,
  onUpdated,
  onCancel,
}: Props) {
  const [companies, setCompanies] =
    useState<Company[]>([]);


  const [companyId, setCompanyId] =
    useState(
      contact.company_id ?? ""
    );


  const [firstName, setFirstName] =
    useState(
      contact.first_name
    );


  const [lastName, setLastName] =
    useState(
      contact.last_name ?? ""
    );


  const [email, setEmail] =
    useState(
      contact.email ?? ""
    );


  const [phone, setPhone] =
    useState(
      contact.phone ?? ""
    );


  const [jobTitle, setJobTitle] =
    useState(
      contact.job_title ?? ""
    );


  const [notes, setNotes] =
    useState(
      contact.notes ?? ""
    );


  const [loading, setLoading] =
    useState(false);


  const [error, setError] =
    useState("");


  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const data =
          await fetchCompanies();

        setCompanies(data);
      } catch (error) {
        console.error(
          "Load companies error:",
          error
        );
      }
    };

    loadCompanies();
  }, []);


  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setLoading(true);


    try {
      const updatedContact =
        await updateContact(
          contact.id,
          {
            companyId:
              companyId || undefined,

            firstName,

            lastName,

            email,

            phone,

            jobTitle,

            notes,
          }
        );


      onUpdated(
        updatedContact
      );

    } catch (error) {
      console.error(
        "Update contact error:",
        error
      );


      if (
        axios.isAxiosError(error)
      ) {
        setError(
          error.response?.data?.message ||
            error.message ||
            "Unable to update contact"
        );
      } else {
        setError(
          "Unable to update contact"
        );
      }

    } finally {
      setLoading(false);
    }
  };


  return (
    <form onSubmit={handleSubmit}>

      <h2>Edit Contact</h2>


      <div>
        <label>Company</label>

        <select
          value={companyId}
          onChange={(event) =>
            setCompanyId(
              event.target.value
            )
          }
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
        <label>First Name</label>

        <input
          type="text"
          value={firstName}
          onChange={(event) =>
            setFirstName(
              event.target.value
            )
          }
          required
        />
      </div>


      <div>
        <label>Last Name</label>

        <input
          type="text"
          value={lastName}
          onChange={(event) =>
            setLastName(
              event.target.value
            )
          }
        />
      </div>


      <div>
        <label>Email</label>

        <input
          type="email"
          value={email}
          onChange={(event) =>
            setEmail(
              event.target.value
            )
          }
        />
      </div>


      <div>
        <label>Phone</label>

        <input
          type="text"
          value={phone}
          onChange={(event) =>
            setPhone(
              event.target.value
            )
          }
        />
      </div>


      <div>
        <label>Job Title</label>

        <input
          type="text"
          value={jobTitle}
          onChange={(event) =>
            setJobTitle(
              event.target.value
            )
          }
        />
      </div>


      <div>
        <label>Notes</label>

        <textarea
          value={notes}
          onChange={(event) =>
            setNotes(
              event.target.value
            )
          }
        />
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
        disabled={loading}
      >
        Cancel
      </button>

    </form>
  );
}