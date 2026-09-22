import {
  supabaseAdmin,
} from "../config/supabase";


/*
 * =========================================================
 * ALL LEADS
 * =========================================================
 */

export const getPipelineLeads =
  async () => {

    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from(
          "lead_pipeline_v"
        )
        .select("*")
        .order(
          "created_at",
          {
            ascending: false,
          }
        );


    if (error) {

      console.error(
        "PIPELINE LEADS ERROR:",
        error
      );


      throw new Error(
        error.message
      );
    }


    return data ?? [];
  };


/*
 * =========================================================
 * PRODUCTION READY
 *
 * Finance approved
 * +
 * Technical approved
 * +
 * HOT
 * =========================================================
 */

export const getProductionReadyPipelineLeads =
  async () => {

    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from(
          "lead_pipeline_v"
        )
        .select("*")
        .eq(
          "technical_decision",
          "approved"
        )
        .eq(
          "status",
          "hot"
        )
        .order(
          "created_at",
          {
            ascending: false,
          }
        );


    if (error) {

      console.error(
        "PRODUCTION READY ERROR:",
        error
      );


      throw new Error(
        error.message
      );
    }


    return data ?? [];
  };


/*
 * =========================================================
 * TEAMS
 * =========================================================
 */

export const getPipelineTeams =
  async () => {

    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from("teams")
        .select("*")
        .order(
          "created_at",
          {
            ascending: false,
          }
        );


    if (error) {

      console.error(
        "PIPELINE TEAMS ERROR:",
        error
      );


      throw new Error(
        error.message
      );
    }


    return data ?? [];
  };


/*
 * =========================================================
 * TEAM MEMBERS
 * =========================================================
 */

export const getPipelineTeamMembers =
  async () => {

    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from("profiles")
        .select(`
          id,
          full_name,
          email,
          role,
          availability_status
        `)
        .eq(
          "role",
          "team_member"
        )
        .eq(
          "availability_status",
          "available"
        )
        .order(
          "email",
          {
            ascending: true,
          }
        );


    if (error) {

      console.error(
        "PIPELINE MEMBERS ERROR:",
        error
      );


      throw new Error(
        error.message
      );
    }


    return data ?? [];
  };