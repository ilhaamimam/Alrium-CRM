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
  const [
    companies,
    setCompanies,
  ] =
    useState<Company[]>([]);

  const [
    companyId,
    setCompanyId,
  ] =
    useState("");

  const [
    firstName,
    setFirstName,
  ] =
    useState("");

  const [
    lastName,
    setLastName,
  ] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [
    jobTitle,
    setJobTitle,
  ] =
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
            error
          );
        }
      };

    loadCompanies();
  }, []);


  const handleSubmit = async (
    event:
      FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");


    if (!firstName.trim()) {
      setError(
        "First name is required"
      );

      return;
    }


    setLoading(true);


    try {
      await createContact({
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
      });


      setCompanyId("");
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setJobTitle("");
      setNotes("");


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
    <form
      className="form-grid"
      onSubmit={handleSubmit}
    >

      <div className="form-group form-group-full">

        <h2 className="card-title">
          Add Contact
        </h2>

      </div>


      <div className="form-group form-group-full">

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


      <div className="form-group">

        <label>
          First Name
        </label>

        <input
          value={firstName}
          onChange={(event) =>
            setFirstName(
              event.target.value
            )
          }
          required
        />

      </div>


      <div className="form-group">

        <label>
          Last Name
        </label>

        <input
          value={lastName}
          onChange={(event) =>
            setLastName(
              event.target.value
            )
          }
        />

      </div>


      <div className="form-group">

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


      <div className="form-group">

        <label>
          Phone
        </label>

        <input
          value={phone}
          onChange={(event) =>
            setPhone(
              event.target.value
            )
          }
        />

      </div>


      <div className="form-group form-group-full">

        <label>
          Job Title
        </label>

        <input
          value={jobTitle}
          onChange={(event) =>
            setJobTitle(
              event.target.value
            )
          }
        />

      </div>


      <div className="form-group form-group-full">

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
        <p className="error-message form-group-full">
          {error}
        </p>
      )}


      <div className="button-row form-group-full">

        <button
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Creating..."
            : "Create Contact"}
        </button>

      </div>

    </form>
  );
}