import axios from "axios";

import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import {
  createContact,
} from "./contact.api";

import {
  fetchCompanies,
} from "../companies/company.api";

import type {
  Company,
} from "../companies/company.types";

interface Props {
  onCreated: () => void;
}

export default function ContactForm({
  onCreated,
}: Props) {
  const [companies, setCompanies] =
    useState<Company[]>([]);

  const [companyId, setCompanyId] =
    useState("");

  const [firstName, setFirstName] =
    useState("");

  const [lastName, setLastName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [jobTitle, setJobTitle] =
    useState("");

  const [notes, setNotes] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadCompanies =
      async () => {
        try {
          const data =
            await fetchCompanies();

          setCompanies(data);
        } catch (error) {
          console.error(
            "LOAD COMPANIES ERROR:",
            error
          );

          setError(
            "Unable to load companies"
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

    /*
     * Frontend validation.
     */
    if (!firstName.trim()) {
      setError(
        "First name is required"
      );

      return;
    }

    setLoading(true);

    try {
      const requestData = {
        companyId:
          companyId || null,

        firstName:
          firstName.trim(),

        lastName:
          lastName.trim(),

        email:
          email.trim(),

        phone:
          phone.trim(),

        jobTitle:
          jobTitle.trim(),

        notes:
          notes.trim(),
      };

      console.log(
        "CONTACT FORM DATA:",
        requestData
      );

      await createContact(
        requestData
      );

      /*
       * Clear fields after success.
       */
      setCompanyId("");
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setJobTitle("");
      setNotes("");

      /*
       * Reload contacts in ContactPage.
       */
      onCreated();

    } catch (error) {
      console.error(
        "CREATE CONTACT ERROR:",
        error
      );

      if (
        axios.isAxiosError(error)
      ) {
        setError(
          error.response?.data?.message ||
            error.message ||
            "Unable to create contact"
        );
      } else {
        setError(
          "Unable to create contact"
        );
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>

      <h2>Add Contact</h2>


      <div>
        <label>
          Company
        </label>

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
        <label>
          First Name
        </label>

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
        <label>
          Last Name
        </label>

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
        <label>
          Email
        </label>

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
        <label>
          Phone
        </label>

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
        <label>
          Job Title
        </label>

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
        <label>
          Notes
        </label>

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
          ? "Creating..."
          : "Create Contact"}
      </button>

    </form>
  );
}