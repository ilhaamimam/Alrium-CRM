import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  fetchPipelineLeads,
  type PipelineLead,
} from "../../api/pipeline.api";

import LeadForm
  from "./LeadForm";

import "./leads.css";


export default function LeadsPage() {
  /*
   * =========================================================
   * UNIFIED PIPELINE LEADS
   * =========================================================
   */

  const [
    leads,
    setLeads,
  ] =
    useState<
      PipelineLead[]
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


  /*
   * =========================================================
   * LOAD LEADS FROM UNIFIED PIPELINE
   * =========================================================
   */

  const loadLeads =
    useCallback(
      async () => {
        try {
          setError("");

          setLoading(true);


          const data =
            await fetchPipelineLeads();


          console.log(
            "UNIFIED PIPELINE LEADS:",
            data
          );


          setLeads(
            data
          );

        } catch (error) {
          console.error(
            "LOAD PIPELINE LEADS ERROR:",
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


  /*
   * =========================================================
   * INITIAL LOAD
   * =========================================================
   */

  useEffect(() => {
    void loadLeads();
  }, [
    loadLeads,
  ]);


  /*
   * =========================================================
   * LOADING
   * =========================================================
   */

  if (loading) {
    return (
      <div className="page-shell">

        <div className="empty-state">
          Loading leads...
        </div>

      </div>
    );
  }


  /*
   * =========================================================
   * PAGE
   * =========================================================
   */

  return (
    <div className="page-shell">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="page-header">

        <h1 className="page-title">
          Leads
        </h1>


        <p className="page-subtitle">
          Track customer opportunities,
          financial review, technical
          review and production status
          from one connected pipeline.
        </p>

      </div>


      {/* =====================================================
          ERROR
      ====================================================== */}

      {error && (
        <p className="error-message">
          {error}
        </p>
      )}


      <div className="leads-layout">

        {/* ===================================================
            CREATE LEAD
        ==================================================== */}

        <div className="card">

          <LeadForm
            onCreated={
              loadLeads
            }
          />

        </div>


        {/* ===================================================
            CONNECTED LEAD PIPELINE
        ==================================================== */}

        <div className="card">

          <h2 className="card-title">
            Lead Pipeline
          </h2>


          {leads.length ===
          0 ? (

            <div className="empty-state">
              No leads found.
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
                      Budget
                    </th>

                    <th>
                      Temperature
                    </th>

                    <th>
                      Finance
                    </th>

                    <th>
                      Technical
                    </th>

                    <th>
                      Pipeline
                    </th>

                    <th>
                      Actions
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

                        {/* LEAD NAME */}

                        <td>

                          <strong>
                            {getLeadTitle(
                              lead
                            )}
                          </strong>

                        </td>


                        {/* COMPANY */}

                        <td>

                          {lead.company_name ||
                            "-"}

                        </td>


                        {/* BUDGET */}

                        <td>

                          {formatBudget(
                            lead.budget
                          )}

                        </td>


                        {/* HOT / COLD */}

                        <td>

                          <LeadTemperatureBadge
                            status={
                              lead.status
                            }
                          />

                        </td>


                        {/* FINANCIAL REVIEW */}

                        <td>

                          <ReviewBadge
                            value={
                              lead.financial_decision
                            }
                            type="financial"
                          />

                        </td>


                        {/* TECHNICAL REVIEW */}

                        <td>

                          <ReviewBadge
                            value={
                              lead.technical_decision
                            }
                            type="technical"
                          />

                        </td>


                        {/* PIPELINE STAGE */}

                        <td>

                          <span className="pipeline-stage-badge">

                            {formatPipelineStage(
                              lead.pipeline_stage
                            )}

                          </span>

                        </td>


                        {/* ACTION */}

                        <td>

                          <Link
                            to={
                              `/leads/${lead.id}`
                            }
                            className="btn btn-secondary"
                          >
                            View
                          </Link>

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

    </div>
  );
}


/*
 * =========================================================
 * LEAD NAME
 * =========================================================
 */

function getLeadTitle(
  lead:
    PipelineLead
) {

  return (
    lead.title ||
    lead.name ||
    "Untitled Lead"
  );
}


/*
 * =========================================================
 * HOT / COLD BADGE
 * =========================================================
 */

function LeadTemperatureBadge({
  status,
}: {
  status:
    string |
    undefined;
}) {

  const normalized =
    status
      ?.toLowerCase()
      .trim() ||
    "cold";


  const isHot =
    normalized ===
    "hot";


  return (
    <span
      className={
        isHot
          ? "lead-temperature-hot"
          : "lead-temperature-cold"
      }
    >

      {isHot
        ? "Hot"
        : "Cold"}

    </span>
  );
}


/*
 * =========================================================
 * FINANCIAL / TECHNICAL BADGE
 * =========================================================
 */

function ReviewBadge({
  value,
  type,
}: {
  value:
    string |
    undefined;

  type:
    "financial" |
    "technical";
}) {

  const normalized =
    value ||
    "pending";


  return (
    <span
      className={
        `pipeline-review-badge pipeline-review-${normalized}`
      }
    >

      {type ===
      "financial"
        ? `Finance: ${formatPipelineStage(
            normalized
          )}`
        : `Technical: ${formatPipelineStage(
            normalized
          )}`}

    </span>
  );
}


/*
 * =========================================================
 * PIPELINE FORMATTER
 * =========================================================
 */

function formatPipelineStage(
  value:
    string |
    undefined
) {

  if (!value) {
    return "Pending";
  }


  return value
    .replace(
      /_/g,
      " "
    )
    .replace(
      /\b\w/g,
      (
        character
      ) =>
        character
          .toUpperCase()
    );
}


/*
 * =========================================================
 * BUDGET
 * =========================================================
 */

function formatBudget(
  value:
    number |
    null |
    undefined
) {

  if (
    value ===
      null ||
    value ===
      undefined
  ) {

    return "-";
  }


  return Number(
    value
  ).toLocaleString();
}