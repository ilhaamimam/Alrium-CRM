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
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setLoading(true);
    setError("");


    try {

      const updatedCompany =
        await updateCompany(
          company.id,
          {
            name,
            industry,
            website,
            phone,
            address,
            notes,
          }
        );


      onUpdated(
        updatedCompany
      );

    } catch (error) {

      console.error(
        "Update company error:",
        error
      );


      if (
        axios.isAxiosError(error)
      ) {

        setError(
          error.response?.data?.message ||
          error.message ||
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
    <form onSubmit={handleSubmit}>

      <h2>Edit Company</h2>


      <div>
        <label>
          Company Name
        </label>

        <input
          type="text"
          value={name}
          onChange={(event) =>
            setName(
              event.target.value
            )
          }
          required
        />
      </div>


      <div>
        <label>
          Industry
        </label>

        <input
          type="text"
          value={industry}
          onChange={(event) =>
            setIndustry(
              event.target.value
            )
          }
        />
      </div>


      <div>
        <label>
          Website
        </label>

        <input
          type="text"
          value={website}
          onChange={(event) =>
            setWebsite(
              event.target.value
            )
          }
        />
      </div>


      <div>
        <label>
          Phone
        </label>

        <input
          type="text"
          value={phone}
          onChange={(event) =>
            setPhone(
              event.target.value
            )
          }
        />
      </div>


      <div>
        <label>
          Address
        </label>

        <input
          type="text"
          value={address}
          onChange={(event) =>
            setAddress(
              event.target.value
            )
          }
        />
      </div>


      <div>
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
        <p>{error}</p>
      )}


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
        onClick={onCancel}
        disabled={loading}
      >
        Cancel
      </button>

    </form>
  );
}