import {
  createClient,
} from "@supabase/supabase-js";

import {
  env,
} from "./env";

/*
 * =========================================================
 * COMMON SERVER AUTH OPTIONS
 * =========================================================
 *
 * The backend does not need browser-style
 * session persistence.
 * =========================================================
 */

const serverAuthOptions = {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
};

/*
 * =========================================================
 * AUTH CLIENT
 * =========================================================
 *
 * Used to validate user access tokens.
 *
 * Example:
 *
 * supabaseAuth.auth.getUser(accessToken)
 *
 * Uses the publishable key because this client
 * represents normal Supabase Auth access.
 * =========================================================
 */

export const supabaseAuth =
  createClient(
    env.supabaseUrl,
    env.supabasePublishableKey,
    serverAuthOptions
  );

/*
 * =========================================================
 * ADMIN CLIENT
 * =========================================================
 *
 * Uses the backend-only Supabase secret key.
 *
 * This client has elevated privileges and can bypass
 * Row Level Security where appropriate.
 *
 * NEVER send env.supabaseSecretKey to the frontend.
 * =========================================================
 */

export const supabaseAdmin =
  createClient(
    env.supabaseUrl,
    env.supabaseSecretKey,
    serverAuthOptions
  );

/*
 * =========================================================
 * USER-SCOPED DATABASE CLIENT
 * =========================================================
 *
 * Creates a Supabase client operating as the currently
 * authenticated user.
 *
 * The user's access token is passed in the
 * Authorization header so Supabase RLS can use:
 *
 * auth.uid()
 * =========================================================
 */

export const createUserSupabase = (
  accessToken: string
) => {
  if (!accessToken) {
    throw new Error(
      "Access token is required to create a user Supabase client"
    );
  }

  return createClient(
    env.supabaseUrl,
    env.supabasePublishableKey,
    {
      global: {
        headers: {
          Authorization:
            `Bearer ${accessToken}`,
        },
      },

      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  );
};