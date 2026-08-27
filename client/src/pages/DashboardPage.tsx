import {
  useEffect,
  useState,
} from "react";

import { api } from "../api/http";
import { useAuth } from "../auth/useAuth";
import {
  Link,
} from "react-router-dom";

interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  is_active: boolean;
}


export default function DashboardPage() {
  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [error, setError] =
    useState("");

  const { signOut } =
    useAuth();


  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response =
          await api.get("/me");

        setProfile(
          response.data.data.user
        );
      } catch (error) {
        console.error(error);

        setError(
          "Unable to load CRM profile"
        );
      }
    };


    loadProfile();
  }, []);


  return (
    <div>
      <h1>Altrium CRM Dashboard</h1>


      {error && (
        <p>{error}</p>
      )}


      {profile ? (
        <div>
          <p>
            Email: {profile.email}
          </p>

          <p>
            Role: {profile.role}
          </p>
        </div>
      ) : (
        <p>
          Loading profile...
        </p>
      )}
<Link to="/lead-board">
  Open Approved Lead Board
</Link>

      <button
        onClick={() => signOut()}
      >
        Logout
      </button>
    </div>
  );
}