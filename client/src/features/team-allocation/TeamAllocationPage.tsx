import axios from "axios";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  prepareProjectAllocation,
} from "./teamAllocation.api";

import type {
  AssignTeamInput,
} from "./teamAllocation.types";

import {
  fetchPipelineTeamMembers,
  fetchPipelineTeams,
  fetchProductionReadyLeads,
  type PipelineLead,
  type PipelineTeam,
  type PipelineTeamMember,
} from "../../api/pipeline.api";

import "./teamAllocation.css";


export default function TeamAllocationPage() {
  /*
   * =========================================================
   * PRODUCTION READY LEADS
   * =========================================================
   */

  const [
    leads,
    setLeads,
  ] =
    useState<
      PipelineLead[]
    >([]);


  /*
   * =========================================================
   * TEAMS
   * =========================================================
   */

  const [
    teams,
    setTeams,
  ] =
    useState<
      PipelineTeam[]
    >([]);


  /*
   * =========================================================
   * TEAM MEMBERS
   * =========================================================
   */

  const [
    members,
    setMembers,
  ] =
    useState<
      PipelineTeamMember[]
    >([]);


  /*
   * =========================================================
   * SELECTIONS
   * =========================================================
   */

  const [
    selectedLeadId,
    setSelectedLeadId,
  ] =
    useState("");


  const [
    selectedTeamId,
    setSelectedTeamId,
  ] =
    useState("");


  const [
    selectedMemberIds,
    setSelectedMemberIds,
  ] =
    useState<string[]>([]);


  /*
   * =========================================================
   * PROJECT TIMELINE
   * =========================================================
   */

  const [
    startDate,
    setStartDate,
  ] =
    useState("");


  const [
    endDate,
    setEndDate,
  ] =
    useState("");


  /*
   * =========================================================
   * PAGE STATE
   * =========================================================
   */

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
   * LOAD CONNECTED DATA
   *
   * Technical approved / HOT leads
   * +
   * Teams
   * +
   * Team Members
   * =========================================================
   */

  const loadAllocationData =
    useCallback(
      async () => {

        try {

          setLoading(true);

          setError("");


          const [
            leadData,
            teamData,
            memberData,
          ] =
            await Promise.all([
              fetchProductionReadyLeads(),
              fetchPipelineTeams(),
              fetchPipelineTeamMembers(),
            ]);


          console.log(
            "TEAM ALLOCATION LEADS:",
            leadData
          );


          console.log(
            "TEAM ALLOCATION TEAMS:",
            teamData
          );


          console.log(
            "TEAM ALLOCATION MEMBERS:",
            memberData
          );


          setLeads(
            leadData
          );


          setTeams(
            teamData
          );


          setMembers(
            memberData
          );

        } catch (error) {

          console.error(
            "TEAM ALLOCATION LOAD ERROR:",
            error
          );


          if (
            axios.isAxiosError(
              error
            )
          ) {

            setError(
              error.response
                ?.data
                ?.message ||
              "Unable to load Team Allocation data"
            );

          } else {

            setError(
              "Unable to load Team Allocation data"
            );

          }

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

    void loadAllocationData();

  }, [
    loadAllocationData,
  ]);


  /*
   * =========================================================
   * SELECTED LEAD
   * =========================================================
   */

  const selectedLead =
    useMemo(
      () =>
        leads.find(
          (lead) =>
            lead.id ===
            selectedLeadId
        ) ??
        null,
      [
        leads,
        selectedLeadId,
      ]
    );


  /*
   * =========================================================
   * SELECTED TEAM
   * =========================================================
   */

  const selectedTeam =
    useMemo(
      () =>
        teams.find(
          (team) =>
            team.id ===
            selectedTeamId
        ) ??
        null,
      [
        teams,
        selectedTeamId,
      ]
    );


  /*
   * =========================================================
   * AVAILABLE MEMBERS
   * =========================================================
   */

  const availableMembers =
    useMemo(
      () =>
        members.filter(
          (member) =>
            member
              .availability_status ===
            "available"
        ),
      [
        members,
      ]
    );


  /*
   * =========================================================
   * SELECT / UNSELECT MEMBER
   * =========================================================
   */

  const toggleMember =
    (
      memberId: string
    ) => {

      setSelectedMemberIds(
        (
          current
        ) => {

          if (
            current.includes(
              memberId
            )
          ) {

            return current.filter(
              (id) =>
                id !==
                memberId
            );
          }


          return [
            ...current,
            memberId,
          ];
        }
      );


      setSuccess("");
    };


  /*
   * =========================================================
   * PREPARE + SAVE ALLOCATION
   *
   * FLOW:
   *
   * selected HOT lead
   *      ↓
   * selected team
   *      ↓
   * selected members added to team
   *      ↓
   * team assigned to project
   *      ↓
   * backend can create completion review
   * =========================================================
   */

  const handleAllocation =
    async () => {

      setError("");

      setSuccess("");


      /*
       * -----------------------------------------------------
       * VALIDATE LEAD
       * -----------------------------------------------------
       */

      if (
        !selectedLeadId
      ) {

        setError(
          "Please select a production-ready lead."
        );

        return;
      }


      /*
       * -----------------------------------------------------
       * VALIDATE TEAM
       * -----------------------------------------------------
       */

      if (
        !selectedTeamId
      ) {

        setError(
          "Please select a team."
        );

        return;
      }


      /*
       * -----------------------------------------------------
       * VALIDATE MEMBERS
       * -----------------------------------------------------
       */

      if (
        selectedMemberIds.length ===
        0
      ) {

        setError(
          "Please select at least one team member."
        );

        return;
      }


      /*
       * -----------------------------------------------------
       * VALIDATE START DATE
       * -----------------------------------------------------
       */

      if (
        !startDate
      ) {

        setError(
          "Please select a project start date."
        );

        return;
      }


      /*
       * -----------------------------------------------------
       * VALIDATE END DATE
       * -----------------------------------------------------
       */

      if (
        !endDate
      ) {

        setError(
          "Please select a project end date."
        );

        return;
      }


      /*
       * -----------------------------------------------------
       * VALIDATE DATE ORDER
       * -----------------------------------------------------
       */

      if (
        new Date(
          endDate
        ).getTime() <
        new Date(
          startDate
        ).getTime()
      ) {

        setError(
          "End date cannot be before start date."
        );

        return;
      }


      /*
       * =====================================================
       * SAVE
       * =====================================================
       */

      try {

        setSaving(true);


        /*
         * ---------------------------------------------------
         * This payload goes to your existing:
         *
         * POST
         * /team-allocation/projects/:projectId
         *
         * Extra date information is included so the backend
         * can store it when supported.
         * ---------------------------------------------------
         */

        const assignmentPayload =
  {
    teamId:
      selectedTeamId,

    plannedStartDate:
      startDate || null,

    plannedEndDate:
      endDate || null,
  } as AssignTeamInput;


        console.log(
          "PREPARING TEAM ALLOCATION:",
          {
            leadId:
              selectedLeadId,

            teamId:
              selectedTeamId,

            memberIds:
              selectedMemberIds,

            startDate,

            endDate,
          }
        );


        /*
         * ---------------------------------------------------
         * 1. Add selected members to selected team
         *
         * 2. Assign selected team to project
         * ---------------------------------------------------
         */

        const result =
          await prepareProjectAllocation(
            selectedLeadId,
            selectedTeamId,
            selectedMemberIds,
            assignmentPayload
          );


        console.log(
          "TEAM ALLOCATION SAVED:",
          result
        );


        /*
         * ---------------------------------------------------
         * SUCCESS
         * ---------------------------------------------------
         */

        setSuccess(
          "Team allocated successfully. The project is now assigned to the selected delivery team."
        );


        /*
         * ---------------------------------------------------
         * RESET FORM
         * ---------------------------------------------------
         */

        setSelectedLeadId("");

        setSelectedTeamId("");

        setSelectedMemberIds([]);

        setStartDate("");

        setEndDate("");


        /*
         * ---------------------------------------------------
         * REFRESH CONNECTED DATA
         * ---------------------------------------------------
         */

        await loadAllocationData();

      } catch (error) {

        console.error(
          "PREPARE ALLOCATION ERROR:",
          error
        );


        if (
          axios.isAxiosError(
            error
          )
        ) {

          setError(
            error.response
              ?.data
              ?.message ||
            error.message ||
            "Unable to allocate team"
          );

        } else if (
          error instanceof Error
        ) {

          setError(
            error.message
          );

        } else {

          setError(
            "Unable to allocate team"
          );

        }

      } finally {

        setSaving(false);

      }
    };


  /*
   * =========================================================
   * LOADING
   * =========================================================
   */

  if (
    loading
  ) {

    return (
      <div className="page-shell">

        <div className="card">

          <div className="empty-state">
            Loading Team Allocation...
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

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="page-header">

        <h1 className="page-title">
          Team Allocation
        </h1>


        <p className="page-subtitle">
          Allocate production-ready
          HOT leads to delivery teams,
          select available team members
          and define the project
          timeline.
        </p>

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
          SUMMARY
      ====================================================== */}

      <div className="allocation-summary-grid">

        <SummaryCard
          title="Production Ready"
          value={
            leads.length
          }
        />


        <SummaryCard
          title="Teams"
          value={
            teams.length
          }
        />


        <SummaryCard
          title="Team Members"
          value={
            members.length
          }
        />


        <SummaryCard
          title="Available Members"
          value={
            availableMembers.length
          }
          accent
        />

      </div>


      {/* =====================================================
          MAIN ALLOCATION AREA
      ====================================================== */}

      <div className="allocation-layout">

        {/* ===================================================
            CREATE ALLOCATION
        ==================================================== */}

        <section className="card allocation-form-card">

          <h2 className="card-title">
            Create Allocation
          </h2>


          {/* =================================================
              PRODUCTION READY LEAD
          ================================================== */}

          <div className="form-group">

            <label
              htmlFor="allocation-lead"
            >
              Production Ready Lead
            </label>


            <select
              id="allocation-lead"
              value={
                selectedLeadId
              }
              disabled={
                saving
              }
              onChange={(
                event
              ) => {

                setSelectedLeadId(
                  event.target.value
                );


                setSuccess("");

                setError("");

              }}
            >

              <option value="">
                Select approved lead
              </option>


              {leads.map(
                (lead) => (

                  <option
                    key={
                      lead.id
                    }
                    value={
                      lead.id
                    }
                  >

                    {getLeadTitle(
                      lead
                    )}

                    {" — "}

                    {lead.company_name ||
                      "No Company"}

                  </option>

                )
              )}

            </select>


            {leads.length ===
              0 && (

              <p className="allocation-warning-text">

                No technically approved
                HOT leads are currently
                ready for allocation.

              </p>

            )}

          </div>


          {/* =================================================
              SELECTED LEAD DETAILS
          ================================================== */}

          {selectedLead && (

            <div className="allocation-selected-lead">

              <div>

                <span className="allocation-small-label">
                  Selected Lead
                </span>


                <strong>

                  {getLeadTitle(
                    selectedLead
                  )}

                </strong>

              </div>


              <div className="allocation-lead-meta">

                <span>

                  Company:{" "}

                  <strong>

                    {selectedLead
                      .company_name ||
                      "-"}

                  </strong>

                </span>


                <span>

                  Status:{" "}

                  <strong className="allocation-hot">
                    HOT
                  </strong>

                </span>


                <span>

                  Finance:{" "}

                  <strong>
                    Approved
                  </strong>

                </span>


                <span>

                  Technical:{" "}

                  <strong>
                    Approved
                  </strong>

                </span>

              </div>

            </div>

          )}


          {/* =================================================
              TEAM
          ================================================== */}

          <div className="form-group">

            <label
              htmlFor="allocation-team"
            >
              Team
            </label>


            <select
              id="allocation-team"
              value={
                selectedTeamId
              }
              disabled={
                saving
              }
              onChange={(
                event
              ) => {

                setSelectedTeamId(
                  event.target.value
                );


                setSuccess("");

                setError("");

              }}
            >

              <option value="">
                Select team
              </option>


              {teams.map(
                (team) => (

                  <option
                    key={
                      team.id
                    }
                    value={
                      team.id
                    }
                  >

                    {getTeamName(
                      team
                    )}

                  </option>

                )
              )}

            </select>


            {teams.length ===
              0 && (

              <p className="allocation-warning-text">

                No teams were found in
                the database.

              </p>

            )}

          </div>


          {/* =================================================
              PROJECT DATES
          ================================================== */}

          <div className="allocation-date-grid">

            <div className="form-group">

              <label
                htmlFor="allocation-start"
              >
                Start Date
              </label>


              <input
                id="allocation-start"
                type="date"
                value={
                  startDate
                }
                disabled={
                  saving
                }
                onChange={(
                  event
                ) => {

                  setStartDate(
                    event.target.value
                  );


                  setSuccess("");

                }}
              />

            </div>


            <div className="form-group">

              <label
                htmlFor="allocation-end"
              >
                End Date
              </label>


              <input
                id="allocation-end"
                type="date"
                value={
                  endDate
                }
                disabled={
                  saving
                }
                onChange={(
                  event
                ) => {

                  setEndDate(
                    event.target.value
                  );


                  setSuccess("");

                }}
              />

            </div>

          </div>


          {/* =================================================
              SAVE
          ================================================== */}

          <button
            type="button"
            className="allocation-save-button"
            onClick={
              handleAllocation
            }
            disabled={
              saving
            }
          >

            {saving
              ? "Allocating..."
              : "Prepare Allocation"}

          </button>

        </section>


        {/* ===================================================
            AVAILABLE TEAM MEMBERS
        ==================================================== */}

        <section className="card allocation-members-card">

          <div className="allocation-section-header">

            <div>

              <span className="allocation-small-label">
                Delivery Capacity
              </span>


              <h2 className="card-title">
                Available Team Members
              </h2>

            </div>


            <span className="allocation-count-badge">

              {
                availableMembers.length
              }

            </span>

          </div>


          {availableMembers.length ===
          0 ? (

            <div className="empty-state">

              No available team members.

            </div>

          ) : (

            <div className="allocation-member-list">

              {availableMembers.map(
                (
                  member
                ) => {

                  const selected =
                    selectedMemberIds
                      .includes(
                        member.id
                      );


                  return (

                    <button
                      key={
                        member.id
                      }
                      type="button"
                      disabled={
                        saving
                      }
                      className={
                        selected
                          ? "allocation-member allocation-member-selected"
                          : "allocation-member"
                      }
                      onClick={() =>
                        toggleMember(
                          member.id
                        )
                      }
                    >

                      <div className="allocation-member-avatar">

                        {getMemberInitials(
                          member
                        )}

                      </div>


                      <div className="allocation-member-info">

                        <strong>

                          {member
                            .full_name ||
                            member.email}

                        </strong>


                        <span>
                          {member.email}
                        </span>

                      </div>


                      <div>

                        <span className="allocation-member-status">

                          {selected
                            ? "Selected"
                            : "Available"}

                        </span>

                      </div>

                    </button>

                  );
                }
              )}

            </div>

          )}

        </section>

      </div>


      {/* =====================================================
          PRODUCTION READY PREVIEW
      ====================================================== */}

      <div className="card allocation-preview-card">

        <div className="allocation-section-header">

          <div>

            <span className="allocation-small-label">
              Connected Pipeline
            </span>


            <h2 className="card-title">
              Production Ready Leads
            </h2>


            <p>
              These leads passed both
              Financial Review and
              Technical Review.
            </p>

          </div>


          <button
            type="button"
            className="btn-secondary"
            disabled={
              saving
            }
            onClick={() =>
              void loadAllocationData()
            }
          >
            Refresh
          </button>

        </div>


        {leads.length ===
        0 ? (

          <div className="empty-state">

            No technically approved
            HOT leads are ready for
            allocation.

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
                    Tag
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

                          {getLeadTitle(
                            lead
                          )}

                        </strong>

                      </td>


                      <td>

                        {lead
                          .company_name ||
                          "-"}

                      </td>


                      <td>

                        <span className="allocation-hot-badge">
                          HOT
                        </span>

                      </td>


                      <td>

                        <span className="allocation-approved-badge">
                          Approved
                        </span>

                      </td>


                      <td>

                        <span className="allocation-approved-badge">
                          Approved
                        </span>

                      </td>


                      <td>

                        {formatStage(
                          lead.pipeline_stage
                        )}

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>


      {/* =====================================================
          CURRENT SELECTION SUMMARY
      ====================================================== */}

      {selectedTeam && (

        <div className="card">

          <span className="allocation-small-label">
            Allocation Selection
          </span>


          <h2>
            {getTeamName(
              selectedTeam
            )}
          </h2>


          <p>
            Selected Members:{" "}

            <strong>
              {
                selectedMemberIds.length
              }
            </strong>
          </p>


          {selectedLead && (

            <p>
              Lead:{" "}

              <strong>
                {getLeadTitle(
                  selectedLead
                )}
              </strong>
            </p>

          )}


          {startDate && (

            <p>
              Start Date:{" "}

              <strong>
                {startDate}
              </strong>
            </p>

          )}


          {endDate && (

            <p>
              End Date:{" "}

              <strong>
                {endDate}
              </strong>
            </p>

          )}

        </div>

      )}

    </div>
  );
}


/*
 * =========================================================
 * SUMMARY CARD
 * =========================================================
 */

function SummaryCard({
  title,
  value,
  accent = false,
}: {
  title: string;

  value: number;

  accent?: boolean;
}) {

  return (
    <div
      className={
        accent
          ? "allocation-summary-card allocation-summary-accent"
          : "allocation-summary-card"
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
 * TEAM NAME
 * =========================================================
 */

function getTeamName(
  team:
    PipelineTeam
) {

  if (
    typeof team.name ===
      "string" &&
    team.name.trim()
  ) {

    return team.name;
  }


  return "Unnamed Team";
}


/*
 * =========================================================
 * MEMBER INITIALS
 * =========================================================
 */

function getMemberInitials(
  member:
    PipelineTeamMember
) {

  const source =
    member.full_name ||
    member.email;


  return source
    .split(
      /[\s@._-]+/
    )
    .filter(Boolean)
    .slice(
      0,
      2
    )
    .map(
      (
        word
      ) =>
        word
          .charAt(0)
          .toUpperCase()
    )
    .join("");
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