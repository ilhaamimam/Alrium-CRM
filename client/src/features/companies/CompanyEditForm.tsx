import axios from "axios";

import {
  useState,
  type FormEvent,
} from "react";

import {
  updateCompany,
} from "./company.api";

import type {
  Company,
} from "./company.types";


interface Props {
  company: Company;

  onUpdated: (
    company: Company
  ) => void;

  onCancel: () => void;
}


export default function CompanyEditForm({
  company,
  onUpdated,
  onCancel,
}: Props) {
  const [name, setName] =
    useState(company.name);

  const [industry, setIndustry] =
    useState(
      company.industry ?? ""
    );

  const [website, setWebsite] =
    useState(
      company.website ?? ""
    );

  const [phone, setPhone] =
    useState(
      company.phone ?? ""
    );

  const [address, setAddress] =
    useState(
      company.address ?? ""
    );

  const [notes, setNotes] =
    useState(
      company.notes ?? ""
    );

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  const handleSubmit = async (
    event:
      FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setLoading(true);


    try {
      const updated =
        await updateCompany(
          company.id,
          {
            name:
              name.trim(),

            industry:
              industry.trim(),

            website:
              website.trim(),

            phone:
              phone.trim(),

            address:
              address.trim(),

            notes:
              notes.trim(),
          }
        );


      onUpdated(updated);

    } catch (error) {
      console.error(
        "UPDATE COMPANY ERROR:",
        error
      );


      if (
        axios.isAxiosError(error)
      ) {
        setError(
          error.response?.data?.message ||
            "Unable to update company"
        );
      } else {
        setError(
          "Unable to update company"
        );
      }

    } finally {
      setLoading(false);
    }
  };


  return (
    <form
      className="form-grid"
      onSubmit={handleSubmit}
    >

      <div className="form-group form-group-full">

        <h2 className="card-title">
          Edit Company
        </h2>

      </div>


      <div className="form-group form-group-full">

        <label>
          Company Name
        </label>

        <input
          value={name}
          onChange={(event) =>
            setName(
              event.target.value
            )
          }
          required
        />

      </div>


      <div className="form-group">

        <label>
          Industry
        </label>

        <input
          value={industry}
          onChange={(event) =>
            setIndustry(
              event.target.value
            )
          }
        />

      </div>


      <div className="form-group">

        <label>
          Website
        </label>

        <input
          value={website}
          onChange={(event) =>
            setWebsite(
              event.target.value
            )
          }
        />

      </div>


      <div className="form-group">

        <label>
          Phone
        </label>

        <input
          value={phone}
          onChange={(event) =>
            setPhone(
              event.target.value
            )
          }
        />

      </div>


      <div className="form-group">

        <label>
          Address
        </label>

        <input
          value={address}
          onChange={(event) =>
            setAddress(
              event.target.value
            )
          }
        />

      </div>


      <div className="form-group form-group-full">

        <label>
          Notes
        </label>

        <textarea
          value={notes}
          onChange={(event) =>
            setNotes(
              event.target.value
            )
          }
        />

      </div>


      {error && (
        <p className="error-message form-group-full">
          {error}
        </p>
      )}


      <div className="button-row form-group-full">

        <button
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Updating..."
            : "Save Changes"}
        </button>


        <button
          type="button"
          className="btn-secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>

      </div>

    </form>
  );
}