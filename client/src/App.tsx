import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import TeamProgressPage
  from "./features/team-progress/TeamProgressPage";

import TeamProjectDetailsPage
  from "./features/team-progress/TeamProjectDetailsPage";
import CompaniesPage from "./features/companies/CompaniesPage";
import CompanyDetailsPage from "./features/companies/CompanyDetailsPage";
import ContactPage from "./features/contacts/ContactsPage";
import TeamAllocationPage
  from "./features/team-allocation/TeamAllocationPage";
import LeadsPage from "./features/leads/LeadsPage";
import ApprovedLeadBoardPage
  from "./features/approved-lead-board/ApprovedLeadBoardPage";

import ApprovedLeadBoardDetailsPage
  from "./features/approved-lead-board/ApprovedLeadBoardDetailsPage";
import LeadDetailsPage from "./features/leads/LeadDetailsPage";
import ContactDetailsPage from "./features/contacts/ContactDetailsPage";
import ProtectedRoute from "./pages/routes/ProtectedRoute";
import ProjectCompletionReviewPage
  from "./features/project-completion/ProjectCompletionReviewPage";

import ProjectCompletionReviewDetailsPage
  from "./features/project-completion/ProjectCompletionReviewDetailsPage";

import FinalProjectUpdatesPage
  from "./features/project-completion/FinalProjectUpdatesPage";



function App() {
  return (
    <Routes>

  <Route
    path="/login"
    element={
      <LoginPage />
    }
  />
<Route
  path="/leads"
  element={
    <ProtectedRoute>
      <LeadsPage />
    </ProtectedRoute>
  }
/>

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


<Route
  path="/final-updates"
  element={
    <ProtectedRoute>
      <FinalProjectUpdatesPage />
    </ProtectedRoute>
  }
/>



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



<Route
  path="/team-allocation"
  element={
    <ProtectedRoute>
      <TeamAllocationPage />
    </ProtectedRoute>
  }
/>



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

<Route
  path="/leads/:id"
  element={
    <ProtectedRoute>
      <LeadDetailsPage />
    </ProtectedRoute>
  }
/>

  <Route
    path="/"
    element={
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    }
  />


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
    path="/contacts"
    element={
      <ProtectedRoute>
        <ContactPage />
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