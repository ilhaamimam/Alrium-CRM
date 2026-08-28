import {
  useCallback,
  useEffect,
  useState,
} from "react";

import CompanyForm
  from "./CompanyForm";

import CompanyTable
  from "./CompanyTable";

import {
  fetchCompanies,
} from "./company.api";

import type {
  Company,
} from "./company.types";

import "./companies.css";


export default function CompaniesPage() {
  const [
    companies,
    setCompanies,
  ] =
    useState<Company[]>([]);

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


  const loadCompanies =
    useCallback(
      async () => {
        try {
          setError("");

          const data =
            await fetchCompanies();

          setCompanies(data);
        } catch (error) {
          console.error(
            "LOAD COMPANIES ERROR:",
            error
          );

          setError(
            "Unable to load companies"
          );
        } finally {
          setLoading(false);
        }
      },
      []
    );


  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);


  if (loading) {
    return (
      <div className="page-shell">

        <div className="empty-state">
          Loading companies...
        </div>

      </div>
    );
  }


  return (
    <div className="page-shell">

      <div className="page-header">

        <h1 className="page-title">
          Companies
        </h1>

        <p className="page-subtitle">
          Manage customer organisations
          and company information.
        </p>

      </div>


      {error && (
        <p className="error-message">
          {error}
        </p>
      )}


      <div className="companies-layout">

        <div className="card">

          <CompanyForm
            onCreated={
              loadCompanies
            }
          />

        </div>


        <div className="card">

          <h2 className="card-title">
            Company Directory
          </h2>

          <CompanyTable
            companies={
              companies
            }
          />

        </div>

      </div>

    </div>
  );
}