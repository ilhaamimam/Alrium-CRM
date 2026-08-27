import {
  Link,
} from "react-router-dom";

import "./AppHeader.css";


export default function AppHeader() {
  return (
    <header className="app-header">

      <div className="app-header-inner">

        <Link
          className="app-logo"
          to="/"
        >
          Altrium CRM
        </Link>


        <nav className="app-nav">

          <Link to="/">
            Dashboard
          </Link>

          <Link to="/companies">
            Companies
          </Link>

          <Link to="/contacts">
            Contacts
          </Link>

          <Link to="/leads">
            Leads
          </Link>

        </nav>

      </div>

    </header>
  );
}