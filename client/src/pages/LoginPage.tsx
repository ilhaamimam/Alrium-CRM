import {
  useState,
  type FormEvent,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../auth/useAuth";


export default function LoginPage() {
  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);


  const navigate =
    useNavigate();


  const { signIn } =
    useAuth();


  const handleSubmit = async (
    event: FormEvent
  ) => {
    event.preventDefault();

    setError("");
    setLoading(true);


    try {
      await signIn(
        email,
        password
      );

      navigate("/");
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(
          "Unable to login"
        );
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <div>
      <h1>Altrium CRM</h1>

      <h2>Login</h2>

      <form onSubmit={handleSubmit}>

        <div>
          <label>Email</label>

          <input
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(
                event.target.value
              )
            }
            required
          />
        </div>


        <div>
          <label>Password</label>

          <input
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(
                event.target.value
              )
            }
            required
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
            ? "Signing in..."
            : "Login"}
        </button>

      </form>
    </div>
  );
}