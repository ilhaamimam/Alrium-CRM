import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  fetchContacts,
} from "./contact.api";

import ContactForm from "./ContactForm";

import ContactTable from "./ContactTable";

import type {
  Contact,
} from "./contact.types";


export default function ContactPage() {
  const [contacts, setContacts] =
    useState<Contact[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  const loadContacts =
    useCallback(async () => {
      try {
        setError("");

        const data =
          await fetchContacts();

        console.log(
          "Contacts from API:",
          data
        );

        setContacts(data);

      } catch (error) {
        console.error(
          "Load contacts error:",
          error
        );

        setError(
          "Unable to load contacts"
        );

      } finally {
        setLoading(false);
      }
    }, []);


  useEffect(() => {
    loadContacts();
  }, [loadContacts]);


  if (loading) {
    return (
      <p>Loading contacts...</p>
    );
  }


  return (
    <div>
      <h1>Contacts</h1>


      {error && (
        <p>{error}</p>
      )}


      <ContactForm
        onCreated={loadContacts}
      />


      <ContactTable
        contacts={contacts}
      />

    </div>
  );
}