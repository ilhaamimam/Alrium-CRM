import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  fetchLeads,
} from "./lead.api";

import LeadForm from "./LeadForm";

import LeadTable from "./LeadTable";

import type {
  Lead,
} from "./lead.types";


export default function LeadsPage() {
  const [leads, setLeads] =
    useState<Lead[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  const loadLeads =
    useCallback(async () => {
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
    }, []);


  useEffect(() => {
    loadLeads();
  }, [loadLeads]);


  if (loading) {
    return (
      <p>Loading leads...</p>
    );
  }


  return (
    <div>

      <h1>Leads</h1>


      {error && (
        <p>{error}</p>
      )}


      <LeadForm
        onCreated={
          loadLeads
        }
      />


      <hr />


      <h2>
        Current Leads
      </h2>


      <LeadTable
        leads={leads}
      />

    </div>
  );
}