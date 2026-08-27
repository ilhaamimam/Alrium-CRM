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

import CompanyEditForm from "./CompanyEditForm";

import type {
  Company,
} from "./company.types";


export default function CompanyDetailsPage() {

  const { id } =
    useParams<{ id: string }>();


  const [company, setCompany] =
    useState<Company | null>(null);


  const [loading, setLoading] =
    useState(true);


  const [error, setError] =
    useState("");


  const [editing, setEditing] =
    useState(false);


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

          setError("");

          const data =
            await fetchCompanyById(
              id
            );

          setCompany(data);

        } catch (error) {

          console.error(
            "Load company error:",
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
      <p>
        Loading company...
      </p>
    );
  }


  if (error) {
    return (
      <div>

        <p>{error}</p>

        <Link to="/companies">
          Back to Companies
        </Link>

      </div>
    );
  }


  if (!company) {
    return (
      <p>
        Company not found.
      </p>
    );
  }


  if (editing) {
    return (
      <div>

        <CompanyEditForm
          company={company}

          onUpdated={(
            updatedCompany
          ) => {

            setCompany(
              updatedCompany
            );

            setEditing(false);

          }}

          onCancel={() =>
            setEditing(false)
          }
        />

      </div>
    );
  }


  return (
    <div>

      <p>
        <Link to="/companies">
          ← Back to Companies
        </Link>
      </p>


      <h1>
        {company.name}
      </h1>


      <button
        onClick={() =>
          setEditing(true)
        }
      >
        Edit Company
      </button>


      <hr />


      <div>

        <p>
          <strong>
            Company Name:
          </strong>{" "}

          {company.name}
        </p>


        <p>
          <strong>
            Industry:
          </strong>{" "}

          {company.industry ||
            "-"}
        </p>


        <p>
          <strong>
            Website:
          </strong>{" "}

          {company.website ||
            "-"}
        </p>


        <p>
          <strong>
            Phone:
          </strong>{" "}

          {company.phone ||
            "-"}
        </p>


        <p>
          <strong>
            Address:
          </strong>{" "}

          {company.address ||
            "-"}
        </p>


        <p>
          <strong>
            Notes:
          </strong>{" "}

          {company.notes ||
            "-"}
        </p>


        <p>
          <strong>
            Created:
          </strong>{" "}

          {new Date(
            company.created_at
          ).toLocaleString()}
        </p>


        <p>
          <strong>
            Last Updated:
          </strong>{" "}

          {new Date(
            company.updated_at
          ).toLocaleString()}
        </p>

      </div>

    </div>
  );
}