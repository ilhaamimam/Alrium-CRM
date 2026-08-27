import {
  useCallback,
  useEffect,
  useState,
} from "react";

import CompanyForm from "./CompanyForm";

import CompanyTable from "./CompanyTable";

import {
  fetchCompanies,
} from "./company.api";

import type {
  Company,
} from "./company.types";


export default function CompaniesPage() {
  const [companies, setCompanies] =
    useState<Company[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  const loadCompanies =
    useCallback(async () => {
      try {
        setError("");

        const data =
          await fetchCompanies();

        setCompanies(data);
      } catch (error) {
        console.error(error);

        setError(
          "Unable to load companies"
        );
      } finally {
        setLoading(false);
      }
    }, []);


  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);


  if (loading) {
    return (
      <p>Loading companies...</p>
    );
  }


  return (
    <div>
      <h1>Companies</h1>

      {error && (
        <p>{error}</p>
      )}

      <CompanyForm
        onCreated={
          loadCompanies
        }
      />

      <CompanyTable
        companies={
          companies
        }
      />
    </div>
  );
}