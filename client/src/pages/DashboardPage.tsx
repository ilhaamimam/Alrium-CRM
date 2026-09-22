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
  api,
} from "../api/http";

import DashboardPipeline
  from "../features/dashboard-pipeline/DashboardPipeline";

import "./DashboardPage.css";


/*
 * =========================================================
 * DASHBOARD PROFILE
 * =========================================================
 */

interface DashboardProfile {
  id: string;

  full_name:
    string | null;

  email: string;

  role: string;

  availability_status?:
    string | null;
}


/*
 * =========================================================
 * DASHBOARD PAGE
 * =========================================================
 */

export default function DashboardPage() {
  /*
   * =========================================================
   * PROFILE
   * =========================================================
   */

  const [
    profile,
    setProfile,
  ] =
    useState<
      DashboardProfile | null
    >(null);


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
   * LOAD CURRENT USER
   * =========================================================
   */

  useEffect(() => {

    const loadProfile =
      async () => {

        try {

          setLoading(
            true
          );

          setError("");


          const response =
            await api.get(
              "/me"
            );


          const user =
            response.data
              ?.data
              ?.user ??
            response.data
              ?.user ??
            response.data
              ?.data ??
            response.data;


          console.log(
            "DASHBOARD CURRENT USER:",
            user
          );


          setProfile(
            user
          );

        } catch (error) {

          console.error(
            "DASHBOARD PROFILE ERROR:",
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
              "Unable to load dashboard"
            );

          } else {

            setError(
              "Unable to load dashboard"
            );
          }

        } finally {

          setLoading(
            false
          );
        }
      };


    void loadProfile();

  }, []);


  /*
   * =========================================================
   * ROLE ACCESS
   *
   * These permissions are ONLY for the role-specific
   * workspace cards.
   *
   * The live Dashboard Pipeline is NOT restricted by role.
   * =========================================================
   */

  const role =
    profile?.role;


  const hasSeniorAccess =
    role ===
      "sales_manager" ||
    role ===
      "senior_manager";


  const isSalesRep =
    role ===
    "sales_rep";


  const isFinancialOfficer =
    role ===
    "financial_officer";


  const isTechnicalOfficer =
    role ===
    "technical_officer";


  const isTeamMember =
    role ===
    "team_member";


  /*
   * =========================================================
   * USER INITIALS
   * =========================================================
   */

  const initials =
    useMemo(
      () => {

        const source =
          profile?.full_name ||
          profile?.email ||
          "CRM";


        return source
          .split(
            /[\s@._-]+/
          )
          .filter(
            Boolean
          )
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

      },
      [
        profile,
      ]
    );


  /*
   * =========================================================
   * LOADING
   * =========================================================
   */

  if (
    loading
  ) {

    return (

      <div className="dashboard-page">

        <div className="dashboard-loading">

          Loading dashboard...

        </div>

      </div>
    );
  }


  /*
   * =========================================================
   * ERROR
   * =========================================================
   */

  if (
    error
  ) {

    return (

      <div className="dashboard-page">

        <div className="dashboard-error">

          {error}

        </div>

      </div>
    );
  }


  /*
   * =========================================================
   * NO PROFILE
   * =========================================================
   */

  if (
    !profile
  ) {

    return (

      <div className="dashboard-page">

        <div className="dashboard-error">

          Unable to find user profile.

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

    <div className="dashboard-page">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="dashboard-header">

        <div>

          <span className="dashboard-eyebrow">

            Altrium CRM

          </span>


          <h1>

            Dashboard

          </h1>


          <p>

            Manage customers, leads,
            approved projects and team
            delivery from one connected
            workspace.

          </p>

        </div>

      </div>


      {/* =====================================================
          PROFILE
      ====================================================== */}

      <section className="dashboard-profile-card">

        <div className="dashboard-profile-avatar">

          {initials}

        </div>


        <div className="dashboard-profile-info">

          <strong>

            {profile.full_name ||
              profile.email}

          </strong>


          <span>

            {profile.email}

          </span>


          <small>

            {formatRole(
              profile.role
            )}

          </small>

        </div>


        {profile
          .availability_status && (

          <span className="dashboard-availability">

            {formatRole(
              profile
                .availability_status
            )}

          </span>

        )}

      </section>


      {/* =====================================================
          LIVE LEAD PIPELINE
          
          IMPORTANT:
          
          This is OUTSIDE every role condition.
          
          Therefore:
          
          sales_manager
          senior_manager
          sales_rep
          financial_officer
          technical_officer
          team_member
          
          all see the same pipeline.
      ====================================================== */}

      <DashboardPipeline />


      {/* =====================================================
          SALES MANAGER + SENIOR MANAGER
      ====================================================== */}

      {hasSeniorAccess && (

        <section className="dashboard-section">

          <div className="dashboard-section-heading">

            <span>

              Management Workspace

            </span>


            <h2>

              CRM Management

            </h2>


            <p>

              Sales Manager and Senior
              Manager share the same
              connected management
              workspace.

            </p>

          </div>


          <div className="dashboard-card-grid">

            <DashboardCard
              to="/companies"
              code="CO"
              title="Companies"
              description="Manage customer organisations and company records."
            />


            <DashboardCard
              to="/contacts"
              code="CT"
              title="Contacts"
              description="Manage contacts linked to customer companies."
            />


            <DashboardCard
              to="/leads"
              code="LD"
              title="Leads"
              description="View the connected lead pipeline and current Hot/Cold status."
            />


            <DashboardCard
              to="/lead-board"
              code="LB"
              title="Lead Board"
              description="View technically approved production-ready leads."
            />


            <DashboardCard
              to="/team-allocation"
              code="TA"
              title="Team Allocation"
              description="Allocate approved HOT leads to delivery teams."
            />


            <DashboardCard
              to="/project-completion"
              code="CR"
              title="Completion Review"
              description="Review completed project delivery."
            />


            <DashboardCard
              to="/team-progress"
              code="TP"
              title="Team Progress"
              description="Monitor team delivery and project progress."
            />

          </div>

        </section>

      )}


      {/* =====================================================
          SALES REPRESENTATIVE
      ====================================================== */}

      {isSalesRep && (

        <section className="dashboard-section">

          <div className="dashboard-section-heading">

            <span>

              Sales Workspace

            </span>


            <h2>

              Sales

            </h2>


            <p>

              Create and manage customer
              relationships and sales
              opportunities.

            </p>

          </div>


          <div className="dashboard-card-grid">

            <DashboardCard
              to="/companies"
              code="CO"
              title="Companies"
              description="Manage customer organisations."
            />


            <DashboardCard
              to="/contacts"
              code="CT"
              title="Contacts"
              description="Manage customer contacts."
            />


            <DashboardCard
              to="/leads"
              code="LD"
              title="Leads"
              description="Create and manage sales leads."
            />

          </div>

        </section>

      )}


      {/* =====================================================
          FINANCIAL OFFICER
      ====================================================== */}

      {isFinancialOfficer && (

        <section className="dashboard-section">

          <div className="dashboard-section-heading">

            <span>

              Financial Workspace

            </span>


            <h2>

              Financial Review

            </h2>


            <p>

              Review lead financial
              viability and update the
              Financial Review stage.

            </p>

          </div>


          <div className="dashboard-card-grid">

            <DashboardCard
              to="/financial-review"
              code="FR"
              title="Financial Review"
              description="Review lead financial viability before Technical Review."
            />


            <DashboardCard
              to="/financial-review/archive"
              code="AR"
              title="Rejected Archive"
              description="View financially rejected leads."
            />

          </div>

        </section>

      )}


      {/* =====================================================
          TECHNICAL OFFICER
      ====================================================== */}

      {isTechnicalOfficer && (

        <section className="dashboard-section">

          <div className="dashboard-section-heading">

            <span>

              Technical Workspace

            </span>


            <h2>

              Technical Review

            </h2>


            <p>

              Review financially approved
              leads and update technical
              feasibility.

            </p>

          </div>


          <div className="dashboard-card-grid">

            <DashboardCard
              to="/technical-review"
              code="TR"
              title="Technical Review"
              description="Review financially approved leads for technical feasibility."
            />

          </div>

        </section>

      )}


      {/* =====================================================
          TEAM MEMBER
      ====================================================== */}

      {isTeamMember && (

        <section className="dashboard-section">

          <div className="dashboard-section-heading">

            <span>

              Delivery Workspace

            </span>


            <h2>

              Delivery

            </h2>


            <p>

              Work on allocated projects
              and maintain delivery
              progress.

            </p>

          </div>


          <div className="dashboard-card-grid">

            <DashboardCard
              to="/team-progress"
              code="TP"
              title="Team Progress"
              description="Work on assigned projects and update delivery progress."
            />

          </div>

        </section>

      )}

    </div>
  );
}


/*
 * =========================================================
 * DASHBOARD CARD
 * =========================================================
 */

function DashboardCard({
  to,
  code,
  title,
  description,
}: {
  to: string;

  code: string;

  title: string;

  description: string;
}) {

  return (

    <Link
      to={
        to
      }
      className="dashboard-card"
    >

      <div className="dashboard-card-icon">

        {code}

      </div>


      <div>

        <h3>

          {title}

        </h3>


        <p>

          {description}

        </p>

      </div>


      <span className="dashboard-card-arrow">

        →

      </span>

    </Link>
  );
}


/*
 * =========================================================
 * FORMAT ROLE
 * =========================================================
 */

function formatRole(
  value:
    string |
    undefined |
    null
) {

  if (
    !value
  ) {

    return "-";
  }


  return value
    .split("_")
    .map(
      (
        word
      ) =>
        word
          .charAt(0)
          .toUpperCase() +
        word.slice(1)
    )
    .join(" ");
}