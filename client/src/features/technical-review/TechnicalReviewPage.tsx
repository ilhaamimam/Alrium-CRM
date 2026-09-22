import axios from "axios";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  fetchAvailableTeamMembers,
  fetchTechnicalReviewLeads,
  saveTechnicalDecision,
} from "./technicalReview.api";

import type {
  AvailableTeamMember,
  TechnicalReviewLead,
} from "./technicalReview.types";

import "./technicalReview.css";


export default function TechnicalReviewPage() {
  const [
    leads,
    setLeads,
  ] =
    useState<
      TechnicalReviewLead[]
    >([]);


  const [
    members,
    setMembers,
  ] =
    useState<
      AvailableTeamMember[]
    >([]);


  const [
    selectedLead,
    setSelectedLead,
  ] =
    useState<
      TechnicalReviewLead | null
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
      "pending" |
      "approved" |
      "rejected" |
      "all"
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
   * LOAD
   * =========================================================
   */

  const loadData =
    async () => {

      try {

        setError("");


        const [
          leadData,
          memberData,
        ] =
          await Promise.all([
            fetchTechnicalReviewLeads(),
            fetchAvailableTeamMembers(),
          ]);


        setLeads(
          leadData
        );


        setMembers(
          memberData
        );


        if (
          selectedLead
        ) {

          const refreshed =
            leadData.find(
              (lead) =>
                lead.id ===
                selectedLead.id
            );


          if (refreshed) {

            setSelectedLead(
              refreshed
            );
          }
        }

      } catch (error) {

        console.error(
          "TECHNICAL REVIEW LOAD ERROR:",
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
            : "Unable to load Technical Review"
        );

      } finally {

        setLoading(false);

      }
    };


  useEffect(() => {

    void loadData();

  }, []);


  /*
   * =========================================================
   * COUNTS
   * =========================================================
   */

  const pendingCount =
    leads.filter(
      (lead) =>
        lead
          .technical_review
          .decision ===
        "pending"
    ).length;


  const approvedCount =
    leads.filter(
      (lead) =>
        lead
          .technical_review
          .decision ===
        "approved"
    ).length;


  const rejectedCount =
    leads.filter(
      (lead) =>
        lead
          .technical_review
          .decision ===
        "rejected"
    ).length;


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
            .technical_review
            .decision ===
          filter
      );

    }, [
      leads,
      filter,
    ]);


  /*
   * =========================================================
   * SELECT
   * =========================================================
   */

  const selectLead =
    (
      lead:
        TechnicalReviewLead
    ) => {

      setSelectedLead(
        lead
      );


      setNotes(
        lead
          .technical_review
          .review_notes ||
        ""
      );


      setError("");
      setSuccess("");
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
        return;
      }


      if (
        members.length ===
        0
      ) {

        setError(
          "This lead cannot be technically approved because there are no available team members."
        );

        return;
      }


      const confirmed =
        window.confirm(
          "Approve this lead technically? The lead will become HOT and become ready for Production."
        );


      if (!confirmed) {
        return;
      }


      try {

        setSaving(true);

        setError("");

        setSuccess("");


        const response =
          await saveTechnicalDecision(
            selectedLead.id,
            {
              decision:
                "approved",

              notes,
            }
          );


        setSuccess(
          response.message
        );


        await loadData();

      } catch (error) {

        setError(
          axios.isAxiosError(
            error
          )
            ? error.response
                ?.data
                ?.message ||
              error.message
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
        return;
      }


      if (
        !notes.trim()
      ) {

        setError(
          "Please enter a technical rejection reason before rejecting the lead."
        );

        return;
      }


      const confirmed =
        window.confirm(
          "Reject this lead technically? The lead will remain COLD and the Sales Manager will see the reason."
        );


      if (!confirmed) {
        return;
      }


      try {

        setSaving(true);

        setError("");

        setSuccess("");


        const response =
          await saveTechnicalDecision(
            selectedLead.id,
            {
              decision:
                "rejected",

              notes:
                notes.trim(),
            }
          );


        setSuccess(
          response.message
        );


        await loadData();

      } catch (error) {

        setError(
          axios.isAxiosError(
            error
          )
            ? error.response
                ?.data
                ?.message ||
              error.message
            : "Unable to reject lead"
        );

      } finally {

        setSaving(false);

      }
    };


  if (loading) {

    return (
      <div className="page-shell">

        <div className="card">
          Loading Technical Review...
        </div>

      </div>
    );
  }


  return (
    <div className="page-shell">

      {/* HEADER */}

      <div className="page-header">

        <h1 className="page-title">
          Technical Review
        </h1>


        <p className="page-subtitle">
          Assess financially approved
          leads for technical
          feasibility and available
          delivery capacity.
        </p>

      </div>


      {/* SUMMARY */}

      <div className="technical-summary-grid">

        <SummaryCard
          title="Financially Approved"
          value={
            leads.length
          }
        />


        <SummaryCard
          title="Pending Technical Review"
          value={
            pendingCount
          }
        />


        <SummaryCard
          title="Technical Approved"
          value={
            approvedCount
          }
        />


        <SummaryCard
          title="Technical Rejected"
          value={
            rejectedCount
          }
        />


        <SummaryCard
          title="Available Team Members"
          value={
            members.length
          }
          highlight
        />

      </div>


      {/* AVAILABLE MEMBERS */}

      <section className="card technical-team-card">

        <div className="technical-section-heading">

          <div>

            <span className="technical-eyebrow">
              Delivery Capacity
            </span>

            <h2>
              Available Team Members
            </h2>

            <p>
              At least one available
              team member is required
              before a lead can receive
              Technical Approval.
            </p>

          </div>


          <div
            className={
              members.length > 0
                ? "technical-capacity technical-capacity-available"
                : "technical-capacity technical-capacity-none"
            }
          >

            {members.length > 0
              ? `${members.length} Available`
              : "No Capacity"}

          </div>

        </div>


        {members.length ===
        0 ? (

          <div className="technical-no-members">

            No team members are
            currently marked as
            available.

          </div>

        ) : (

          <div className="technical-member-grid">

            {members.map(
              (member) => (

                <div
                  key={
                    member.id
                  }
                  className="technical-member"
                >

                  <div className="technical-member-avatar">

                    {getMemberInitials(
                      member
                    )}

                  </div>


                  <div>

                    <strong>

                      {member.full_name ||
                        member.email}

                    </strong>

                    <span>
                      {member.email}
                    </span>

                  </div>


                  <span className="technical-member-status">
                    Available
                  </span>

                </div>

              )
            )}

          </div>
        )}

      </section>


      {error && (

        <div className="error-message">
          {error}
        </div>

      )}


      {success && (

        <div className="success-message">
          {success}
        </div>

      )}


      {/* FILTERS */}

      <div className="technical-toolbar">

        {(
          [
            "pending",
            "approved",
            "rejected",
            "all",
          ] as const
        ).map(
          (item) => (

            <button
              key={
                item
              }
              type="button"
              className={
                filter ===
                item
                  ? "technical-filter-active"
                  : "btn-secondary"
              }
              onClick={() =>
                setFilter(
                  item
                )
              }
            >

              {formatWord(
                item
              )}

            </button>

          )
        )}

      </div>


      <div className="technical-layout">

        {/* LEADS */}

        <section className="card">

          <h2 className="card-title">
            Technical Review Queue
          </h2>


          {filteredLeads.length ===
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
                      Sales Tag
                    </th>

                    <th>
                      Technical Status
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
                            ? "technical-selected-row"
                            : ""
                        }
                      >

                        <td>

                          <strong>

                            {getLeadTitle(
                              lead
                            )}

                          </strong>

                        </td>


                        <td>

                          {lead
                            .companies
                            ?.name ||
                            "-"}

                        </td>


                        <td>

                          <LeadBadge
                            status={
                              lead.status
                            }
                          />

                        </td>


                        <td>

                          <TechnicalBadge
                            decision={
                              lead
                                .technical_review
                                .decision
                            }
                          />

                        </td>


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
                            Review
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


        {/* DETAILS */}

        <section className="card technical-details">

          {!selectedLead ? (

            <div className="technical-select-empty">

              <div className="technical-select-icon">
                TR
              </div>

              <h2>
                Select a Lead
              </h2>

              <p>
                Select a financially
                approved lead to assess
                technical feasibility.
              </p>

            </div>

          ) : (

            <>

              <div className="technical-detail-header">

                <div>

                  <span className="technical-eyebrow">
                    Technical Assessment
                  </span>

                  <h2>

                    {getLeadTitle(
                      selectedLead
                    )}

                  </h2>

                </div>


                <TechnicalBadge
                  decision={
                    selectedLead
                      .technical_review
                      .decision
                  }
                />

              </div>


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


                <div className="detail-item">

                  <span className="detail-label">
                    Sales Tag
                  </span>

                  <div className="detail-value">

                    <LeadBadge
                      status={
                        selectedLead
                          .status
                      }
                    />

                  </div>

                </div>


                <Detail
                  label="Available Members"
                  value={
                    String(
                      members.length
                    )
                  }
                />

              </div>


              <div className="technical-description">

                <span className="detail-label">
                  Lead Description
                </span>

                <p>

                  {selectedLead
                    .description ||
                    "No description provided."}

                </p>

              </div>


              <div className="form-group technical-notes">

                <label
                  htmlFor="technical-notes"
                >
                  Technical Review Notes
                </label>


                <textarea
                  id="technical-notes"
                  value={
                    notes
                  }
                  onChange={(event) =>
                    setNotes(
                      event.target.value
                    )
                  }
                  placeholder="Record feasibility, architecture, complexity, resource requirements, risks, or rejection reason..."
                  disabled={
                    saving
                  }
                />

              </div>


              {members.length ===
                0 && (

                <div className="technical-capacity-warning">

                  Technical approval
                  is disabled because
                  no team members are
                  currently available.

                </div>
              )}


              <div className="technical-actions">

                <button
                  type="button"
                  className="technical-approve"
                  onClick={
                    approveLead
                  }
                  disabled={
                    saving ||
                    members.length ===
                      0
                  }
                >

                  {saving
                    ? "Saving..."
                    : "Approve → HOT / Production"}

                </button>


                <button
                  type="button"
                  className="technical-reject"
                  onClick={
                    rejectLead
                  }
                  disabled={
                    saving
                  }
                >

                  Reject → COLD

                </button>

              </div>

            </>

          )}

        </section>

      </div>

    </div>
  );
}


