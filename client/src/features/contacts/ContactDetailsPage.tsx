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
    useParams<{ id: string }>();


  const [contact, setContact] =
    useState<Contact | null>(
      null
    );


  const [loading, setLoading] =
    useState(true);


  const [error, setError] =
    useState("");


  const [editing, setEditing] =
    useState(false);


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

          setContact(data);

        } catch (error) {
          console.error(
            "Load contact error:",
            error
          );


          if (
            axios.isAxiosError(
              error
            )
          ) {
            setError(
              error.response?.data?.message ||
                "Unable to load contact"
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


    loadContact();

  }, [id]);


  if (loading) {
    return (
      <p>
        Loading contact...
      </p>
    );
  }


  if (error) {
    return (
      <div>

        <p>{error}</p>

        <Link to="/contacts">
          Back to Contacts
        </Link>

      </div>
    );
  }


  if (!contact) {
    return (
      <p>
        Contact not found.
      </p>
    );
  }


  if (editing) {
    return (
      <ContactEditForm
        contact={contact}

        onUpdated={(
          updatedContact
        ) => {

          setContact(
            updatedContact
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

      <p>
        <Link to="/contacts">
          ← Back to Contacts
        </Link>
      </p>


      <h1>
        {contact.first_name}
        {" "}
        {contact.last_name || ""}
      </h1>


      <button
        onClick={() =>
          setEditing(true)
        }
      >
        Edit Contact
      </button>


      <hr />


      <p>
        <strong>
          Company:
        </strong>{" "}

        {contact.companies?.name ||
          "-"}
      </p>


      <p>
        <strong>
          First Name:
        </strong>{" "}

        {contact.first_name}
      </p>


      <p>
        <strong>
          Last Name:
        </strong>{" "}

        {contact.last_name ||
          "-"}
      </p>


      <p>
        <strong>
          Email:
        </strong>{" "}

        {contact.email ||
          "-"}
      </p>


      <p>
        <strong>
          Phone:
        </strong>{" "}

        {contact.phone ||
          "-"}
      </p>


      <p>
        <strong>
          Job Title:
        </strong>{" "}

        {contact.job_title ||
          "-"}
      </p>


      <p>
        <strong>
          Notes:
        </strong>{" "}

        {contact.notes ||
          "-"}
      </p>


      <p>
        <strong>
          Created:
        </strong>{" "}

        {new Date(
          contact.created_at
        ).toLocaleString()}
      </p>


      <p>
        <strong>
          Last Updated:
        </strong>{" "}

        {new Date(
          contact.updated_at
        ).toLocaleString()}
      </p>

    </div>
  );
}