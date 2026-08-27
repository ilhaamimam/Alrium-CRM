import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import { api } from "../api/http";
import { useAuth } from "../auth/useAuth";

import "./DashboardPage.css";


interface Profile {
  id: string;

  full_name: string | null;

  email: string;

  role: string;

  is_active: boolean;
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

  const {
    signOut,
  } =
    useAuth();


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
            "LOAD PROFILE ERROR:",
            error
          );

          setError(
            "Unable to load CRM profile"
          );
        }
      };

    loadProfile();
  }, []);


  return (
    <div className="page-shell">

      <div className="page-header">

        <h1 className="page-title">
          Dashboard
        </h1>

        <p className="page-subtitle">
          Welcome to Altrium CRM.
          Manage companies, contacts,
          leads and project workflows.
        </p>

      </div>


      {error && (
        <p className="error-message">
          {error}
        </p>
      )}


      {profile ? (
        <>
          <div className="card">

            <div className="dashboard-profile">

              <div className="dashboard-profile-info">

                <h2>
                  {profile.full_name ||
                    profile.email}
                </h2>

                <p>
                  {profile.email}
                </p>

                <p>
                  Role:{" "}
                  <strong>
                    {profile.role}
                  </strong>
                </p>

              </div>

            </div>

          </div>


          <div className="dashboard-links">

            <Link
              className="dashboard-link-card"
              to="/companies"
            >
              <span className="dashboard-link-title">
                Companies
              </span>

              <span className="dashboard-link-description">
                Manage customer
                organisations and business
                information.
              </span>
            </Link>


            <Link
              className="dashboard-link-card"
              to="/contacts"
            >
              <span className="dashboard-link-title">
                Contacts
              </span>

              <span className="dashboard-link-description">
                Manage customer contacts
                connected to companies.
              </span>
            </Link>


            <Link
              className="dashboard-link-card"
              to="/leads"
            >
              <span className="dashboard-link-title">
                Leads
              </span>

              <span className="dashboard-link-description">
                Create, manage and track
                customer opportunities.
              </span>
            </Link>


            {profile.role ===
              "senior_manager" && (
              <>
                <Link
                  className="dashboard-link-card"
                  to="/lead-board"
                >
                  <span className="dashboard-link-title">
                    Approved Lead Board
                  </span>

                  <span className="dashboard-link-description">
                    Manage approved Hot
                    leads and project
                    statuses.
                  </span>
                </Link>


                <Link
                  className="dashboard-link-card"
                  to="/team-allocation"
                >
                  <span className="dashboard-link-title">
                    Team Allocation
                  </span>

                  <span className="dashboard-link-description">
                    Create teams, manage
                    members and allocate
                    approved leads.
                  </span>
                </Link>
              </>
            )}

          </div>


          <div className="dashboard-actions">

            <button
              className="btn-secondary"
              onClick={() =>
                signOut()
              }
            >
              Logout
            </button>

          </div>
        </>
      ) : (
        !error && (
          <div className="empty-state">
            Loading profile...
          </div>
        )
      )}

    </div>
  );
}