import { createClient } from "@supabase/supabase-js";
import { env } from "./env";

const serverAuthOptions = {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
};

/*
 * Used mainly to validate Supabase Auth JWTs.
 */
export const supabaseAuth = createClient(
  env.supabaseUrl,
  env.supabasePublishableKey,
  serverAuthOptions
);

/*
 * ADMIN client.
 *
 * This bypasses Row Level Security.
 * Do not use this for ordinary user requests unless
 * the operation genuinely requires elevated privileges.
 */
export const supabaseAdmin = createClient(
  env.supabaseUrl,
  env.supabaseSecretKey,
  serverAuthOptions
);

/*
 * Normal database client operating as the currently
 * logged-in user.
 *
 * RLS can therefore identify the user with auth.uid().
 */
export const createUserSupabase = (
  accessToken: string
) => {
  return createClient(
    env.supabaseUrl,
    env.supabasePublishableKey,
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
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