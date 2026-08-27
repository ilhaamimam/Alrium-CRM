import { supabaseAdmin } from "../config/supabase";

export const getProfileByUserId = async (
  userId: string
) => {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select(
      `
      id,
      full_name,
      email,
      role,
      is_active,
      created_at,
      updated_at
      `
    )
    .eq("id", userId)
    .single();

  if (error) {
    throw new Error(
      `Failed to load user profile: ${error.message}`
    );
  }

  return data;
};

export const getSalesRepresentatives =
  async () => {
    const { data, error } =
      await supabaseAdmin
        .from("profiles")
        .select(`
          id,
          full_name,
          email,
          role
        `)
        .eq("role", "sales_rep")
        .eq("is_active", true)
        .order("email");


    if (error) {
      throw new Error(
        `Unable to load sales representatives: ${error.message}`
      );
    }


    return data;
  };