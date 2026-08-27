import axios from "axios";

import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  fetchCompanyById,
} from "./company.api";

import CompanyEditForm
  from "./CompanyEditForm";

import type {
  Company,
} from "./company.types";

import "./companies.css";


export default function CompanyDetailsPage() {
  const {
    id,
  } =
    useParams<{
      id: string;
    }>();


  const [
    company,
    setCompany,
  ] =
    useState<Company | null>(
      null
    );


  const [
    loading,
    setLoading,
  ] =
    useState(true);


  const [
    editing,
    setEditing,
  ] =
    useState(false);


  const [
    error,
    setError,
  ] =
    useState("");


  useEffect(() => {
    const loadCompany =
      async () => {
        if (!id) {
          setError(
            "Company ID is missing"
          );

          setLoading(false);

          return;
        }


        try {
          const data =
            await fetchCompanyById(
              id
            );

          setCompany(data);

        } catch (error) {
          console.error(
            "LOAD COMPANY ERROR:",
            error
          );


          if (
            axios.isAxiosError(
              error
            )
          ) {
            setError(
              error.response?.data?.message ||
                "Unable to load company"
            );
          } else {
            setError(
              "Unable to load company"
            );
          }

        } finally {
          setLoading(false);
        }
      };


    loadCompany();

  }, [id]);


  if (loading) {
    return (
      <div className="page-shell">

        <div className="empty-state">
          Loading company...
        </div>

      </div>
    );
  }


  if (error) {
    return (
      <div className="page-shell">

        <p className="error-message">
          {error}
        </p>

        <Link to="/companies">
          ← Back to Companies
        </Link>

      </div>
    );
  }


  if (!company) {
    return (
      <div className="page-shell">

        <div className="empty-state">
          Company not found.
        </div>

      </div>
    );
  }


  if (editing) {
    return (
      <div className="page-shell">

        <div className="card">

          <CompanyEditForm
            company={company}
            onUpdated={(
              updated
            ) => {
              setCompany(
                updated
              );

              setEditing(
                false
              );
            }}
            onCancel={() =>
              setEditing(false)
            }
          />

        </div>

      </div>
    );
  }


  return (
    <div className="page-shell">

      <div className="page-header">

        <Link to="/companies">
          ← Back to Companies
        </Link>


        <h1 className="page-title">
          {company.name}
        </h1>


        <p className="page-subtitle">
          Company details and customer
          information.
        </p>

      </div>


      <div className="company-details-actions">

        <button
          onClick={() =>
            setEditing(true)
          }
        >
          Edit Company
        </button>

      </div>


      <div className="card">

        <div className="details-grid">

          <Detail
            label="Industry"
            value={
              company.industry
            }
          />

          <Detail
            label="Website"
            value={
              company.website
            }
          />

          <Detail
            label="Phone"
            value={
              company.phone
            }
          />

          <Detail
            label="Address"
            value={
              company.address
            }
          />

          <Detail
            label="Notes"
            value={
              company.notes
            }
          />

          <Detail
            label="Created"
            value={
              new Date(
                company.created_at
              ).toLocaleString()
            }
          />

          <Detail
            label="Last Updated"
            value={
              new Date(
                company.updated_at
              ).toLocaleString()
            }
          />

        </div>

      </div>

    </div>
  );
}


function Detail({
  label,
  value,
}: {
  label: string;
  value:
    string |
    null |
    undefined;
}) {
  return (
    <div className="detail-item">

      <span className="detail-label">
        {label}
      </span>

      <span className="detail-value">
        {value || "-"}
      </span>

    </div>
  );
}