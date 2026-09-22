import axios from "axios";

import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import {
  fetchCompanies,
} from "../companies/company.api";

import {
  createContact,
} from "./contact.api";


interface Props {
  onCreated: () => void;
}


interface CompanyOption {
  id: string;
  name: string;
}


export default function ContactForm({
  onCreated,
}: Props) {
  /*
   * =========================================================
   * COMPANY LIST
   * =========================================================
   */

  const [
    companies,
    setCompanies,
  ] =
    useState<CompanyOption[]>([]);


  const [
    loadingCompanies,
    setLoadingCompanies,
  ] =
    useState(true);


  /*
   * =========================================================
   * FORM VALUES
   * =========================================================
   */

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


  const [
    email,
    setEmail,
  ] =
    useState("");


  const [
    phone,
    setPhone,
  ] =
    useState("");


  const [
    jobTitle,
    setJobTitle,
  ] =
    useState("");


  const [
    notes,
    setNotes,
  ] =
    useState("");


  /*
   * =========================================================
   * UI STATE
   * =========================================================
   */

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


  const [
    success,
    setSuccess,
  ] =
    useState("");


  /*
   * =========================================================
   * LOAD COMPANIES
   * =========================================================
   */

  useEffect(() => {
    const loadCompanies =
      async () => {
        try {
          const data =
            await fetchCompanies();


          setCompanies(
            data
          );

        } catch (error) {
          console.error(
            "LOAD COMPANIES ERROR:",
            error
          );

        } finally {
          setLoadingCompanies(
            false
          );
        }
      };


    void loadCompanies();

  }, []);


  /*
   * =========================================================
   * CREATE CONTACT
   * =========================================================
   */

  const handleSubmit =
    async (
      event:
        FormEvent<HTMLFormElement>
    ) => {
      event.preventDefault();


      if (loading) {
        return;
      }


      setError("");
      setSuccess("");


      /*
       * -----------------------------------------
       * VALIDATE FIRST NAME
       * -----------------------------------------
       */

      const cleanFirstName =
        firstName.trim();


      if (!cleanFirstName) {
        setError(
          "First name is required"
        );

        return;
      }


      /*
       * -----------------------------------------
       * CREATE EXACT API PAYLOAD
       * -----------------------------------------
       */

      const payload = {
        companyId:
          companyId.trim()
            ? companyId.trim()
            : null,

        firstName:
          cleanFirstName,

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
        "================================="
      );

      console.log(
        "CONTACT FORM PAYLOAD:"
      );

      console.log(
        payload
      );

      console.log(
        "FIRST NAME FROM FORM:",
        payload.firstName
      );

      console.log(
        "================================="
      );


      setLoading(true);


      try {
        /*
         * IMPORTANT:
         *
         * The payload object MUST be passed
         * into createContact().
         */

        const createdContact =
          await createContact(
            payload
          );


        console.log(
          "CONTACT CREATED:",
          createdContact
        );


        setSuccess(
          "Contact created successfully"
        );


        /*
         * Clear form after success.
         */

        setCompanyId("");

        setFirstName("");

        setLastName("");

        setEmail("");

        setPhone("");

        setJobTitle("");

        setNotes("");


        /*
         * Reload Contact Directory.
         */

        await onCreated();

      } catch (error) {
        console.error(
          "CREATE CONTACT ERROR:",
          error
        );


        if (
          axios.isAxiosError(
            error
          )
        ) {
          console.error(
            "CONTACT API STATUS:",
            error.response?.status
          );

          console.error(
            "CONTACT API RESPONSE:",
            error.response?.data
          );


          setError(
            error.response
              ?.data
              ?.message ||
            error.message ||
            "Unable to create contact"
          );

        } else if (
          error instanceof Error
        ) {
          setError(
            error.message
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


  /*
   * =========================================================
   * FORM
   * =========================================================
   */

  return (
    <form
      className="form-grid"
      onSubmit={
        handleSubmit
      }
    >

      {/* TITLE */}

      <div className="form-group form-group-full">

        <h2 className="card-title">
          Add Contact
        </h2>

      </div>


      {/* COMPANY */}

      <div className="form-group form-group-full">

        <label
          htmlFor="contact-company"
        >
          Company
        </label>


        <select
          id="contact-company"
          name="companyId"
          value={
            companyId
          }
          onChange={(event) =>
            setCompanyId(
              event.target.value
            )
          }
          disabled={
            loadingCompanies ||
            loading
          }
        >

          <option value="">
            No Company
          </option>


          {companies.map(
            (company) => (
              <option
                key={
                  company.id
                }
                value={
                  company.id
                }
              >
                {company.name}
              </option>
            )
          )}

        </select>

      </div>


      {/* FIRST NAME */}

      <div className="form-group">

        <label
          htmlFor="contact-first-name"
        >
          First Name
        </label>


        <input
          id="contact-first-name"
          name="firstName"
          type="text"
          value={
            firstName
          }
          onChange={(event) =>
            setFirstName(
              event.target.value
            )
          }
          placeholder="First name"
          autoComplete="given-name"
          disabled={
            loading
          }
          required
        />

      </div>


      {/* LAST NAME */}

      <div className="form-group">

        <label
          htmlFor="contact-last-name"
        >
          Last Name
        </label>


        <input
          id="contact-last-name"
          name="lastName"
          type="text"
          value={
            lastName
          }
          onChange={(event) =>
            setLastName(
              event.target.value
            )
          }
          placeholder="Last name"
          autoComplete="family-name"
          disabled={
            loading
          }
        />

      </div>


      {/* EMAIL */}

      <div className="form-group">

        <label
          htmlFor="contact-email"
        >
          Email
        </label>


        <input
          id="contact-email"
          name="email"
          type="email"
          value={
            email
          }
          onChange={(event) =>
            setEmail(
              event.target.value
            )
          }
          placeholder="person@example.com"
          autoComplete="email"
          disabled={
            loading
          }
        />

      </div>


      {/* PHONE */}

      <div className="form-group">

        <label
          htmlFor="contact-phone"
        >
          Phone
        </label>


        <input
          id="contact-phone"
          name="phone"
          type="tel"
          value={
            phone
          }
          onChange={(event) =>
            setPhone(
              event.target.value
            )
          }
          placeholder="0771234567"
          autoComplete="tel"
          disabled={
            loading
          }
        />

      </div>


      {/* JOB TITLE */}

      <div className="form-group form-group-full">

        <label
          htmlFor="contact-job-title"
        >
          Job Title
        </label>


        <input
          id="contact-job-title"
          name="jobTitle"
          type="text"
          value={
            jobTitle
          }
          onChange={(event) =>
            setJobTitle(
              event.target.value
            )
          }
          placeholder="Engineer"
          disabled={
            loading
          }
        />

      </div>


      {/* NOTES */}

      <div className="form-group form-group-full">

        <label
          htmlFor="contact-notes"
        >
          Notes
        </label>


        <textarea
          id="contact-notes"
          name="notes"
          value={
            notes
          }
          onChange={(event) =>
            setNotes(
              event.target.value
            )
          }
          placeholder="Additional information about this contact..."
          disabled={
            loading
          }
        />

      </div>


      {/* ERROR */}

      {error && (
        <div className="error-message form-group-full">

          {error}

        </div>
      )}


      {/* SUCCESS */}

      {success && (
        <div className="success-message form-group-full">

          {success}

        </div>
      )}


      {/* SUBMIT */}

      <div className="button-row form-group-full">

        <button
          type="submit"
          disabled={
            loading
          }
        >

          {loading
            ? "Creating..."
            : "Create Contact"}

        </button>

      </div>

    </form>
  );
}