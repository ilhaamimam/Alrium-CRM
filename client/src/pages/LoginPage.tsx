import {
  useState,
  type FormEvent,
} from "react";

import {
  Navigate,
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../auth/useAuth";

import "./LoginPage.css";


export default function LoginPage() {
  const navigate =
    useNavigate();


  const {
    user,
    loading: authLoading,
    signIn,
  } =
    useAuth();


  const [
    email,
    setEmail,
  ] =
    useState("");


  const [
    password,
    setPassword,
  ] =
    useState("");


  const [
    error,
    setError,
  ] =
    useState("");


  const [
    loginLoading,
    setLoginLoading,
  ] =
    useState(false);


  /*
   * If user already has a session,
   * don't show login again.
   */
  if (
    !authLoading &&
    user
  ) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }


  const handleSubmit =
    async (
      event:
        FormEvent<HTMLFormElement>
    ) => {
      event.preventDefault();


      if (loginLoading) {
        return;
      }


      setError("");


      const cleanEmail =
        email.trim();


      if (!cleanEmail) {
        setError(
          "Email is required"
        );

        return;
      }


      if (!password) {
        setError(
          "Password is required"
        );

        return;
      }


      try {
        setLoginLoading(
          true
        );


        console.log(
          "Login submitted:",
          cleanEmail
        );


        await signIn(
          cleanEmail,
          password
        );


        console.log(
          "Login finished. Navigating to dashboard..."
        );


        navigate(
          "/",
          {
            replace: true,
          }
        );

      } catch (error) {
        console.error(
          "LOGIN PAGE ERROR:",
          error
        );


        if (
          error instanceof Error
        ) {
          setError(
            error.message
          );

        } else {
          setError(
            "Unable to sign in"
          );
        }

      } finally {
        /*
         * This guarantees the button
         * never stays stuck indefinitely.
         */
        setLoginLoading(
          false
        );
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

            <h1>
              Altrium CRM
            </h1>

            <p>
              Sign in to continue
            </p>

          </div>

        </div>


        <div className="login-center-icon">

          <div className="login-center-icon-inner">
            <span>
              👤
            </span>
          </div>

        </div>


        <div className="login-title-block">

          <h2>
            Customer Login
          </h2>

          <p>
            Access your CRM workspace
          </p>

        </div>


        <form
          className="login-form-modern"
          onSubmit={
            handleSubmit
          }
        >

          <div className="login-input-group">

            <label
              htmlFor="email"
            >
              Email
            </label>


            <div className="login-input-wrap">

              <span className="login-input-icon">
                ✉
              </span>


              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="Enter your email"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value
                  )
                }
                disabled={
                  loginLoading
                }
              />

            </div>

          </div>


          <div className="login-input-group">

            <label
              htmlFor="password"
            >
              Password
            </label>


            <div className="login-input-wrap">

              <span className="login-input-icon">
                🔒
              </span>


              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                disabled={
                  loginLoading
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
            disabled={
              loginLoading
            }
          >

            {loginLoading
              ? "Signing In..."
              : "Login"}

          </button>

        </form>

      </div>

    </div>
  );
}