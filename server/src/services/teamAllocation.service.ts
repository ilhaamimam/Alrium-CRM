import {
  supabaseAdmin,
} from "../config/supabase";


export interface CreateTeamInput {
  name: string;

  description?:
    string | null;

  createdBy: string;
}


export interface UpdateTeamInput {
  name?: string;

  description?:
    string | null;
}


export interface AddTeamMemberInput {
  teamId: string;

  userId: string;

  roleInTeam?:
    string | null;

  addedBy: string;
}


export interface AssignProjectTeamInput {
  /*
   * IMPORTANT:
   *
   * This value can initially be:
   *
   * - a real projects.id
   *
   * OR
   *
   * - a production-ready leads.id
   *
   * The service resolves it below.
   */

  projectId: string;

  teamId: string;

  plannedStartDate?:
    string | null;

  plannedEndDate?:
    string | null;

  assignedBy: string;
}


/*
 * =========================================================
 * GET TEAMS
 * =========================================================
 */

export const getTeams =
  async () => {

    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from("teams")
        .select(`
          id,
          name,
          description,
          created_by,
          created_at,
          updated_at,

          team_members (
            team_id,
            user_id,
            role_in_team,
            added_at,

            profiles!team_members_user_id_fkey (
              id,
              full_name,
              email,
              role,
              is_active
            )
          )
        `)
        .order(
          "name",
          {
            ascending: true,
          }
        );


    if (error) {

      console.error(
        "GET TEAMS ERROR:",
        error
      );


      throw new Error(
        `Unable to load teams: ${error.message}`
      );
    }


    return (
      data ??
      []
    );
  };


/*
 * =========================================================
 * CREATE TEAM
 * =========================================================
 */

export const createTeam =
  async (
    input:
      CreateTeamInput
  ) => {

    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from("teams")
        .insert({
          name:
            input.name,

          description:
            input.description ??
            null,

          created_by:
            input.createdBy,
        })
        .select()
        .single();


    if (
      error ||
      !data
    ) {

      console.error(
        "CREATE TEAM ERROR:",
        error
      );


      throw new Error(
        `Unable to create team: ${
          error?.message ||
          "Unknown database error"
        }`
      );
    }


    return data;
  };


/*
 * =========================================================
 * UPDATE TEAM
 * =========================================================
 */

export const updateTeam =
  async (
    teamId: string,

    input:
      UpdateTeamInput
  ) => {

    const updates:
      Record<
        string,
        unknown
      > =
      {};


    if (
      input.name !==
      undefined
    ) {

      updates.name =
        input.name;
    }


    if (
      input.description !==
      undefined
    ) {

      updates.description =
        input.description;
    }


    if (
      Object.keys(
        updates
      ).length ===
      0
    ) {

      const {
        data,
        error,
      } =
        await supabaseAdmin
          .from("teams")
          .select()
          .eq(
            "id",
            teamId
          )
          .single();


      if (
        error ||
        !data
      ) {

        throw new Error(
          "Team not found"
        );
      }


      return data;
    }


    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from("teams")
        .update(
          updates
        )
        .eq(
          "id",
          teamId
        )
        .select()
        .single();


    if (
      error ||
      !data
    ) {

      console.error(
        "UPDATE TEAM ERROR:",
        error
      );


      throw new Error(
        `Unable to update team: ${
          error?.message ||
          "Unknown database error"
        }`
      );
    }


    return data;
  };


/*
 * =========================================================
 * AVAILABLE TEAM MEMBER USERS
 * =========================================================
 */

