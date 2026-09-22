import axios from "axios";

import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  fetchContactById,
} from "./contact.api";

import ContactEditForm from "./ContactEditForm";

import type {
  Contact,
} from "./contact.types";


export default function ContactDetailsPage() {
  const { id } =
    useParams<{
      id: string;
    }>();


  const [
    contact,
    setContact,
  ] =
    useState<Contact | null>(
      null
    );


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


  const [
    editing,
    setEditing,
  ] =
    useState(false);


  /*
   * =========================================================
   * LOAD CONTACT
   * =========================================================
   */

  useEffect(() => {
    const loadContact =
      async () => {

        if (!id) {
          setError(
            "Contact ID is missing"
          );

          setLoading(false);

          return;
        }


        try {
          setError("");


          const data =
            await fetchContactById(
              id
            );


          setContact(
            data
          );

        } catch (error) {
          console.error(
            "LOAD CONTACT ERROR:",
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
              "Unable to load contact"
            );

          } else if (
            error instanceof Error
          ) {
            setError(
              error.message
            );

          } else {
            setError(
              "Unable to load contact"
            );
          }

        } finally {
          setLoading(false);
        }
      };


    void loadContact();

  }, [
    id,
  ]);


  /*
   * =========================================================
   * LOADING
   * =========================================================
   */

  if (loading) {
    return (
      <div className="page-shell">

        <div className="card">

          <p>
            Loading contact...
          </p>

        </div>

      </div>
    );
  }


  /*
   * =========================================================
   * ERROR
   * =========================================================
   */

  if (error) {
    return (
      <div className="page-shell">

        <div className="card">

          <div className="error-message">
            {error}
          </div>


          <p>
            <Link to="/contacts">
              ← Back to Contacts
            </Link>
          </p>

        </div>

      </div>
    );
  }


  /*
   * =========================================================
   * NOT FOUND
   * =========================================================
   */

  if (!contact) {
    return (
      <div className="page-shell">

        <div className="card">

          <p>
            Contact not found.
          </p>


          <Link to="/contacts">
            ← Back to Contacts
          </Link>

        </div>

      </div>
    );
  }


  /*
   * =========================================================
   * EDIT MODE
   * =========================================================
   */

  if (editing) {
    return (
      <div className="page-shell">

        <ContactEditForm
          contact={
            contact
          }
          onUpdated={(
            updatedContact
          ) => {

            setContact(
              updatedContact
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

      </div>
    );
  }


  /*
   * =========================================================
   * DETAILS PAGE
   * =========================================================
   */

  return (
    <div className="page-shell">

      {/* BACK */}

      <div className="page-header">

        <p>
          <Link to="/contacts">
            ← Back to Contacts
          </Link>
        </p>


        <h1 className="page-title">

          {contact.first_name}

          {" "}

          {contact.last_name ||
            ""}

        </h1>


        <p className="page-subtitle">
          View contact information
          and CRM details.
        </p>

      </div>


      {/* MAIN CARD */}

      <div className="card">

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems:
              "center",
            gap: "16px",
            marginBottom:
              "24px",
          }}
        >

          <h2 className="card-title">
            Contact Details
          </h2>


          <button
            type="button"
            onClick={() =>
              setEditing(
                true
              )
            }
          >
            Edit Contact
          </button>

        </div>


        <div className="details-grid">

          {/* COMPANY */}

          <DetailItem
            label="Company"
            value={
              contact
                .companies
                ?.name ||
              "-"
            }
          />


          {/* FIRST NAME */}

          <DetailItem
            label="First Name"
            value={
              contact
                .first_name
            }
          />


          {/* LAST NAME */}

          <DetailItem
            label="Last Name"
            value={
              contact
                .last_name ||
              "-"
            }
          />


          {/* EMAIL */}

          <DetailItem
            label="Email"
            value={
              contact.email ||
              "-"
            }
          />


          {/* PHONE */}

          <DetailItem
            label="Phone"
            value={
              contact.phone ||
              "-"
            }
          />


          {/* JOB TITLE */}

          <DetailItem
            label="Job Title"
            value={
              contact
                .job_title ||
              "-"
            }
          />


          {/* CREATED */}

          <DetailItem
            label="Created"
            value={
              formatDate(
                contact
                  .created_at
              )
            }
          />


          {/* UPDATED */}

          <DetailItem
            label="Last Updated"
            value={
              formatDate(
                contact
                  .updated_at
              )
            }
          />

        </div>


        {/* NOTES */}

        <div
          style={{
            marginTop:
              "24px",
          }}
        >

          <span className="detail-label">
            Notes
          </span>


          <div
            style={{
              marginTop:
                "8px",
              padding:
                "16px",
              border:
                "1px solid #eeeeee",
              borderRadius:
                "14px",
              background:
                "#fafafa",
              lineHeight:
                1.6,
            }}
          >

            {contact.notes ||
              "No notes available."}

          </div>

        </div>

      </div>

    </div>
  );
}


/*
 * =========================================================
 * DETAIL ITEM
 * =========================================================
 */

function DetailItem({
  label,
  value,
}: {
  label: string;

  value: string;
}) {
  return (
    <div className="detail-item">

      <span className="detail-label">
        {label}
      </span>


      <span className="detail-value">
        {value}
      </span>

    </div>
  );
}


/*
 * =========================================================
 * SAFE DATE FORMATTER
 *
 * Fixes TS2769 because created_at / updated_at
 * may be undefined or null.
 * =========================================================
 */

function formatDate(
  value:
    string |
    null |
    undefined
): string {

  if (!value) {
    return "Not available";
  }


  const date =
    new Date(
      value
    );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Not available";
  }


  return date
    .toLocaleString();
}