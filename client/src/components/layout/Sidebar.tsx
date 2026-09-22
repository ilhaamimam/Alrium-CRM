import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  NavLink,
} from "react-router-dom";

import {
  api,
} from "../../api/http";

import {
  useAuth,
} from "../../auth/useAuth";


interface Profile {
  id: string;

  full_name:
    string | null;

  email: string;

  role: string;
}


export default function Sidebar() {
  const [
    profile,
    setProfile,
  ] =
    useState<Profile | null>(
      null
    );


  const {
    signOut,
  } =
    useAuth();


  useEffect(() => {

    const loadProfile =
      async () => {

        try {

          const response =
            await api.get(
              "/me"
            );


          setProfile(
            response.data.data.user
          );

        } catch (error) {

          console.error(
            "SIDEBAR PROFILE ERROR:",
            error
          );

        }
      };


    void loadProfile();

  }, []);


  const role =
    profile?.role;


  /*
   * =========================================================
   * SALES MANAGER + SENIOR MANAGER
   *
   * BOTH HAVE THE SAME MANAGEMENT ACCESS.
   * =========================================================
   */

  const hasSeniorAccess =
    role ===
      "sales_manager" ||
    role ===
      "senior_manager";


  const hasBasicSalesAccess =
    role ===
      "sales_rep";


  const canSeeSales =
    hasSeniorAccess ||
    hasBasicSalesAccess;


  const canSeeFinancial =
    role ===
    "financial_officer";


  const canSeeTechnical =
    role ===
    "technical_officer";


  const canSeeTeamProgress =
    hasSeniorAccess ||
    role ===
      "team_member";


  const initials =
    useMemo(() => {

      if (
        profile?.full_name
      ) {

        return profile
          .full_name
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


      return profile?.email
        ?.slice(0, 2)
        .toUpperCase() ||
        "CR";

    }, [
      profile,
    ]);


  return (
    <aside className="crm-sidebar">

      <div className="sidebar-brand">

        <div className="sidebar-logo">
          A
        </div>


        <div className="sidebar-brand-text">

          <strong>
            Altrium
          </strong>

          <span>
            CRM
          </span>

        </div>

      </div>


      <nav className="sidebar-nav">

        {/* MAIN */}

        <div className="sidebar-section">

          <span className="sidebar-section-title">
            Main
          </span>


          <MenuLink
            to="/"
            icon="DB"
            label="Dashboard"
            end
          />

        </div>
      <div className="sidebar-section">

        <span className="sidebar-section-label">
          Communication
        </span>


        <MenuLink
          to="/chat"
          icon="CH"
          label="Chat"
        />

      </div>


      <div className="sidebar-section">

        <span className="sidebar-section-label">
          Planning
        </span>


        <MenuLink
          to="/calendar"
          icon="CA"
          label="Calendar"
        />

      </div>


        {/* SALES */}

        {canSeeSales && (

          <div className="sidebar-section">

            <span className="sidebar-section-title">
              Sales
            </span>


            <MenuLink
              to="/companies"
              icon="CO"
              label="Companies"
            />


            <MenuLink
              to="/contacts"
              icon="CT"
              label="Contacts"
            />


            <MenuLink
              to="/leads"
              icon="LD"
              label="Leads"
            />

          </div>

        )}


        {/* MANAGEMENT
            SALES MANAGER + SENIOR MANAGER
            ARE IDENTICAL HERE.
        */}

        {hasSeniorAccess && (

          <div className="sidebar-section">

            <span className="sidebar-section-title">
              Management
            </span>


            <MenuLink
              to="/lead-board"
              icon="LB"
              label="Lead Board"
            />


            <MenuLink
              to="/team-allocation"
              icon="TA"
              label="Team Allocation"
            />


            <MenuLink
              to="/project-completion"
              icon="CR"
              label="Completion Review"
            />

          </div>

        )}


        {/* DELIVERY */}

        {canSeeTeamProgress && (

          <div className="sidebar-section">

            <span className="sidebar-section-title">
              Delivery
            </span>


            <MenuLink
              to="/team-progress"
              icon="TP"
              label="Team Progress"
            />

          </div>

        )}


        {/* FINANCIAL */}

        {canSeeFinancial && (

          <div className="sidebar-section">

            <span className="sidebar-section-title">
              Financial
            </span>


            <MenuLink
              to="/financial-review"
              icon="FR"
              label="Financial Review"
            />


            <MenuLink
              to="/financial-review/archive"
              icon="AR"
              label="Rejected Archive"
            />

          </div>

        )}


        {/* TECHNICAL */}

        {canSeeTechnical && (

          <div className="sidebar-section">

            <span className="sidebar-section-title">
              Technical
            </span>


            <MenuLink
              to="/technical-review"
              icon="TR"
              label="Technical Review"
            />

          </div>

        )}

      </nav>


      <div className="sidebar-user">

        <div className="sidebar-user-info">

          <div className="sidebar-avatar">
            {initials}
          </div>


          <div className="sidebar-user-text">

            <strong>

              {profile?.full_name ||
                profile?.email ||
                "CRM User"}

            </strong>


            <span>

              {formatRole(
                profile?.role
              )}

            </span>

          </div>

        </div>


        <button
          type="button"
          className="sidebar-logout"
          onClick={() =>
            signOut()
          }
        >
          Logout
        </button>

      </div>

    </aside>
  );
}


interface MenuLinkProps {
  to: string;

  icon: string;

  label: string;

  end?: boolean;
}


function MenuLink({
  to,
  icon,
  label,
  end = false,
}: MenuLinkProps) {

  return (
    <NavLink
      to={to}
      end={end}
      className={({
        isActive,
      }) =>
        isActive
          ? "sidebar-link sidebar-link-active"
          : "sidebar-link"
      }
    >

      <span className="sidebar-link-icon">
        {icon}
      </span>


      <span className="sidebar-link-label">
        {label}
      </span>

    </NavLink>
  );
}


function formatRole(
  role?: string
) {

  if (!role) {
    return "Loading...";
  }


  return role
    .split("_")
    .map(
      (word) =>
        word
          .charAt(0)
          .toUpperCase() +
        word.slice(1)
    )
    .join(" ");
}