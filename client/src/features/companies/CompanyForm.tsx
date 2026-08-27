import axios from "axios";
import {
  useState,
  type FormEvent,
} from "react";

import { createCompany } from "./company.api";

interface Props {
  onCreated: () => void;
}

export default function CompanyForm({
  onCreated,
}: Props) {
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [website, setWebsite] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await createCompany({
        name,
        industry,
        website,
        phone,
        address,
        notes,
      });

      // Clear form after successful creation
      setName("");
      setIndustry("");
      setWebsite("");
      setPhone("");
      setAddress("");
      setNotes("");

      // Tell CompaniesPage to reload companies
      onCreated();
    } catch (error) {
      console.error(
        "Create company error:",
        error
      );

      if (axios.isAxiosError(error)) {
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
    <form onSubmit={handleSubmit}>
      <h2>Add Company</h2>

      <div>
        <label>Company Name</label>

        <input
          type="text"
          value={name}
          onChange={(event) =>
            setName(event.target.value)
          }
          required
        />
      </div>

      <div>
        <label>Industry</label>

        <input
          type="text"
          value={industry}
          onChange={(event) =>
            setIndustry(event.target.value)
          }
        />
      </div>

      <div>
        <label>Website</label>

        <input
          type="text"
          value={website}
          onChange={(event) =>
            setWebsite(event.target.value)
          }
        />
      </div>

      <div>
        <label>Phone</label>

        <input
          type="text"
          value={phone}
          onChange={(event) =>
            setPhone(event.target.value)
          }
        />
      </div>

      <div>
        <label>Address</label>

        <input
          type="text"
          value={address}
          onChange={(event) =>
            setAddress(event.target.value)
          }
        />
      </div>

      <div>
        <label>Notes</label>

        <textarea
          value={notes}
          onChange={(event) =>
            setNotes(event.target.value)
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
          ? "Saving..."
          : "Create Company"}
      </button>
    </form>
  );
}