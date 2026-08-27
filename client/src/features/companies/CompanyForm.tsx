import axios from "axios";

import {
  useState,
  type FormEvent,
} from "react";

import {
  createCompany,
} from "./company.api";


interface Props {
  onCreated: () => void;
}


export default function CompanyForm({
  onCreated,
}: Props) {
  const [name, setName] =
    useState("");

  const [industry, setIndustry] =
    useState("");

  const [website, setWebsite] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [address, setAddress] =
    useState("");

  const [notes, setNotes] =
    useState("");

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
      await createCompany({
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
      });


      setName("");
      setIndustry("");
      setWebsite("");
      setPhone("");
      setAddress("");
      setNotes("");


      onCreated();

    } catch (error) {
      console.error(
        "CREATE COMPANY ERROR:",
        error
      );


      if (
        axios.isAxiosError(error)
      ) {
        setError(
          error.response?.data?.message ||
            error.message ||
            "Unable to create company"
        );
      } else {
        setError(
          "Unable to create company"
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
          Add Company
        </h2>

      </div>


      <div className="form-group form-group-full">

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


      <div className="form-group">

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


      <div className="form-group">

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


      <div className="form-group">

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


      <div className="form-group">

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
            ? "Creating..."
            : "Create Company"}
        </button>

      </div>

    </form>
  );
}