export const getAvailableTeamMemberUsers =
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
          is_active,
          availability_status
        `)
        .eq(
          "role",
          "team_member"
        )
        .eq(
          "is_active",
          true
        )
        .order(
          "email",
          {
            ascending: true,
          }
        );


    if (error) {

      console.error(
        "GET TEAM MEMBER USERS ERROR:",
        error
      );


      throw new Error(
        `Unable to load team members: ${error.message}`
      );
    }


    return (
      data ??
      []
    );
  };


/*
 * =========================================================
 * ADD MEMBER TO TEAM
 *
 * Idempotent:
 *
 * if member already belongs to the team,
 * return the existing membership instead of failing.
 * =========================================================
 */

export const addTeamMember =
  async (
    input:
      AddTeamMemberInput
  ) => {

    /*
     * Verify profile.
     */

    const {
      data:
        profile,

      error:
        profileError,
    } =
      await supabaseAdmin
        .from("profiles")
        .select(`
          id,
          role,
          is_active
        `)
        .eq(
          "id",
          input.userId
        )
        .maybeSingle();


    if (
      profileError ||
      !profile
    ) {

      throw new Error(
        "Team member user not found"
      );
    }


    if (
      profile.role !==
        "team_member"
    ) {

      throw new Error(
        "Only Team Member users can be added to teams"
      );
    }


    if (
      profile.is_active ===
      false
    ) {

      throw new Error(
        "Inactive Team Member cannot be added to a team"
      );
    }


    /*
     * Check existing membership.
     */

    const {
      data:
        existing,

      error:
        existingError,
    } =
      await supabaseAdmin
        .from("team_members")
        .select(`
          team_id,
          user_id,
          role_in_team,
          added_by,
          added_at
        `)
        .eq(
          "team_id",
          input.teamId
        )
        .eq(
          "user_id",
          input.userId
        )
        .maybeSingle();


    if (
      existingError
    ) {

      throw new Error(
        `Unable to check team membership: ${existingError.message}`
      );
    }


    /*
     * Already there = valid.
     */

    if (
      existing
    ) {

      return existing;
    }


    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from("team_members")
        .insert({
          team_id:
            input.teamId,

          user_id:
            input.userId,

          role_in_team:
            input.roleInTeam ??
            null,

          added_by:
            input.addedBy,
        })
        .select()
        .single();


    if (
      error ||
      !data
    ) {

      console.error(
        "ADD TEAM MEMBER ERROR:",
        error
      );


      throw new Error(
        `Unable to add team member: ${
          error?.message ||
          "Unknown database error"
        }`
      );
    }


    return data;
  };


/*
 * =========================================================
 * REMOVE MEMBER
 * =========================================================
 */

export const removeTeamMember =
  async (
    teamId: string,

    userId: string
  ) => {

    const {
      error,
    } =
      await supabaseAdmin
        .from("team_members")
        .delete()
        .eq(
          "team_id",
          teamId
        )
        .eq(
          "user_id",
          userId
        );


    if (
      error
    ) {

      throw new Error(
        `Unable to remove team member: ${error.message}`
      );
    }
  };


/*
 * =========================================================
 * PROJECTS AVAILABLE FOR TEAM ALLOCATION
 * =========================================================
 */

export const getProjectsForTeamAllocation =
  async () => {

    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from("projects")
        .select(`
          id,
          lead_id,
          name,
          description,
          status,
          completion_review_status,
          planned_start_date,
          planned_end_date,
          actual_start_date,
          actual_end_date,
          created_at,
          updated_at,

          leads (
            id,
            title,
            temperature,
            workflow_stage,
            estimated_budget,

            companies (
              id,
              name
            ),

            contacts (
              id,
              first_name,
              last_name,
              email
            )
          ),

          project_teams (
            team_id,
            assigned_at,

            teams (
              id,
              name
            )
          )
        `)
        .neq(
          "status",
          "done"
        )
        .order(
          "created_at",
          {
            ascending: false,
          }
        );


    if (
      error
    ) {

      console.error(
        "GET PROJECTS FOR ALLOCATION ERROR:",
        error
      );


      throw new Error(
        `Unable to load projects for team allocation: ${error.message}`
      );
    }


    return (
      data ??
      []
    );
  };


/*
 * =========================================================
 * ASSIGN PROJECT / LEAD TO TEAM
 *
 * CRITICAL CONNECTION:
 *
 * If :projectId is actually a lead ID,
 * create the projects row first.
 *
 * This is what connects:
 *
 * lead
 *   ↓
 * projects
 *   ↓
 * project_teams
 *   ↓
 * team_members
 *   ↓
 * Team Progress
 * =========================================================
 */

export const assignProjectToTeam =
  async (
    input:
      AssignProjectTeamInput
  ) => {

    /*
     * -----------------------------------------------------
     * CHECK IF ID IS ALREADY A PROJECT
     * -----------------------------------------------------
     */

    const {
      data:
        existingProject,

      error:
        existingProjectError,
    } =
      await supabaseAdmin
        .from("projects")
        .select(`
          id,
          lead_id,
          name,
          status
        `)
        .eq(
          "id",
          input.projectId
        )
        .maybeSingle();


    if (
      existingProjectError
    ) {

      throw new Error(
        `Unable to check project: ${existingProjectError.message}`
      );
    }


    let project:
      {
        id: string;

        lead_id: string;

        name: string;

        status: string;
      } |
      null =
      existingProject;


    /*
     * -----------------------------------------------------
     * NO PROJECT?
     *
     * Treat received UUID as leads.id.
     * -----------------------------------------------------
     */

    if (
      !project
    ) {

      const {
        data:
          lead,

        error:
          leadError,
      } =
        await supabaseAdmin
          .from("leads")
          .select(`
            id,
            title,
            temperature,
            workflow_stage
          `)
          .eq(
            "id",
            input.projectId
          )
          .maybeSingle();


      if (
        leadError
      ) {

        throw new Error(
          `Unable to load lead for allocation: ${leadError.message}`
        );
      }


      if (
        !lead
      ) {

        throw new Error(
          "Lead not found for team allocation"
        );
      }


      /*
       * Financial approval.
       */

      const {
        data:
          financialReview,

        error:
          financialError,
      } =
        await supabaseAdmin
          .from(
            "financial_reviews"
          )
          .select(`
            lead_id,
            decision
          `)
          .eq(
            "lead_id",
            lead.id
          )
          .maybeSingle();


      if (
        financialError
      ) {

        throw new Error(
          `Unable to verify Financial Review: ${financialError.message}`
        );
      }


      if (
        !financialReview ||
        financialReview
          .decision !==
          "approved"
      ) {

        throw new Error(
          "Lead is not financially approved"
        );
      }


      /*
       * Technical approval.
       */

      const {
        data:
          technicalReview,

        error:
          technicalError,
      } =
        await supabaseAdmin
          .from(
            "technical_reviews"
          )
          .select(`
            lead_id,
            decision
          `)
          .eq(
            "lead_id",
            lead.id
          )
          .maybeSingle();


      if (
        technicalError
      ) {

        throw new Error(
          `Unable to verify Technical Review: ${technicalError.message}`
        );
      }


      if (
        !technicalReview ||
        technicalReview
          .decision !==
          "approved"
      ) {

        throw new Error(
          "Lead is not technically approved"
        );
      }


      /*
       * Keep old lead tag in sync.
       */

      const {
        error:
          temperatureError,
      } =
        await supabaseAdmin
          .from("leads")
          .update({
            temperature:
              "hot",
          })
          .eq(
            "id",
            lead.id
          );


      if (
        temperatureError
      ) {

        console.warn(
          "UPDATE LEAD TEMPERATURE WARNING:",
          temperatureError
        );
      }


      /*
       * See if lead already has project.
       */

      const {
        data:
          existingLeadProjects,

        error:
          leadProjectError,
      } =
        await supabaseAdmin
          .from("projects")
          .select(`
            id,
            lead_id,
            name,
            status
          `)
          .eq(
            "lead_id",
            lead.id
          )
          .order(
            "created_at",
            {
              ascending:
                false,
            }
          )
          .limit(1);


      if (
        leadProjectError
      ) {

        throw new Error(
          `Unable to check lead project: ${leadProjectError.message}`
        );
      }


      if (
        existingLeadProjects &&
        existingLeadProjects
          .length >
          0
      ) {

        project =
          existingLeadProjects[0];

      } else {

        /*
         * CREATE DELIVERY PROJECT.
         */

        const {
          data:
            newProject,

          error:
            projectCreateError,
        } =
          await supabaseAdmin
            .from("projects")
            .insert({
              lead_id:
                lead.id,

              name:
                lead.title ||
                "Untitled Project",

              description:
                null,

              status:
                "pending",

              planned_start_date:
                input
                  .plannedStartDate ??
                null,

              planned_end_date:
                input
                  .plannedEndDate ??
                null,

              created_by:
                input.assignedBy,

              completion_review_status:
                "not_submitted",
            })
            .select(`
              id,
              lead_id,
              name,
              status
            `)
            .single();


        if (
          projectCreateError ||
          !newProject
        ) {

          console.error(
            "CREATE DELIVERY PROJECT ERROR:",
            projectCreateError
          );


          throw new Error(
            `Unable to create delivery project: ${
              projectCreateError
                ?.message ||
              "Unknown database error"
            }`
          );
        }


        project =
          newProject;
      }
    }


    if (
      !project
    ) {

      throw new Error(
        "Unable to resolve delivery project"
      );
    }


    if (
      project.status ===
      "done"
    ) {

      throw new Error(
        "Completed project cannot be reallocated"
      );
    }


    /*
     * -----------------------------------------------------
     * VERIFY TEAM
     * -----------------------------------------------------
     */

    const {
      data:
        team,

      error:
        teamError,
    } =
      await supabaseAdmin
        .from("teams")
        .select(`
          id,
          name
        `)
        .eq(
          "id",
          input.teamId
        )
        .maybeSingle();


    if (
      teamError
    ) {

      throw new Error(
        `Unable to verify team: ${teamError.message}`
      );
    }


    if (
      !team
    ) {

      throw new Error(
        "Selected team does not exist"
      );
    }


    /*
     * -----------------------------------------------------
     * VERIFY TEAM HAS MEMBERS
     * -----------------------------------------------------
     */

    const {
      data:
        members,

      error:
        memberError,
    } =
      await supabaseAdmin
        .from("team_members")
        .select(`
          team_id,
          user_id
        `)
        .eq(
          "team_id",
          team.id
        );


    if (
      memberError
    ) {

      throw new Error(
        `Unable to verify team members: ${memberError.message}`
      );
    }


    if (
      !members ||
      members.length ===
        0
    ) {

      throw new Error(
        "Selected team does not contain any team members"
      );
    }


    /*
     * -----------------------------------------------------
     * ONE ACTIVE TEAM PER PROJECT
     * -----------------------------------------------------
     */

    const {
      error:
        removeOldAllocationError,
    } =
      await supabaseAdmin
        .from("project_teams")
        .delete()
        .eq(
          "project_id",
          project.id
        );


    if (
      removeOldAllocationError
    ) {

      throw new Error(
        `Unable to replace previous allocation: ${removeOldAllocationError.message}`
      );
    }


    /*
     * -----------------------------------------------------
     * CREATE PROJECT ↔ TEAM CONNECTION
     * -----------------------------------------------------
     */

    const {
      data:
        allocation,

      error:
        allocationError,
    } =
      await supabaseAdmin
        .from("project_teams")
        .insert({
          project_id:
            project.id,

          team_id:
            team.id,

          assigned_by:
            input.assignedBy,
        })
        .select(`
          project_id,
          team_id,
          assigned_by,
          assigned_at
        `)
        .single();


    if (
      allocationError ||
      !allocation
    ) {

      console.error(
        "PROJECT TEAM ALLOCATION ERROR:",
        allocationError
      );


      throw new Error(
        `Unable to connect project to team: ${
          allocationError
            ?.message ||
          "Unknown database error"
        }`
      );
    }


    /*
     * -----------------------------------------------------
     * UPDATE PROJECT
     * -----------------------------------------------------
     */

    const {
      data:
        updatedProject,

      error:
        updateError,
    } =
      await supabaseAdmin
        .from("projects")
        .update({
          status:
            "assigned",

          planned_start_date:
            input
              .plannedStartDate ??
            null,

          planned_end_date:
            input
              .plannedEndDate ??
            null,

          completion_review_status:
            "not_submitted",

          team_completed_at:
            null,

          team_completed_by:
            null,

          senior_reviewed_at:
            null,

          senior_reviewed_by:
            null,

          senior_review_notes:
            null,

          final_update_at:
            null,
        })
        .eq(
          "id",
          project.id
        )
        .select(`
          id,
          lead_id,
          name,
          description,
          status,
          planned_start_date,
          planned_end_date,
          completion_review_status,
          created_at,
          updated_at
        `)
        .single();


    if (
      updateError ||
      !updatedProject
    ) {

      throw new Error(
        `Unable to update allocated project: ${
          updateError
            ?.message ||
          "Unknown database error"
        }`
      );
    }


    /*
     * Activity is non-critical.
     */

    const {
      error:
        activityError,
    } =
      await supabaseAdmin
        .from("activities")
        .insert({
          user_id:
            input.assignedBy,

          entity_type:
            "project",

          entity_id:
            project.id,

          action:
            "team_assigned",

          description:
            `Project assigned to team ${team.name}`,

          metadata: {
            teamId:
              team.id,

            teamName:
              team.name,

            leadId:
              updatedProject
                .lead_id,

            plannedStartDate:
              input
                .plannedStartDate,

            plannedEndDate:
              input
                .plannedEndDate,
          },
        });


    if (
      activityError
    ) {

      console.warn(
        "TEAM ALLOCATION ACTIVITY WARNING:",
        activityError
      );
    }


    return {
      ...updatedProject,

      project_team:
        allocation,

      allocated_team: {
        id:
          team.id,

        name:
          team.name,

        members:
          members,
      },
    };
  };


/*
 * =========================================================
 * TEAM ASSIGNED PROJECTS
 * =========================================================
 */

export const getTeamAssignedProjects =
  async (
    teamId?: string
  ) => {

    let query =
      supabaseAdmin
        .from("project_teams")
        .select(`
          project_id,
          team_id,
          assigned_by,
          assigned_at,

          teams (
            id,
            name,
            description
          ),

          projects (
            id,
            lead_id,
            name,
            description,
            status,
            completion_review_status,
            planned_start_date,
            planned_end_date,
            actual_start_date,
            actual_end_date,
            updated_at,

            leads (
              id,
              title,
              estimated_budget,
              temperature,
              workflow_stage,

              companies (
                id,
                name
              ),

              contacts (
                id,
                first_name,
                last_name,
                email
              )
            )
          )
        `)
        .order(
          "assigned_at",
          {
            ascending:
              false,
          }
        );


    if (
      teamId
    ) {

      query =
        query.eq(
          "team_id",
          teamId
        );
    }


    const {
      data,
      error,
    } =
      await query;


    if (
      error
    ) {

      console.error(
        "GET TEAM ASSIGNED PROJECTS ERROR:",
        error
      );


      throw new Error(
        `Unable to load team assigned projects: ${error.message}`
      );
    }


    return (
      data ??
      []
    );
  };