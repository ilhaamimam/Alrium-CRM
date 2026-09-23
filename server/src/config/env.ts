import "dotenv/config";

/*
 * =========================================================
 * REQUIRED ENVIRONMENT VARIABLES
 * =========================================================
 */

const requiredVariables = [
  "SUPABASE_URL",
  "SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SECRET_KEY",
] as const;

for (const variable of requiredVariables) {
  const value = process.env[variable];

  if (!value || !value.trim()) {
    throw new Error(
      `Missing environment variable: ${variable}`
    );
  }
}

/*
 * =========================================================
 * ENVIRONMENT CONFIGURATION
 * =========================================================
 */

export const env = {
  /*
   * Render automatically provides PORT.
   * Local development falls back to 4000.
   */
  port: Number(
    process.env.PORT || 4000
  ),

  /*
   * Frontend URL used by CORS.
   *
   * Production example:
   * https://gilded-yeot-71e93c.netlify.app
   */
  clientUrl:
    process.env.CLIENT_URL?.trim() ||
    "http://localhost:5173",

  /*
   * Supabase project URL.
   */
  supabaseUrl:
    process.env.SUPABASE_URL!.trim(),

  /*
   * Public/publishable Supabase key.
   *
   * Starts with:
   * sb_publishable_
   */
  supabasePublishableKey:
    process.env
      .SUPABASE_PUBLISHABLE_KEY!
      .trim(),

  /*
   * Backend-only Supabase secret key.
   *
   * Starts with:
   * sb_secret_
   *
   * NEVER expose this to the frontend.
   */
  supabaseSecretKey:
    process.env
      .SUPABASE_SECRET_KEY!
      .trim(),
};