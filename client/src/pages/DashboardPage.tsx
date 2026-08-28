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

import "./DashboardPage.css";


interface Profile {
  id: string;

  full_name: string | null;

  email: string;

  role: string;
}


export default function DashboardPage() {
  const [
    profile,
    setProfile,
  ] =
    useState<Profile | null>(
      null
    );


  const [
    error,
    setError,
  ] =
    useState("");


  useEffect(() => {
    const loadProfile =
      async () => {
        try {
          const response =
            await api.get("/me");

          setProfile(
            response.data.data.user
          );

        } catch (error) {
          console.error(
            "DASHBOARD PROFILE ERROR:",
            error
          );

          setError(
            "Unable to load profile"
          );
        }
      };


    loadProfile();

  }, []);


  const initials =
    useMemo(() => {
      if (
        profile?.full_name
      ) {
        return profile.full_name
          .split(" ")
          .filter(Boolean)
          .slice(0, 2)
          .map(
            (word) =>
              word[0]
                ?.toUpperCase()
          )
          .join("");
      }


      return profile?.email
        ?.slice(0, 2)
        .toUpperCase() ||
        "CR";

    }, [
      profile,
    ]);


  return (
    <div className="page-shell">

      <div className="page-header">

        <h1 className="page-title">
          Dashboard
        </h1>

        <p className="page-subtitle">
          Manage customers, leads,
          approved projects and team
          delivery from one workspace.
        </p>

      </div>


      {error && (
        <p className="error-message">
          {error}
        </p>
      )}


      {profile && (
        <div className="card dashboard-profile-card">

          <div className="dashboard-profile-main">

            <div className="dashboard-profile-avatar">
              {initials}
            </div>


            <div className="dashboard-profile-info">

              <h2>
                {profile.full_name ||
                  profile.email}
              </h2>

              <p>
                {profile.email}
              </p>

              <p>
                {formatRole(
                  profile.role
                )}
              </p>

            </div>

          </div>

        </div>
      )}


      <div className="dashboard-links">

        {(
          profile?.role ===
            "sales_rep" ||
          profile?.role ===
            "sales_manager" ||
          profile?.role ===
            "senior_manager"
        ) && (
          <>
            <DashboardCard
              to="/companies"
              title="Companies"
              description="Customer organisations and company records."
            />


            <DashboardCard
              to="/contacts"
              title="Contacts"
              description="People connected to your customer companies."
            />


            <DashboardCard
              to="/leads"
              title="Leads"
              description="Manage Cold and Hot sales opportunities."
            />
          </>
        )}


        {profile?.role ===
          "senior_manager" && (
          <>
            <DashboardCard
              to="/lead-board"
              title="Approved Lead Board"
              description="Manage approved leads and project stages."
            />


            <DashboardCard
              to="/team-allocation"
              title="Team Allocation"
              description="Build teams and allocate approved projects."
            />


            <DashboardCard
              to="/project-completion"
              title="Completion Review"
              description="Review team-completed projects and confirm Done."
            />
          </>
        )}


        {(
          profile?.role ===
            "team_member" ||
          profile?.role ===
            "senior_manager"
        ) && (
          <DashboardCard
            to="/team-progress"
            title="Team Progress"
            description="Work on assigned projects and project tasks."
          />
        )}


        {(
          profile?.role ===
            "sales_rep" ||
          profile?.role ===
            "sales_manager"
        ) && (
          <DashboardCard
            to="/final-updates"
            title="Final Updates"
            description="View projects confirmed Done after delivery."
          />
        )}

      </div>

    </div>
  );
}


function DashboardCard({
  to,
  title,
  description,
}: {
  to: string;

  title: string;

  description: string;
}) {
  return (
    <Link
      className="dashboard-link-card"
      to={to}
    >

      <span className="dashboard-link-title">
        {title}
      </span>

      <span className="dashboard-link-description">
        {description}
      </span>

    </Link>
  );
}


function formatRole(
  role: string
) {
  return role
    .split("_")
    .map(
      (word) =>
        word.charAt(0)
          .toUpperCase() +
        word.slice(1)
    )
    .join(" ");
}