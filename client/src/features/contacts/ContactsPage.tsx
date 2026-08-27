import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  fetchContacts,
} from "./contact.api";

import ContactForm
  from "./ContactForm";

import ContactTable
  from "./ContactTable";

import type {
  Contact,
} from "./contact.types";

import "./contacts.css";


export default function ContactPage() {
  const [
    contacts,
    setContacts,
  ] =
    useState<Contact[]>([]);

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


  const loadContacts =
    useCallback(
      async () => {
        try {
          setError("");

          const data =
            await fetchContacts();

          setContacts(data);
        } catch (error) {
          console.error(
            "LOAD CONTACTS ERROR:",
            error
          );

          setError(
            "Unable to load contacts"
          );
        } finally {
          setLoading(false);
        }
      },
      []
    );


  useEffect(() => {
    loadContacts();
  }, [loadContacts]);


  if (loading) {
    return (
      <div className="page-shell">

        <div className="empty-state">
          Loading contacts...
        </div>

      </div>
    );
  }


  return (
    <div className="page-shell">

      <div className="page-header">

        <h1 className="page-title">
          Contacts
        </h1>

        <p className="page-subtitle">
          Manage customer contacts
          connected to companies.
        </p>

      </div>


      {error && (
        <p className="error-message">
          {error}
        </p>
      )}


      <div className="contacts-layout">

        <div className="card">

          <ContactForm
            onCreated={
              loadContacts
            }
          />

        </div>


        <div className="card">

          <h2 className="card-title">
            Contact Directory
          </h2>

          <ContactTable
            contacts={
              contacts
            }
          />

        </div>

      </div>

    </div>
  );
}