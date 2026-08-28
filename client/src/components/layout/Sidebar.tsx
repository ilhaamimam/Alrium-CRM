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

  full_name: string | null;

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


  /*
   * Load logged-in CRM profile.
   */
  useEffect(() => {
    const loadProfile =
      async () => {
        try {
          const response =
            await api.get(
              "/me"
            );


          /*
           * Your /api/me endpoint should
           * return:
           *
           * {
           *   success: true,
           *   data: {
           *     user: {...}
           *   }
           * }
           */
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


    loadProfile();

  }, []);


  const role =
    profile?.role;


  /*
   * User avatar initials.
   */
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
              word
                .charAt(0)
                .toUpperCase()
          )
          .join("");
      }


      if (
        profile?.email
      ) {
        return profile.email
          .slice(0, 2)
          .toUpperCase();
      }


      return "CR";

    }, [
      profile,
    ]);


  /*
   * Sales-related pages.
   */
  const canSeeSales =
    role === "sales_rep" ||
    role === "sales_manager" ||
    role === "senior_manager";


  /*
   * Delivery pages.
   */
  const canSeeDelivery =
    role === "team_member" ||
    role === "senior_manager";


  /*
   * Final updates.
   */
  const canSeeFinalUpdates =
    role === "sales_rep" ||
    role === "sales_manager";


  return (
    <aside className="crm-sidebar">

      {/* =========================
          LOGO / BRAND
      ========================== */}

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


      {/* =========================
          NAVIGATION
      ========================== */}

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


        {/* SENIOR MANAGER */}

        {role ===
          "senior_manager" && (
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

        {canSeeDelivery && (
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


        {/* FINAL UPDATES */}

        {canSeeFinalUpdates && (
          <div className="sidebar-section">

            <span className="sidebar-section-title">
              Updates
            </span>


            <MenuLink
              to="/final-updates"
              icon="FU"
              label="Final Updates"
            />

          </div>
        )}

      </nav>


      {/* =========================
          USER AREA
      ========================== */}

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


/*
 * =========================================================
 * REUSABLE SIDEBAR LINK
 * =========================================================
 */

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


/*
 * =========================================================
 * FORMAT ROLE
 * =========================================================
 */

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