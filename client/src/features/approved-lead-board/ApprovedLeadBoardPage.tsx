import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  fetchProductionReadyLeads,
  type PipelineLead,
} from "../../api/pipeline.api";

import "./approvedLeadBoard.css";


export default function ApprovedLeadBoardPage() {
  /*
   * =========================================================
   * STATE
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
   * LOAD PRODUCTION-READY LEADS
   *
   * This endpoint only returns:
   *
   * Finance approved
   * +
   * Technical approved
   * +
   * HOT
   * =========================================================
   */

  const loadLeads =
    useCallback(
      async () => {
        try {

          setLoading(true);

          setError("");


          const data =
            await fetchProductionReadyLeads();


          console.log(
            "LEAD BOARD PRODUCTION READY:",
            data
          );


          setLeads(
            data
          );

        } catch (error) {

          console.error(
            "LOAD LEAD BOARD ERROR:",
            error
          );


          setError(
            "Unable to load production-ready leads"
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

        <div className="card">

          <div className="empty-state">
            Loading Lead Board...
          </div>

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

      {/* HEADER */}

      <div className="page-header">

        <h1 className="page-title">
          Approved Lead Board
        </h1>


        <p className="page-subtitle">
          Production-ready leads that
          passed both Financial and
          Technical Review.
        </p>

      </div>


      {/* ERROR */}

      {error && (

        <div className="error-message">
          {error}
        </div>

      )}


      {/* SUMMARY */}

      <div className="approved-board-summary">

        <div className="approved-board-summary-card">

          <span>
            Production Ready
          </span>

          <strong>
            {leads.length}
          </strong>

        </div>


        <div className="approved-board-summary-card">

          <span>
            Finance Approved
          </span>

          <strong>
            {
              leads.filter(
                (lead) =>
                  lead.financial_decision ===
                  "approved"
              ).length
            }
          </strong>

        </div>


        <div className="approved-board-summary-card">

          <span>
            Technical Approved
          </span>

          <strong>
            {
              leads.filter(
                (lead) =>
                  lead.technical_decision ===
                  "approved"
              ).length
            }
          </strong>

        </div>


        <div className="approved-board-summary-card">

          <span>
            HOT Leads
          </span>

          <strong>
            {
              leads.filter(
                (lead) =>
                  lead.status ===
                  "hot"
              ).length
            }
          </strong>

        </div>

      </div>


      {/* BOARD */}

      <div className="card">

        <div className="approved-board-header">

          <div>

            <h2 className="card-title">
              Production Ready Leads
            </h2>


            <p>
              These leads are ready
              for team allocation and
              project delivery.
            </p>

          </div>


          <button
            type="button"
            className="btn-secondary"
            onClick={
              loadLeads
            }
          >
            Refresh
          </button>

        </div>


        {leads.length ===
        0 ? (

          <div className="empty-state">

            <h3>
              No production-ready leads
            </h3>


            <p>
              A lead will appear here
              after Financial Review
              approves it and Technical
              Review approves it.
            </p>

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
                    Sales Tag
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
                    Action
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

                      {/* LEAD */}

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


                      {/* HOT */}

                      <td>

                        <span className="approved-board-hot">
                          HOT
                        </span>

                      </td>


                      {/* FINANCE */}

                      <td>

                        <span className="approved-board-approved">
                          Approved
                        </span>

                      </td>


                      {/* TECHNICAL */}

                      <td>

                        <span className="approved-board-approved">
                          Approved
                        </span>

                      </td>


                      {/* PIPELINE */}

                      <td>

                        <span className="approved-board-stage">

                          {formatStage(
                            lead.pipeline_stage
                          )}

                        </span>

                      </td>


                      {/* ACTION */}

                      <td>

                        <div className="approved-board-actions">

                          <Link
                            to={
                              `/leads/${lead.id}`
                            }
                            className="btn btn-secondary"
                          >
                            View
                          </Link>


                          <Link
                            to="/team-allocation"
                            className="btn"
                          >
                            Allocate Team
                          </Link>

                        </div>

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


/*
 * =========================================================
 * LEAD TITLE
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


/*
 * =========================================================
 * PIPELINE STAGE
 * =========================================================
 */

function formatStage(
  value:
    string |
    undefined
) {

  if (!value) {

    return "Production Ready";
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