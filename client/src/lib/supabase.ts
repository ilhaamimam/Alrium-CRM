import {
  createClient,
} from "@supabase/supabase-js";


const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL;


const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;


if (!supabaseUrl) {
  throw new Error(
    "Missing VITE_SUPABASE_URL"
  );
}


if (!supabasePublishableKey) {
  throw new Error(
    "Missing VITE_SUPABASE_PUBLISHABLE_KEY"
  );
}


console.log(
  "SUPABASE URL:",
  supabaseUrl
);

console.log(
  "SUPABASE KEY LOADED:",
  Boolean(
    supabasePublishableKey
  )
);


export const supabase =
  createClient(
    supabaseUrl,
    supabasePublishableKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    }
  );