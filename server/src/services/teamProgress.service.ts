import {
  supabaseAdmin,
} from "../config/supabase";


export type ProjectProgressStatus =
  | "assigned"
  | "ongoing"
  | "on_hold"
  | "done";


export type TaskProgressStatus =
  | "pending"
  | "ongoing"
  | "on_hold"
  | "done";


export interface CreateTaskInput {
  projectId: string;

  title: string;

  description?: string | null;

  assignedTo?: string | null;

  dueDate?: string | null;

  createdBy: string;
}


/*
 * ========================================================
 * FIND PROJECTS THE CURRENT USER CAN ACCESS
 *
 * Team Member:
 * only projects allocated to one of their teams.
 *
 * Senior Manager:
 * all team-allocated projects.
 * ========================================================
 */

const getAccessibleProjectIds =
  async (
    userId: string,
    role: string
  ): Promise<string[]> => {

    /*
     * Senior Manager can view
     * every team-assigned project.
     */
    if (
      role === "senior_manager"
    ) {
      const {
        data,
        error,
      } =
        await supabaseAdmin
          .from("project_teams")
          .select(
            "project_id"
          );


      if (error) {
        throw new Error(
          `Unable to load project access: ${error.message}`
        );
      }


      return [
        ...new Set(
          (data ?? []).map(
            (row) =>
              row.project_id
          )
        ),
      ];
    }


    /*
     * Team Member:
     * first find their teams.
     */
    const {
      data: memberships,
      error: membershipError,
    } =
      await supabaseAdmin
        .from("team_members")
        .select(
          "team_id"
        )
        .eq(
          "user_id",
          userId
        );


    if (membershipError) {
      throw new Error(
        `Unable to load team memberships: ${membershipError.message}`
      );
    }


    const teamIds =
      [
        ...new Set(
          (memberships ?? []).map(
            (row) =>
              row.team_id
          )
        ),
      ];


    if (
      teamIds.length === 0
    ) {
      return [];
    }


    /*
     * Find projects allocated
     * to those teams.
     */
    const {
      data: allocations,
      error: allocationError,
    } =
      await supabaseAdmin
        .from("project_teams")
        .select(
          "project_id"
        )
        .in(
          "team_id",
          teamIds
        );


    if (allocationError) {
      throw new Error(
        `Unable to load project allocations: ${allocationError.message}`
      );
    }


    return [
      ...new Set(
        (allocations ?? []).map(
          (row) =>
            row.project_id
        )
      ),
    ];
  };


/*
 * ========================================================
 * GET PROJECTS ASSIGNED TO CURRENT TEAM MEMBER
 * ========================================================
 */