function SummaryCard({
  title,
  value,
  highlight = false,
}: {
  title: string;

  value: number;

  highlight?: boolean;
}) {

  return (
    <div
      className={
        highlight
          ? "technical-summary-card technical-summary-highlight"
          : "technical-summary-card"
      }
    >

      <span>
        {title}
      </span>

      <strong>
        {value}
      </strong>

    </div>
  );
}


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


function TechnicalBadge({
  decision,
}: {
  decision: string;
}) {

  return (
    <span
      className={
        `technical-status technical-status-${decision}`
      }
    >
      {formatWord(
        decision
      )}
    </span>
  );
}


function LeadBadge({
  status,
}: {
  status?: string;
}) {

  const normalized =
    status
      ?.toLowerCase() ||
    "unknown";


  return (
    <span
      className={
        `technical-lead-tag technical-lead-tag-${normalized}`
      }
    >

      {formatWord(
        status ||
        "unknown"
      )}

    </span>
  );
}


function getLeadTitle(
  lead:
    TechnicalReviewLead
) {

  return (
    lead.title ||
    lead.name ||
    "Untitled Lead"
  );
}


function getContactName(
  lead:
    TechnicalReviewLead
) {

  if (
    !lead.contacts
  ) {

    return "-";
  }


  return [
    lead.contacts
      .first_name,

    lead.contacts
      .last_name,
  ]
    .filter(Boolean)
    .join(" ") ||
    lead.contacts.email ||
    "-";
}


function getMemberInitials(
  member:
    AvailableTeamMember
) {

  const source =
    member.full_name ||
    member.email;


  return source
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(
      (word) =>
        word
          .charAt(0)
          .toUpperCase()
    )
    .join("");
}


function formatWord(
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