import {
  useState,
  type FormEvent,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../auth/useAuth";

import "./LoginPage.css";


export default function LoginPage() {
  const navigate =
    useNavigate();

  const { signIn } =
    useAuth();

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);


  const handleSubmit =
    async (
      event: FormEvent<HTMLFormElement>
    ) => {
      event.preventDefault();

      setError("");

      if (!email.trim()) {
        setError(
          "Email is required"
        );
        return;
      }

      if (!password.trim()) {
        setError(
          "Password is required"
        );
        return;
      }

      try {
        setLoading(true);

        await signIn(
          email.trim(),
          password
        );

        navigate("/", {
          replace: true,
        });
      } catch (err) {
        console.error(
          "LOGIN ERROR:",
          err
        );

        setError(
          "Invalid email or password"
        );
      } finally {
        setLoading(false);
      }
    };


  return (
    <div className="login-screen">

      <div className="login-background-shape login-shape-1" />
      <div className="login-background-shape login-shape-2" />
      <div className="login-background-shape login-shape-3" />

      <div className="login-card-modern">

        <div className="login-brand-top">
          <div className="login-brand-badge">
            A
          </div>

          <div className="login-brand-text">
            <h1>Altrium CRM</h1>
            <p>
              Sign in to continue
            </p>
          </div>
        </div>

        <div className="login-center-icon">
          <div className="login-center-icon-inner">
            <span>👤</span>
          </div>
        </div>

        <div className="login-title-block">
          <h2>
            Hello Mate
          </h2>

          <p>
            Access your CRM workspace
          </p>
        </div>

        <form
          className="login-form-modern"
          onSubmit={handleSubmit}
        >
          <div className="login-input-group">
            <label htmlFor="email">
              Email
            </label>

            <div className="login-input-wrap">
              <span className="login-input-icon">
                ✉
              </span>

              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value
                  )
                }
              />
            </div>
          </div>

          <div className="login-input-group">
            <label htmlFor="password">
              Password
            </label>

            <div className="login-input-wrap">
              <span className="login-input-icon">
                🔒
              </span>

              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
              />
            </div>
          </div>

          <div className="login-row">
            <label className="remember-wrap">
              <input
                type="checkbox"
              />
              <span>
                Remember me
              </span>
            </label>

            <button
              type="button"
              className="forgot-link"
            >
              Forgot Password?
            </button>
          </div>

          {error && (
            <div className="login-error-box">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="login-submit-btn"
            disabled={loading}
          >
            {loading
              ? "Signing In..."
              : "Login"}
          </button>
        </form>

      </div>

    </div>
  );
}