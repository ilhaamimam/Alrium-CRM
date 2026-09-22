import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";


/*
 * =========================================================
 * AUTH
 * =========================================================
 */

import LoginPage
  from "./pages/LoginPage";

import ProtectedRoute
  from "./pages/routes/ProtectedRoute";


/*
 * =========================================================
 * DASHBOARD
 * =========================================================
 */

import DashboardPage
  from "./pages/DashboardPage";


/*
 * =========================================================
 * COMPANIES
 * =========================================================
 */
import ChatPage
  from "./features/chat/ChatPage";

import CompaniesPage
  from "./features/companies/CompaniesPage";

import CompanyDetailsPage
  from "./features/companies/CompanyDetailsPage";


  import CalendarPage
  from "./features/calendar/CalendarPage";

/*
 * =========================================================
 * CONTACTS
 * =========================================================
 */

import ContactPage
  from "./features/contacts/ContactsPage";

import ContactDetailsPage
  from "./features/contacts/ContactDetailsPage";


/*
 * =========================================================
 * LEADS
 * =========================================================
 */

import LeadsPage
  from "./features/leads/LeadsPage";

import LeadDetailsPage
  from "./features/leads/LeadDetailsPage";


/*
 * =========================================================
 * FINANCIAL REVIEW
 * =========================================================
 */

import FinancialReviewPage
  from "./features/financial-review/FinancialReviewPage";

import FinancialReviewArchivePage
  from "./features/financial-review/FinancialReviewArchivePage";


/*
 * =========================================================
 * TECHNICAL REVIEW
 * =========================================================
 */

import TechnicalReviewPage
  from "./features/technical-review/TechnicalReviewPage";


/*
 * =========================================================
 * APPROVED LEAD BOARD
 * =========================================================
 */

import ApprovedLeadBoardPage
  from "./features/approved-lead-board/ApprovedLeadBoardPage";

import ApprovedLeadBoardDetailsPage
  from "./features/approved-lead-board/ApprovedLeadBoardDetailsPage";


/*
 * =========================================================
 * TEAM ALLOCATION
 * =========================================================
 */

import TeamAllocationPage
  from "./features/team-allocation/TeamAllocationPage";


/*
 * =========================================================
 * TEAM PROGRESS
 * =========================================================
 */

import TeamProgressPage
  from "./features/team-progress/TeamProgressPage";

import TeamProjectDetailsPage
  from "./features/team-progress/TeamProjectDetailsPage";


/*
 * =========================================================
 * PROJECT COMPLETION
 * =========================================================
 */

import ProjectCompletionReviewPage
  from "./features/project-completion/ProjectCompletionReviewPage";

import ProjectCompletionReviewDetailsPage
  from "./features/project-completion/ProjectCompletionReviewDetailsPage";

import FinalProjectUpdatesPage
  from "./features/project-completion/FinalProjectUpdatesPage";


function App() {
  return (
    <Routes>

      {/* ===================================================
          LOGIN
      ==================================================== */}

      <Route
        path="/login"
        element={
          <LoginPage />
        }
      />


      {/* ===================================================
          DASHBOARD
      ==================================================== */}

      <Route
        path="/"
        element={
          <ProtectedRoute>

            <DashboardPage />

          </ProtectedRoute>
        }
      />


      {/* ===================================================
          COMPANIES
      ==================================================== */}

      <Route
        path="/companies"
        element={
          <ProtectedRoute>

            <CompaniesPage />

          </ProtectedRoute>
        }
      />


      <Route
        path="/companies/:id"
        element={
          <ProtectedRoute>

            <CompanyDetailsPage />

          </ProtectedRoute>
        }
      />
    <Route
  path="/chat"
  element={
    <ProtectedRoute>
      <ChatPage />
    </ProtectedRoute>
  }
/>

      {/* ===================================================
          CONTACTS
      ==================================================== */}

      <Route
        path="/contacts"
        element={
          <ProtectedRoute>

            <ContactPage />

          </ProtectedRoute>
        }
      />
      <Route
        path="/calendar"
        element={
          <ProtectedRoute>
            <CalendarPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/contacts/:id"
        element={
          <ProtectedRoute>

            <ContactDetailsPage />

          </ProtectedRoute>
        }
      />


      {/* ===================================================
          LEADS
      ==================================================== */}

      <Route
        path="/leads"
        element={
          <ProtectedRoute>

            <LeadsPage />

          </ProtectedRoute>
        }
      />


      <Route
        path="/leads/:id"
        element={
          <ProtectedRoute>

            <LeadDetailsPage />

          </ProtectedRoute>
        }
      />


      {/* ===================================================
          FINANCIAL REVIEW

          Actual role permissions are enforced by backend:
          financial_officer = review decisions

          Managers can read permitted result/archive endpoints.
      ==================================================== */}

      <Route
        path="/financial-review"
        element={
          <ProtectedRoute>

            <FinancialReviewPage />

          </ProtectedRoute>
        }
      />


      <Route
        path="/financial-review/archive"
        element={
          <ProtectedRoute>

            <FinancialReviewArchivePage />

          </ProtectedRoute>
        }
      />


      {/* ===================================================
          TECHNICAL REVIEW

          Technical decisions remain restricted by backend
          to technical_officer.
      ==================================================== */}

      <Route
        path="/technical-review"
        element={
          <ProtectedRoute>

            <TechnicalReviewPage />

          </ProtectedRoute>
        }
      />


      {/* ===================================================
          LEAD BOARD

          Management access:
          sales_manager
          senior_manager
      ==================================================== */}

      <Route
        path="/lead-board"
        element={
          <ProtectedRoute>

            <ApprovedLeadBoardPage />

          </ProtectedRoute>
        }
      />


      <Route
        path="/lead-board/:id"
        element={
          <ProtectedRoute>

            <ApprovedLeadBoardDetailsPage />

          </ProtectedRoute>
        }
      />


      {/* ===================================================
          TEAM ALLOCATION

          Management access:
          sales_manager
          senior_manager
      ==================================================== */}

      <Route
        path="/team-allocation"
        element={
          <ProtectedRoute>

            <TeamAllocationPage />

          </ProtectedRoute>
        }
      />


      {/* ===================================================
          TEAM PROGRESS

          Access:
          team_member
          sales_manager
          senior_manager
      ==================================================== */}

      <Route
        path="/team-progress"
        element={
          <ProtectedRoute>

            <TeamProgressPage />

          </ProtectedRoute>
        }
      />


      <Route
        path="/team-progress/:id"
        element={
          <ProtectedRoute>

            <TeamProjectDetailsPage />

          </ProtectedRoute>
        }
      />


      {/* ===================================================
          PROJECT COMPLETION

          Management access:
          sales_manager
          senior_manager
      ==================================================== */}

      <Route
        path="/project-completion"
        element={
          <ProtectedRoute>

            <ProjectCompletionReviewPage />

          </ProtectedRoute>
        }
      />


      <Route
        path="/project-completion/:id"
        element={
          <ProtectedRoute>

            <ProjectCompletionReviewDetailsPage />

          </ProtectedRoute>
        }
      />


      {/* ===================================================
          FINAL PROJECT UPDATES
      ==================================================== */}

      <Route
        path="/final-updates"
        element={
          <ProtectedRoute>

            <FinalProjectUpdatesPage />

          </ProtectedRoute>
        }
      />


      {/* ===================================================
          FALLBACK
      ==================================================== */}

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />

    </Routes>
  );
}


export default App;