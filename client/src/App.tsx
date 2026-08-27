import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";

import CompaniesPage from "./features/companies/CompaniesPage";
import CompanyDetailsPage from "./features/companies/CompanyDetailsPage";
import ContactPage from "./features/contacts/ContactsPage";
import LeadsPage from "./features/leads/LeadsPage";

import LeadDetailsPage from "./features/leads/LeadDetailsPage";
import ContactDetailsPage from "./features/contacts/ContactDetailsPage";
import ProtectedRoute from "./pages/routes/ProtectedRoute";

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