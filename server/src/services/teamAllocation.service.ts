import {
  supabaseAdmin,
} from "../config/supabase";


export interface CreateTeamInput {
  name: string;

  description?: string | null;

  createdBy: string;
}


export interface UpdateTeamInput {
  name?: string;

  description?: string | null;
}


export interface AddTeamMemberInput {
  teamId: string;

  userId: string;

  roleInTeam?: string | null;

  addedBy: string;
}


export interface AssignProjectTeamInput {
  projectId: string;

  teamId: string;

  plannedStartDate?: string | null;

  plannedEndDate?: string | null;

  assignedBy: string;
}


/*
 * ========================================================
 * GET ALL TEAMS
 * ========================================================
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


    return data;
  };


/*
 * ========================================================
 * CREATE TEAM
 * ========================================================
 */

export const createTeam =
  async (
    input: CreateTeamInput
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
            input.description ||
            null,

          created_by:
            input.createdBy,
        })
        .select()
        .single();


    if (error) {
      console.error(
        "CREATE TEAM ERROR:",
        error
      );

      throw new Error(
        `Unable to create team: ${error.message}`
      );
    }


    return data;
  };


/*
 * ========================================================
 * UPDATE TEAM
 * ========================================================
 */

export const updateTeam =
  async (
    teamId: string,
    input: UpdateTeamInput
  ) => {

    const updates:
      Record<string, unknown> =
      {};


    if (
      input.name !== undefined
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


    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from("teams")
        .update(updates)
        .eq(
          "id",
          teamId
        )
        .select()
        .single();


    if (error) {
      console.error(
        "UPDATE TEAM ERROR:",
        error
      );

      throw new Error(
        `Unable to update team: ${error.message}`
      );
    }


    return data;
  };


/*
 * ========================================================
 * GET AVAILABLE TEAM MEMBER USERS
 *
 * Only active users with team_member CRM role.
 * ========================================================
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
          is_active
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


    return data;
  };


/*
 * ========================================================
 * ADD MEMBER TO TEAM
 * ========================================================
 */

export const addTeamMember =
  async (
    input: AddTeamMemberInput
  ) => {

    /*
     * Verify that this user is an
     * active Team Member.
     */

    const {
      data: profile,
      error: profileError,
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
        .single();


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
        "team_member" ||
      !profile.is_active
    ) {
      throw new Error(
        "Only active Team Member users can be added to teams"
      );
    }


    /*
     * Check for duplicate membership.
     */

    const {
      data: existing,
      error: existingError,
    } =
      await supabaseAdmin
        .from("team_members")
        .select(`
          team_id,
          user_id
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


    if (existingError) {
      throw new Error(
        `Unable to check team membership: ${existingError.message}`
      );
    }


    if (existing) {
      throw new Error(
        "This user is already a member of the selected team"
      );
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
            input.roleInTeam ||
            null,

          added_by:
            input.addedBy,
        })
        .select()
        .single();


    if (error) {
      console.error(
        "ADD TEAM MEMBER ERROR:",
        error
      );

      throw new Error(
        `Unable to add team member: ${error.message}`
      );
    }


    return data;
  };


/*
 * ========================================================
 * REMOVE MEMBER FROM TEAM
 * ========================================================
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


    if (error) {
      console.error(
        "REMOVE TEAM MEMBER ERROR:",
        error
      );

      throw new Error(
        `Unable to remove team member: ${error.message}`
      );
    }
  };


/*
 * ========================================================
 * GET APPROVED LEAD BOARD PROJECTS
 *
 * These are the projects available for team allocation.
 * ========================================================
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


    if (error) {
      console.error(
        "GET PROJECTS FOR ALLOCATION ERROR:",
        error
      );

      throw new Error(
        `Unable to load projects for team allocation: ${error.message}`
      );
    }


    return data;
  };


/*
 * ========================================================
 * ASSIGN / CHANGE TEAM FOR PROJECT
 *
 * One project has one active team for this sprint.
 *
 * If a project already has a team, remove that allocation
 * first and replace it with the newly selected team.
 * ========================================================
 */

export const assignProjectToTeam =
  async (
    input: AssignProjectTeamInput
  ) => {

    /*
     * Verify project exists.
     */

    const {
      data: project,
      error: projectError,
    } =
      await supabaseAdmin
        .from("projects")
        .select(`
          id,
          lead_id,
          status
        `)
        .eq(
          "id",
          input.projectId
        )
        .single();


    if (
      projectError ||
      !project
    ) {
      throw new Error(
        "Approved Lead Board project not found"
      );
    }


    /*
     * Verify team exists.
     */

    const {
      data: team,
      error: teamError,
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
        .single();


    if (
      teamError ||
      !team
    ) {
      throw new Error(
        "Selected team does not exist"
      );
    }


    /*
     * Remove previous team allocation.
     *
     * This allows Senior Manager to
     * change the assigned team later.
     */

    const {
      error: deleteError,
    } =
      await supabaseAdmin
        .from("project_teams")
        .delete()
        .eq(
          "project_id",
          input.projectId
        );


    if (deleteError) {
      throw new Error(
        `Unable to replace existing team allocation: ${deleteError.message}`
      );
    }


    /*
     * Create new allocation.
     */

    const {
      error: allocationError,
    } =
      await supabaseAdmin
        .from("project_teams")
        .insert({
          project_id:
            input.projectId,

          team_id:
            input.teamId,

          assigned_by:
            input.assignedBy,
        });


    if (allocationError) {
      console.error(
        "PROJECT TEAM ALLOCATION ERROR:",
        allocationError
      );

      throw new Error(
        `Unable to allocate team: ${allocationError.message}`
      );
    }


    /*
     * Update timeline and board status.
     */

    const projectUpdates:
      Record<string, unknown> =
      {
        status:
          "assigned",
      };


    if (
      input.plannedStartDate !==
      undefined
    ) {
      projectUpdates
        .planned_start_date =
          input.plannedStartDate;
    }


    if (
      input.plannedEndDate !==
      undefined
    ) {
      projectUpdates
        .planned_end_date =
          input.plannedEndDate;
    }


    const {
      data: updatedProject,
      error: updateError,
    } =
      await supabaseAdmin
        .from("projects")
        .update(
          projectUpdates
        )
        .eq(
          "id",
          input.projectId
        )
        .select(`
          id,
          lead_id,
          name,
          description,
          status,
          planned_start_date,
          planned_end_date,
          updated_at
        `)
        .single();


    if (updateError) {
      throw new Error(
        `Team was allocated but project timeline could not be updated: ${updateError.message}`
      );
    }


    /*
     * Activity history.
     */

    await supabaseAdmin
      .from("activities")
      .insert({
        user_id:
          input.assignedBy,

        entity_type:
          "project",

        entity_id:
          input.projectId,

        action:
          "team_assigned",

        description:
          `Project assigned to team ${team.name}`,

        metadata: {
          teamId:
            team.id,

          teamName:
            team.name,

          plannedStartDate:
            input.plannedStartDate,

          plannedEndDate:
            input.plannedEndDate,
        },
      });


    return updatedProject;
  };


/*
 * ========================================================
 * GET TEAM-ASSIGNED LEADS / PROJECTS
 *
 * Optional teamId enables filtering.
 * ========================================================
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
            ascending: false,
          }
        );


    if (teamId) {
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


    if (error) {
      console.error(
        "GET TEAM ASSIGNED PROJECTS ERROR:",
        error
      );

      throw new Error(
        `Unable to load team assigned leads: ${error.message}`
      );
    }


    return data;
  };