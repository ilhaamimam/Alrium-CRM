import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  fetchLeads,
} from "./lead.api";

import LeadForm
  from "./LeadForm";

import LeadTable
  from "./LeadTable";

import type {
  Lead,
} from "./lead.types";

import "./leads.css";


export default function LeadsPage() {
  const [
    leads,
    setLeads,
  ] =
    useState<Lead[]>([]);

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


  const loadLeads =
    useCallback(
      async () => {
        try {
          setError("");

          const data =
            await fetchLeads();

          setLeads(data);
        } catch (error) {
          console.error(
            "LOAD LEADS ERROR:",
            error
          );

          setError(
            "Unable to load leads"
          );
        } finally {
          setLoading(false);
        }
      },
      []
    );


  useEffect(() => {
    loadLeads();
  }, [loadLeads]);


  if (loading) {
    return (
      <div className="page-shell">

        <div className="empty-state">
          Loading leads...
        </div>

      </div>
    );
  }


  return (
    <div className="page-shell">

      <div className="page-header">

        <h1 className="page-title">
          Leads
        </h1>

        <p className="page-subtitle">
          Track customer opportunities,
          sales ownership and lead status.
        </p>

      </div>


      {error && (
        <p className="error-message">
          {error}
        </p>
      )}


      <div className="leads-layout">

        <div className="card">

          <LeadForm
            onCreated={
              loadLeads
            }
          />

        </div>


        <div className="card">

          <h2 className="card-title">
            Lead Pipeline
          </h2>

          <LeadTable
            leads={
              leads
            }
          />

        </div>

      </div>

    </div>
  );
}