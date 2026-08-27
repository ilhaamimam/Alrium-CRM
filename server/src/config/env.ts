import "dotenv/config";

const requiredVariables = [
  "SUPABASE_URL",
  "SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SECRET_KEY",
] as const;

for (const variable of requiredVariables) {
  if (!process.env[variable]) {
    throw new Error(
      `Missing environment variable: ${variable}`
    );
  }
}

export const env = {
  port: Number(process.env.PORT || 4000),

  clientUrl:
    process.env.CLIENT_URL || "http://localhost:5173",

  supabaseUrl:
    process.env.SUPABASE_URL as string,

  supabasePublishableKey:
    process.env.SUPABASE_PUBLISHABLE_KEY as string,

  supabaseSecretKey:
    process.env.SUPABASE_SECRET_KEY as string,
};