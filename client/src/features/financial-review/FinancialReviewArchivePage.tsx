import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  fetchFinancialArchive,
} from "./financialReview.api";

import type {
  FinancialReviewLead,
} from "./financialReview.types";

import "./financialReview.css";


export default function FinancialReviewArchivePage() {
  const [
    leads,
    setLeads,
  ] =
    useState<
      FinancialReviewLead[]
    >([]);


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


  useEffect(() => {

    const loadArchive =
      async () => {

        try {

          setError("");


          const data =
            await fetchFinancialArchive();


          setLeads(
            data
          );

        } catch (error) {

          console.error(
            "FINANCIAL ARCHIVE ERROR:",
            error
          );


          setError(
            "Unable to load rejected leads"
          );

        } finally {

          setLoading(false);

        }
      };


    void loadArchive();

  }, []);


  return (
    <div className="page-shell">

      {/* HEADER */}

      <div className="page-header">

        <h1 className="page-title">
          Financial Archive
        </h1>


        <p className="page-subtitle">
          Leads rejected during
          financial assessment.
        </p>

      </div>


      {/* BACK */}

      <div className="financial-toolbar">

        <Link
          to="/financial-review"
          className="btn btn-secondary"
        >
          Back to Financial Review
        </Link>

      </div>


      {/* ERROR */}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}


      {/* TABLE */}

      <div className="card">

        <h2 className="card-title">
          Rejected Leads
        </h2>


        {loading ? (

          <p>
            Loading archive...
          </p>

        ) : leads.length ===
        0 ? (

          <div className="empty-state">
            No rejected leads.
          </div>

        ) : (

          <div className="table-wrap">

            <table>

              <thead>

                <tr>

                  <th>
                    Lead
                  </th>

                  <th>
                    Company
                  </th>

                  <th>
                    Lead Tag
                  </th>

                  <th>
                    Financial Status
                  </th>

                  <th>
                    Rejection Reason
                  </th>

                  <th>
                    Reviewed
                  </th>

                </tr>

              </thead>


              <tbody>

                {leads.map(
                  (lead) => (

                    <tr
                      key={
                        lead.id
                      }
                    >

                      <td>

                        <strong>
                          {lead.title ||
                            lead.name ||
                            "Untitled Lead"}
                        </strong>

                      </td>


                      <td>
                        {lead
                          .companies
                          ?.name ||
                          "-"}
                      </td>


                      <td>

                        <LeadTemperatureBadge
                          status={
                            lead.status
                          }
                        />

                      </td>


                      <td>

                        <span className="financial-status financial-status-rejected">
                          Rejected
                        </span>

                      </td>


                      <td>
                        {lead
                          .financial_review
                          .review_notes ||
                          "No reason provided"}
                      </td>


                      <td>
                        {lead
                          .financial_review
                          .reviewed_at
                          ? new Date(
                              lead
                                .financial_review
                                .reviewed_at
                            )
                              .toLocaleString()
                          : "-"}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  );
}


function LeadTemperatureBadge({
  status,
}: {
  status?: string;
}) {

  const normalized =
    status
      ?.toLowerCase()
      .trim() ||
    "unknown";


  return (
    <span
      className={
        `lead-temperature lead-temperature-${normalized}`
      }
    >

      {normalized === "cold"
        ? "Cold"
        : normalized === "hot"
          ? "Hot"
          : status || "Not Set"}

    </span>
  );
}