import axios from "axios";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  fetchFinancialReviewLeads,
  saveFinancialReviewDecision,
} from "./financialReview.api";

import type {
  FinancialReviewLead,
} from "./financialReview.types";

import "./financialReview.css";


export default function FinancialReviewPage() {
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
      FinancialReviewLead[]
    >([]);


  const [
    selectedLead,
    setSelectedLead,
  ] =
    useState<
      FinancialReviewLead | null
    >(null);


  const [
    notes,
    setNotes,
  ] =
    useState("");


  const [
    filter,
    setFilter,
  ] =
    useState<
      "all" |
      "pending" |
      "approved"
    >("pending");


  const [
    loading,
    setLoading,
  ] =
    useState(true);


  const [
    saving,
    setSaving,
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
   * LOAD FINANCIAL REVIEW LEADS
   * =========================================================
   */

  const loadLeads =
    async () => {

      try {

        setError("");


        const data =
          await fetchFinancialReviewLeads();


        console.log(
          "FINANCIAL REVIEW LEADS:",
          data
        );


        setLeads(
          data
        );

      } catch (error) {

        console.error(
          "FINANCIAL REVIEW LOAD ERROR:",
          error
        );


        setError(
          axios.isAxiosError(
            error
          )
            ? error.response
                ?.data
                ?.message ||
              error.message
            : error instanceof Error
              ? error.message
              : "Unable to load Financial Review leads"
        );

      } finally {

        setLoading(false);

      }
    };


  useEffect(() => {

    void loadLeads();

  }, []);


  /*
   * =========================================================
   * FILTER
   * =========================================================
   */

  const filteredLeads =
    useMemo(() => {

      if (
        filter ===
        "all"
      ) {

        return leads;
      }


      return leads.filter(
        (lead) =>
          lead
            .financial_review
            .decision ===
          filter
      );

    }, [
      leads,
      filter,
    ]);


  /*
   * =========================================================
   * COUNTS
   * =========================================================
   */

  const pendingCount =
    leads.filter(
      (lead) =>
        lead
          .financial_review
          .decision ===
        "pending"
    ).length;


  const approvedCount =
    leads.filter(
      (lead) =>
        lead
          .financial_review
          .decision ===
        "approved"
    ).length;


  const rejectedCount =
    leads.filter(
      (lead) =>
        lead
          .financial_review
          .decision ===
        "rejected"
    ).length;


  /*
   * =========================================================
   * SELECT LEAD
   * =========================================================
   */

  const selectLead =
    (
      lead:
        FinancialReviewLead
    ) => {

      setSelectedLead(
        lead
      );


      setNotes(
        lead
          .financial_review
          .review_notes ||
        ""
      );


      setError("");
      setSuccess("");
    };


  /*
   * =========================================================
   * GET ACTUAL LEAD ID
   *
   * IMPORTANT:
   *
   * financial_review.lead_id points to:
   *
   * public.leads.id
   *
   * This prevents accidentally sending the
   * financial review record ID.
   * =========================================================
   */

  const getActualLeadId =
    (
      lead:
        FinancialReviewLead
    ) => {

      return (
        lead
          .financial_review
          ?.lead_id ||
        lead.id
      );
    };


  /*
   * =========================================================
   * APPROVE
   * =========================================================
   */

  const approveLead =
    async () => {

      if (
        !selectedLead
      ) {

        setError(
          "Please select a lead first."
        );

        return;
      }


      const actualLeadId =
        getActualLeadId(
          selectedLead
        );


      console.log(
        "APPROVING FINANCIAL LEAD:",
        {
          displayedId:
            selectedLead.id,

          financialLeadId:
            selectedLead
              .financial_review
              ?.lead_id,

          actualLeadId,
        }
      );


      if (!actualLeadId) {

        setError(
          "Unable to approve because the Lead ID is missing."
        );

        return;
      }


      try {

        setSaving(true);

        setError("");

        setSuccess("");


        const response =
          await saveFinancialReviewDecision(
            actualLeadId,
            {
              decision:
                "approved",

              notes:
                notes.trim(),
            }
          );


        /*
         * -----------------------------------------
         * IMPORTANT
         *
         * We do NOT navigate the Finance user
         * to Technical Review.
         *
         * Technical Review belongs to the
         * technical_officer.
         *
         * We move the LEAD into the Technical
         * Review queue by setting:
         *
         * financial_reviews.decision = approved
         * -----------------------------------------
         */

        setSuccess(
          response.message ||
          "Lead approved successfully and moved to the Technical Review queue."
        );


        /*
         * Clear selected lead.
         */

        setSelectedLead(
          null
        );


        setNotes("");


        /*
         * Return to Pending filter.
         *
         * The approved lead should disappear
         * from Pending immediately.
         */

        setFilter(
          "pending"
        );


        /*
         * Reload database values.
         *
         * Expected:
         *
         * Pending  1 → 0
         * Approved 0 → 1
         */

        await loadLeads();


      } catch (error) {

        console.error(
          "FINANCIAL APPROVAL ERROR:",
          error
        );


        setError(
          axios.isAxiosError(
            error
          )
            ? error.response
                ?.data
                ?.message ||
              error.message
            : error instanceof Error
              ? error.message
              : "Unable to approve lead"
        );


      } finally {

        setSaving(false);

      }
    };


  /*
   * =========================================================
   * REJECT
   * =========================================================
   */

  const rejectLead =
    async () => {

      if (
        !selectedLead
      ) {

        setError(
          "Please select a lead first."
        );

        return;
      }


      /*
       * Require rejection reason.
       */

      if (
        !notes.trim()
      ) {

        setError(
          "Please enter a reason before rejecting this lead."
        );

        return;
      }


      const actualLeadId =
        getActualLeadId(
          selectedLead
        );


      if (!actualLeadId) {

        setError(
          "Unable to reject because the Lead ID is missing."
        );

        return;
      }


      const confirmed =
        window.confirm(
          "Reject this lead and move it to the Financial Archive?"
        );


      if (!confirmed) {

        return;
      }


      try {

        setSaving(true);

        setError("");

        setSuccess("");


        const response =
          await saveFinancialReviewDecision(
            actualLeadId,
            {
              decision:
                "rejected",

              notes:
                notes.trim(),
            }
          );


        /*
         * Do not navigate away.
         *
         * Keep Finance on the current page
         * and immediately update the counts.
         */

        setSuccess(
          response.message ||
          "Lead rejected and moved to the Financial Archive."
        );


        setSelectedLead(
          null
        );


        setNotes("");


        setFilter(
          "pending"
        );


        /*
         * Expected:
         *
         * Pending  1 → 0
         * Rejected 0 → 1
         */

        await loadLeads();


      } catch (error) {

        console.error(
          "FINANCIAL REJECTION ERROR:",
          error
        );


        setError(
          axios.isAxiosError(
            error
          )
            ? error.response
                ?.data
                ?.message ||
              error.message
            : error instanceof Error
              ? error.message
              : "Unable to reject lead"
        );


      } finally {

        setSaving(false);

      }
    };


  /*
   * =========================================================
   * LOADING
   * =========================================================
   */

  if (loading) {

    return (
      <div className="page-shell">

        <div className="card">
          Loading financial review...
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
          Financial Review
        </h1>


        <p className="page-subtitle">
          Review the financial
          feasibility of created leads,
          approve suitable leads for
          technical assessment, or
          archive rejected leads.
        </p>

      </div>


      {/* =====================================================
          SUMMARY
      ====================================================== */}

      <div className="financial-summary-grid">

        <SummaryCard
          label="Total Leads"
          value={
            leads.length
          }
        />


        <SummaryCard
          label="Pending Review"
          value={
            pendingCount
          }
          accent
        />


        <SummaryCard
          label="Approved"
          value={
            approvedCount
          }
        />


        <SummaryCard
          label="Rejected"
          value={
            rejectedCount
          }
        />

      </div>


      {/* =====================================================
          ERROR
      ====================================================== */}

      {error && (

        <div className="error-message">
          {error}
        </div>

      )}


      {/* =====================================================
          SUCCESS
      ====================================================== */}

      {success && (

        <div className="success-message">
          {success}
        </div>

      )}


      {/* =====================================================
          FILTER TOOLBAR
      ====================================================== */}

      <div className="financial-toolbar">

        <div className="financial-filter-buttons">

          {/* PENDING */}

          <button
            type="button"
            className={
              filter ===
              "pending"
                ? "financial-filter-active"
                : "btn-secondary"
            }
            onClick={() => {

              setFilter(
                "pending"
              );

              setSelectedLead(
                null
              );

              setNotes("");

            }}
          >

            Pending ({pendingCount})

          </button>


          {/* APPROVED */}

          <button
            type="button"
            className={
              filter ===
              "approved"
                ? "financial-filter-active"
                : "btn-secondary"
            }
            onClick={() => {

              setFilter(
                "approved"
              );

              setSelectedLead(
                null
              );

              setNotes("");

            }}
          >

            Approved ({approvedCount})

          </button>


          {/* ALL */}

          <button
            type="button"
            className={
              filter ===
              "all"
                ? "financial-filter-active"
                : "btn-secondary"
            }
            onClick={() => {

              setFilter(
                "all"
              );

              setSelectedLead(
                null
              );

              setNotes("");

            }}
          >

            All Leads ({leads.length})

          </button>

        </div>


        {/* ARCHIVE */}

        <Link
          to="/financial-review/archive"
          className="btn btn-secondary"
        >

          Rejected Archive ({rejectedCount})

        </Link>

      </div>


      {/* =====================================================
          MAIN
      ====================================================== */}

      <div className="financial-review-layout">

        {/* ===================================================
            LEAD TABLE
        ==================================================== */}

        <section className="card financial-table-card">

          <h2 className="card-title">
            Lead Review Queue
          </h2>


          {filteredLeads.length ===
          0 ? (

            <div className="empty-state">

              {filter ===
                "pending"
                ? "No leads are waiting for Financial Review."
                : filter ===
                    "approved"
                  ? "No financially approved leads yet."
                  : "No leads found."}

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
                      Contact
                    </th>

                    <th>
                      Lead Status
                    </th>

                    <th>
                      Financial
                    </th>

                    <th>
                      Action
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {filteredLeads.map(
                    (lead) => (

                      <tr
                        key={
                          lead.id
                        }
                        className={
                          selectedLead
                            ?.id ===
                          lead.id
                            ? "financial-row-selected"
                            : ""
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

                          {lead
                            .companies
                            ?.name ||
                            "-"}

                        </td>


                        {/* CONTACT */}

                        <td>

                          {getContactName(
                            lead
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


                        {/* FINANCIAL STATUS */}

                        <td>

                          <ReviewBadge
                            decision={
                              lead
                                .financial_review
                                .decision
                            }
                          />

                        </td>


                        {/* REVIEW */}

                        <td>

                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={() =>
                              selectLead(
                                lead
                              )
                            }
                          >

                            {lead
                              .financial_review
                              .decision ===
                            "pending"
                              ? "Review"
                              : "View"}

                          </button>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>
          )}

        </section>


        {/* ===================================================
            DETAILS
        ==================================================== */}

        <section className="card financial-details-card">

          {!selectedLead ? (

            <div className="financial-select-empty">

              <div className="financial-select-icon">
                $
              </div>


              <h2>
                Select a Lead
              </h2>


              <p>
                Choose a lead from the
                table to review its
                financial information.
              </p>

            </div>

          ) : (

            <>

              {/* HEADER */}

              <div className="financial-detail-header">

                <div>

                  <span className="financial-eyebrow">
                    Financial Assessment
                  </span>


                  <h2>

                    {getLeadTitle(
                      selectedLead
                    )}

                  </h2>

                </div>


                <ReviewBadge
                  decision={
                    selectedLead
                      .financial_review
                      .decision
                  }
                />

              </div>


              {/* DETAILS GRID */}

              <div className="details-grid">

                <Detail
                  label="Company"
                  value={
                    selectedLead
                      .companies
                      ?.name ||
                    "No company"
                  }
                />


                <Detail
                  label="Contact"
                  value={
                    getContactName(
                      selectedLead
                    )
                  }
                />


                {/* LEAD STATUS */}

                <div className="detail-item">

                  <span className="detail-label">
                    Lead Status
                  </span>


                  <div className="detail-value">

                    <LeadTemperatureBadge
                      status={
                        selectedLead
                          .status
                      }
                    />

                  </div>

                </div>


                <Detail
                  label="Estimated Budget"
                  value={
                    getLeadValue(
                      selectedLead
                    )
                  }
                />

              </div>


              {/* DESCRIPTION */}

              <div className="financial-description">

                <span className="detail-label">
                  Description
                </span>


                <p>

                  {selectedLead
                    .description ||
                    "No description provided."}

                </p>

              </div>


              {/* FINANCIAL NOTES */}

              <div className="form-group financial-notes">

                <label
                  htmlFor="financial-notes"
                >
                  Financial Review Notes
                </label>


                <textarea
                  id="financial-notes"
                  value={
                    notes
                  }
                  onChange={(event) =>
                    setNotes(
                      event.target.value
                    )
                  }
                  placeholder="Add budget concerns, financial feasibility notes or reasons for the decision..."
                  disabled={
                    saving ||
                    selectedLead
                      .financial_review
                      .decision !==
                      "pending"
                  }
                />

              </div>


              {/* =================================================
                  PENDING ACTIONS
              ================================================== */}

              {selectedLead
                .financial_review
                .decision ===
              "pending" ? (

                <div className="financial-action-row">

                  {/* APPROVE */}

                  <button
                    type="button"
                    className="financial-approve-button"
                    disabled={
                      saving
                    }
                    onClick={
                      approveLead
                    }
                  >

                    {saving
                      ? "Saving..."
                      : "Approve for Technical Review"}

                  </button>


                  {/* REJECT */}

                  <button
                    type="button"
                    className="financial-reject-button"
                    disabled={
                      saving
                    }
                    onClick={
                      rejectLead
                    }
                  >

                    {saving
                      ? "Saving..."
                      : "Reject & Archive"}

                  </button>

                </div>

              ) : (

                /*
                 * Already reviewed.
                 */

                <div className="financial-review-completed">

                  <strong>
                    Financial Review Completed
                  </strong>


                  <p>

                    This lead has already
                    been{" "}

                    <strong>

                      {selectedLead
                        .financial_review
                        .decision}

                    </strong>.

                  </p>


                  {selectedLead
                    .financial_review
                    .decision ===
                    "approved" && (

                    <p>
                      It is now available
                      in the Technical
                      Review queue for the
                      Technical Officer.
                    </p>

                  )}


                  {selectedLead
                    .financial_review
                    .decision ===
                    "rejected" && (

                    <p>
                      It is available in
                      the Financial
                      Rejected Archive.
                    </p>

                  )}

                </div>

              )}

            </>

          )}

        </section>

      </div>

    </div>
  );
}


/*
 * =========================================================
 * SUMMARY CARD
 * =========================================================
 */

function SummaryCard({
  label,
  value,
  accent = false,
}: {
  label: string;

  value: number;

  accent?: boolean;
}) {

  return (
    <div
      className={
        accent
          ? "financial-summary-card financial-summary-accent"
          : "financial-summary-card"
      }
    >

      <span>
        {label}
      </span>


      <strong>
        {value}
      </strong>

    </div>
  );
}


/*
 * =========================================================
 * HOT / COLD LEAD TAG
 * =========================================================
 */

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

      {normalized ===
        "cold"
        ? "Cold"
        : normalized ===
            "hot"
          ? "Hot"
          : status ||
            "Not Set"}

    </span>
  );
}


/*
 * =========================================================
 * DETAIL
 * =========================================================
 */

function Detail({
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
 * FINANCIAL REVIEW BADGE
 * =========================================================
 */

function ReviewBadge({
  decision,
}: {
  decision: string;
}) {

  return (
    <span
      className={
        `financial-status financial-status-${decision}`
      }
    >

      {formatDecision(
        decision
      )}

    </span>
  );
}


/*
 * =========================================================
 * LEAD TITLE
 * =========================================================
 */

function getLeadTitle(
  lead:
    FinancialReviewLead
) {

  return (
    lead.title ||
    lead.name ||
    "Untitled Lead"
  );
}


/*
 * =========================================================
 * CONTACT NAME
 * =========================================================
 */

function getContactName(
  lead:
    FinancialReviewLead
) {

  const contact =
    lead.contacts;


  if (!contact) {

    return "-";
  }


  const fullName =
    [
      contact.first_name,
      contact.last_name,
    ]
      .filter(Boolean)
      .join(" ");


  return (
    fullName ||
    contact.email ||
    "-"
  );
}


/*
 * =========================================================
 * LEAD VALUE
 * =========================================================
 */

function getLeadValue(
  lead:
    FinancialReviewLead
) {

  /*
   * FinancialReviewLead may not currently declare
   * every budget field used by older/newer API responses.
   *
   * Cast only for reading these optional fields so the
   * rest of the page keeps its existing strong type.
   */
  const budgetLead =
    lead as FinancialReviewLead & {
      estimated_budget?:
        number | string | null;

      estimatedBudget?:
        number | string | null;

      estimated_value?:
        number | string | null;

      estimatedValue?:
        number | string | null;

      value?:
        number | string | null;

      budget?:
        number | string | null;
    };


  const amount =
    budgetLead
      .estimated_budget ??
    budgetLead
      .estimatedBudget ??
    budgetLead
      .estimated_value ??
    budgetLead
      .estimatedValue ??
    budgetLead
      .value ??
    budgetLead
      .budget;


  if (
    amount ===
      undefined ||
    amount ===
      null ||
    amount ===
      ""
  ) {

    return "Not specified";
  }


  const numericAmount =
    Number(amount);


  if (
    Number.isNaN(
      numericAmount
    )
  ) {

    return String(
      amount
    );
  }


  return numericAmount
    .toLocaleString();
}


/*
 * =========================================================
 * FORMAT FINANCIAL DECISION
 * =========================================================
 */

function formatDecision(
  value: string
) {

  return value
    .replace(
      /_/g,
      " "
    )
    .replace(
      /\b\w/g,
      (character) =>
        character
          .toUpperCase()
    );
}