export const getTeamProgressProjects =
  async (
    userId: string,
    role: string
  ) => {

    const projectIds =
      await getAccessibleProjectIds(
        userId,
        role
      );


    if (
      projectIds.length === 0
    ) {
      return [];
    }


    const {
      data: projects,
      error: projectError,
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
          completion_notes,
          created_at,
          updated_at,

          leads (
            id,
            title,
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
        `)
        .in(
          "id",
          projectIds
        )
        .order(
          "updated_at",
          {
            ascending: false,
          }
        );


    if (projectError) {
      console.error(
        "GET TEAM PROGRESS PROJECTS ERROR:",
        projectError
      );

      throw new Error(
        `Unable to load assigned projects: ${projectError.message}`
      );
    }


    /*
     * Get allocated teams.
     */
    const {
      data: allocations,
      error: allocationError,
    } =
      await supabaseAdmin
        .from("project_teams")
        .select(`
          project_id,
          team_id,
          assigned_at,

          teams (
            id,
            name
          )
        `)
        .in(
          "project_id",
          projectIds
        );


    if (allocationError) {
      throw new Error(
        `Unable to load allocated teams: ${allocationError.message}`
      );
    }


    /*
     * Get tasks so we can show
     * task completion summaries.
     */
    const {
      data: tasks,
      error: taskError,
    } =
      await supabaseAdmin
        .from("tasks")
        .select(`
          project_id,
          status
        `)
        .in(
          "project_id",
          projectIds
        );


    if (taskError) {
      throw new Error(
        `Unable to load task progress: ${taskError.message}`
      );
    }


    return (
      projects ?? []
    ).map(
      (project) => {

        const projectTasks =
          (tasks ?? []).filter(
            (task) =>
              task.project_id ===
              project.id
          );


        const allocatedTeams =
          (allocations ?? []).filter(
            (allocation) =>
              allocation.project_id ===
              project.id
          );


        return {
          ...project,

          allocated_teams:
            allocatedTeams,

          task_summary: {
            total:
              projectTasks.length,

            pending:
              projectTasks.filter(
                (task) =>
                  task.status ===
                  "pending"
              ).length,

            ongoing:
              projectTasks.filter(
                (task) =>
                  task.status ===
                  "ongoing"
              ).length,

            on_hold:
              projectTasks.filter(
                (task) =>
                  task.status ===
                  "on_hold"
              ).length,

            done:
              projectTasks.filter(
                (task) =>
                  task.status ===
                  "done"
              ).length,
          },
        };
      }
    );
  };


/*
 * ========================================================
 * GET ONE ASSIGNED PROJECT
 * ========================================================
 */

export const getTeamProgressProjectById =
  async (
    projectId: string,
    userId: string,
    role: string
  ) => {

    const accessibleProjectIds =
      await getAccessibleProjectIds(
        userId,
        role
      );


    if (
      !accessibleProjectIds.includes(
        projectId
      )
    ) {
      throw new Error(
        "You do not have access to this project"
      );
    }


    const {
      data: project,
      error: projectError,
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
          completion_notes,
          created_at,
          updated_at,

          leads (
            id,
            title,
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
              email,
              phone
            )
          )
        `)
        .eq(
          "id",
          projectId
        )
        .single();


    if (
      projectError ||
      !project
    ) {
      throw new Error(
        "Project not found"
      );
    }


    /*
     * Allocated teams.
     */
    const {
      data: allocations,
      error: allocationError,
    } =
      await supabaseAdmin
        .from("project_teams")
        .select(`
          project_id,
          team_id,
          assigned_at,

          teams (
            id,
            name,
            description
          )
        `)
        .eq(
          "project_id",
          projectId
        );


    if (allocationError) {
      throw new Error(
        `Unable to load allocated team: ${allocationError.message}`
      );
    }


    const teamIds =
      (allocations ?? []).map(
        (allocation) =>
          allocation.team_id
      );


    /*
     * Team members available
     * for task assignment.
     */
    let availableMembers:
      Array<{
        id: string;
        full_name: string | null;
        email: string;
        role_in_team: string | null;
      }> =
      [];


    if (
      teamIds.length > 0
    ) {
      const {
        data: memberships,
        error: memberError,
      } =
        await supabaseAdmin
          .from("team_members")
          .select(`
            team_id,
            user_id,
            role_in_team
          `)
          .in(
            "team_id",
            teamIds
          );


      if (memberError) {
        throw new Error(
          `Unable to load team members: ${memberError.message}`
        );
      }


      const userIds =
        [
          ...new Set(
            (memberships ?? []).map(
              (member) =>
                member.user_id
            )
          ),
        ];


      if (
        userIds.length > 0
      ) {
        const {
          data: profiles,
          error: profileError,
        } =
          await supabaseAdmin
            .from("profiles")
            .select(`
              id,
              full_name,
              email
            `)
            .in(
              "id",
              userIds
            );


        if (profileError) {
          throw new Error(
            `Unable to load member profiles: ${profileError.message}`
          );
        }


        availableMembers =
          (memberships ?? [])
            .map(
              (membership) => {

                const profile =
                  (profiles ?? [])
                    .find(
                      (item) =>
                        item.id ===
                        membership.user_id
                    );


                if (!profile) {
                  return null;
                }


                return {
                  id:
                    profile.id,

                  full_name:
                    profile.full_name,

                  email:
                    profile.email,

                  role_in_team:
                    membership.role_in_team,
                };
              }
            )
            .filter(
              (
                member
              ): member is {
                id: string;
                full_name: string | null;
                email: string;
                role_in_team: string | null;
              } =>
                member !== null
            );
      }
    }


    /*
     * Tasks.
     */
    const {
      data: tasks,
      error: taskError,
    } =
      await supabaseAdmin
        .from("tasks")
        .select(`
          id,
          project_id,
          title,
          description,
          assigned_to,
          status,
          due_date,
          completed_at,
          created_by,
          created_at,
          updated_at
        `)
        .eq(
          "project_id",
          projectId
        )
        .order(
          "created_at",
          {
            ascending: false,
          }
        );


    if (taskError) {
      throw new Error(
        `Unable to load project tasks: ${taskError.message}`
      );
    }


    const taskAssigneeIds =
      [
        ...new Set(
          (tasks ?? [])
            .map(
              (task) =>
                task.assigned_to
            )
            .filter(
              (
                value
              ): value is string =>
                Boolean(value)
            )
        ),
      ];


    let assigneeProfiles:
      Array<{
        id: string;
        full_name: string | null;
        email: string;
      }> =
      [];


    if (
      taskAssigneeIds.length >
      0
    ) {
      const {
        data,
        error,
      } =
        await supabaseAdmin
          .from("profiles")
          .select(`
            id,
            full_name,
            email
          `)
          .in(
            "id",
            taskAssigneeIds
          );


      if (!error) {
        assigneeProfiles =
          data ?? [];
      }
    }


    const tasksWithAssignee =
      (tasks ?? []).map(
        (task) => ({
          ...task,

          assignee:
            assigneeProfiles.find(
              (profile) =>
                profile.id ===
                task.assigned_to
            ) ?? null,
        })
      );


    return {
      ...project,

      allocated_teams:
        allocations ?? [],

      available_members:
        availableMembers,

      tasks:
        tasksWithAssignee,
    };
  };


/*
 * ========================================================
 * UPDATE PROJECT STATUS
 * ========================================================
 */

export const updateProjectProgressStatus =
  async (
    projectId: string,
    status:
      ProjectProgressStatus,
    completionNotes:
      string | null,
    userId: string,
    role: string
  ) => {

    const accessibleIds =
      await getAccessibleProjectIds(
        userId,
        role
      );


    if (
      !accessibleIds.includes(
        projectId
      )
    ) {
      throw new Error(
        "You do not have access to this project"
      );
    }


    const {
      data: currentProject,
      error: currentError,
    } =
      await supabaseAdmin
        .from("projects")
        .select(`
          id,
          status,
          actual_start_date
        `)
        .eq(
          "id",
          projectId
        )
        .single();


    if (
      currentError ||
      !currentProject
    ) {
      throw new Error(
        "Project not found"
      );
    }


    const updates:
      Record<string, unknown> =
      {
        status,
      };


    /*
     * First time work starts.
     */
    if (
      status === "ongoing" &&
      !currentProject
        .actual_start_date
    ) {
      updates.actual_start_date =
        new Date()
          .toISOString()
          .slice(
            0,
            10
          );
    }


    /*
     * Project completed.
     */
    if (
      status === "done"
    ) {
      updates.actual_end_date =
        new Date()
          .toISOString()
          .slice(
            0,
            10
          );


      if (
        completionNotes
      ) {
        updates.completion_notes =
          completionNotes;
      }
    }


    /*
     * If project is reopened,
     * clear end date.
     */
    if (
      status !== "done"
    ) {
      updates.actual_end_date =
        null;
    }


    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from("projects")
        .update(updates)
        .eq(
          "id",
          projectId
        )
        .select()
        .single();


    if (error) {
      console.error(
        "UPDATE PROJECT STATUS ERROR:",
        error
      );

      throw new Error(
        `Unable to update project status: ${error.message}`
      );
    }


    /*
     * Activity log.
     */
    await supabaseAdmin
      .from("activities")
      .insert({
        user_id:
          userId,

        entity_type:
          "project",

        entity_id:
          projectId,

        action:
          "status_updated",

        description:
          `Project status changed to ${status}`,

        metadata: {
          status,
        },
      });


    return data;
  };


/*
 * ========================================================
 * CREATE PROJECT TASK
 * ========================================================
 */

export const createProjectTask =
  async (
    input:
      CreateTaskInput,
    role: string
  ) => {

    const accessibleIds =
      await getAccessibleProjectIds(
        input.createdBy,
        role
      );


    if (
      !accessibleIds.includes(
        input.projectId
      )
    ) {
      throw new Error(
        "You do not have access to this project"
      );
    }


    const assignedTo =
      input.assignedTo ||
      input.createdBy;


    /*
     * Validate the assignee belongs
     * to a team allocated to project.
     */
    const {
      data: allocations,
      error: allocationError,
    } =
      await supabaseAdmin
        .from("project_teams")
        .select(
          "team_id"
        )
        .eq(
          "project_id",
          input.projectId
        );


    if (allocationError) {
      throw new Error(
        `Unable to validate project team: ${allocationError.message}`
      );
    }


    const teamIds =
      (allocations ?? []).map(
        (item) =>
          item.team_id
      );


    if (
      teamIds.length === 0
    ) {
      throw new Error(
        "This project does not have an allocated team"
      );
    }


    const {
      data: membership,
      error: membershipError,
    } =
      await supabaseAdmin
        .from("team_members")
        .select(`
          team_id,
          user_id
        `)
        .eq(
          "user_id",
          assignedTo
        )
        .in(
          "team_id",
          teamIds
        )
        .maybeSingle();


    if (
      membershipError ||
      !membership
    ) {
      throw new Error(
        "Selected task assignee does not belong to the allocated project team"
      );
    }


    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from("tasks")
        .insert({
          project_id:
            input.projectId,

          title:
            input.title,

          description:
            input.description ||
            null,

          assigned_to:
            assignedTo,

          status:
            "pending",

          due_date:
            input.dueDate ||
            null,

          created_by:
            input.createdBy,
        })
        .select()
        .single();


    if (error) {
      console.error(
        "CREATE TASK ERROR:",
        error
      );

      throw new Error(
        `Unable to create task: ${error.message}`
      );
    }


    return data;
  };


/*
 * ========================================================
 * UPDATE TASK STATUS
 * ========================================================
 */

export const updateTaskProgressStatus =
  async (
    taskId: string,
    status:
      TaskProgressStatus,
    userId: string,
    role: string
  ) => {

    const {
      data: task,
      error: taskError,
    } =
      await supabaseAdmin
        .from("tasks")
        .select(`
          id,
          project_id,
          assigned_to
        `)
        .eq(
          "id",
          taskId
        )
        .single();


    if (
      taskError ||
      !task
    ) {
      throw new Error(
        "Task not found"
      );
    }


    const accessibleIds =
      await getAccessibleProjectIds(
        userId,
        role
      );


    if (
      !accessibleIds.includes(
        task.project_id
      )
    ) {
      throw new Error(
        "You do not have access to this task"
      );
    }


    const updates:
      Record<string, unknown> =
      {
        status,
      };


    if (
      status === "done"
    ) {
      updates.completed_at =
        new Date()
          .toISOString();
    } else {
      updates.completed_at =
        null;
    }


    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from("tasks")
        .update(
          updates
        )
        .eq(
          "id",
          taskId
        )
        .select()
        .single();


    if (error) {
      console.error(
        "UPDATE TASK STATUS ERROR:",
        error
      );

      throw new Error(
        `Unable to update task: ${error.message}`
      );
    }


    await supabaseAdmin
      .from("activities")
      .insert({
        user_id:
          userId,

        entity_type:
          "task",

        entity_id:
          taskId,

        action:
          "status_updated",

        description:
          `Task status changed to ${status}`,

        metadata: {
          status,
          projectId:
            task.project_id,
        },
      });


    return data;
  };