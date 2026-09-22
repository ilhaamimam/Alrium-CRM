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

  description?:
    string | null;

  assignedTo?:
    string | null;

  dueDate?:
    string | null;

  createdBy: string;
}


/*
 * =========================================================
 * ACCESSIBLE PROJECT IDS
 *
 * team_member:
 * projects allocated to one of their teams
 *
 * sales_manager:
 * all allocated projects
 *
 * senior_manager:
 * all allocated projects
 * =========================================================
 */

const getAccessibleProjectIds =
  async (
    userId: string,

    role: string
  ):
    Promise<string[]> => {

    /*
     * Management sees all team allocations.
     */

    if (
      role ===
        "senior_manager" ||
      role ===
        "sales_manager"
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


      if (
        error
      ) {

        throw new Error(
          `Unable to load management project access: ${error.message}`
        );
      }


      return [
        ...new Set(
          (
            data ??
            []
          ).map(
            (
              row
            ) =>
              row.project_id
          )
        ),
      ];
    }


    /*
     * Team member:
     * find their team memberships.
     */

    const {
      data:
        memberships,

      error:
        membershipError,
    } =
      await supabaseAdmin
        .from("team_members")
        .select(`
          team_id
        `)
        .eq(
          "user_id",
          userId
        );


    if (
      membershipError
    ) {

      throw new Error(
        `Unable to load team memberships: ${membershipError.message}`
      );
    }


    const teamIds =
      [
        ...new Set(
          (
            memberships ??
            []
          ).map(
            (
              membership
            ) =>
              membership.team_id
          )
        ),
      ];


    if (
      teamIds.length ===
      0
    ) {

      return [];
    }


    /*
     * Find projects allocated to those teams.
     */

    const {
      data:
        allocations,

      error:
        allocationError,
    } =
      await supabaseAdmin
        .from("project_teams")
        .select(`
          project_id
        `)
        .in(
          "team_id",
          teamIds
        );


    if (
      allocationError
    ) {

      throw new Error(
        `Unable to load project allocations: ${allocationError.message}`
      );
    }


    return [
      ...new Set(
        (
          allocations ??
          []
        ).map(
          (
            allocation
          ) =>
            allocation
              .project_id
        )
      ),
    ];
  };


/*
 * =========================================================
 * LIST TEAM PROGRESS PROJECTS
 * =========================================================
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
      projectIds.length ===
      0
    ) {

      return [];
    }


    const {
      data:
        projects,

      error:
        projectError,
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
          completion_notes,
          team_completed_at,
          team_completed_by,
          senior_review_notes,
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
              email,
              phone
            )
          )
        `)
        .in(
          "id",
          projectIds
        )
        .neq(
          "status",
          "done"
        )
        .order(
          "updated_at",
          {
            ascending:
              false,
          }
        );


    if (
      projectError
    ) {

      console.error(
        "GET TEAM PROGRESS PROJECTS ERROR:",
        projectError
      );


      throw new Error(
        `Unable to load assigned projects: ${projectError.message}`
      );
    }


    /*
     * Allocated teams.
     */

    const {
      data:
        allocations,

      error:
        allocationError,
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
        .in(
          "project_id",
          projectIds
        );


    if (
      allocationError
    ) {

      throw new Error(
        `Unable to load allocated teams: ${allocationError.message}`
      );
    }


    /*
     * Tasks.
     */

    const {
      data:
        tasks,

      error:
        taskError,
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


    if (
      taskError
    ) {

      throw new Error(
        `Unable to load task progress: ${taskError.message}`
      );
    }


    return (
      projects ??
      []
    ).map(
      (
        project
      ) => {

        const projectTasks =
          (
            tasks ??
            []
          ).filter(
            (
              task
            ) =>
              task.project_id ===
              project.id
          );


        const allocatedTeams =
          (
            allocations ??
            []
          ).filter(
            (
              allocation
            ) =>
              allocation
                .project_id ===
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
                (
                  task
                ) =>
                  task.status ===
                  "pending"
              ).length,

            ongoing:
              projectTasks.filter(
                (
                  task
                ) =>
                  task.status ===
                  "ongoing"
              ).length,

            on_hold:
              projectTasks.filter(
                (
                  task
                ) =>
                  task.status ===
                  "on_hold"
              ).length,

            done:
              projectTasks.filter(
                (
                  task
                ) =>
                  task.status ===
                  "done"
              ).length,
          },
        };
      }
    );
  };


/*
 * =========================================================
 * GET ONE PROJECT
 * =========================================================
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
      !accessibleProjectIds
        .includes(
          projectId
        )
    ) {

      throw new Error(
        "You do not have access to this project"
      );
    }


    const {
      data:
        project,

      error:
        projectError,
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
          completion_notes,
          team_completed_at,
          team_completed_by,
          senior_review_notes,
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
     * Team allocation.
     */

    const {
      data:
        allocations,

      error:
        allocationError,
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


    if (
      allocationError
    ) {

      throw new Error(
        `Unable to load allocated team: ${allocationError.message}`
      );
    }


    const teamIds =
      (
        allocations ??
        []
      ).map(
        (
          allocation
        ) =>
          allocation.team_id
      );


    /*
     * Members from allocated teams.
     */

    let availableMembers:
      Array<{
        id: string;

        full_name:
          string | null;

        email: string;

        role_in_team:
          string | null;
      }> =
      [];


    if (
      teamIds.length >
      0
    ) {

      const {
        data:
          memberships,

        error:
          membershipError,
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


      if (
        membershipError
      ) {

        throw new Error(
          `Unable to load team members: ${membershipError.message}`
        );
      }


      const memberIds =
        [
          ...new Set(
            (
              memberships ??
              []
            ).map(
              (
                membership
              ) =>
                membership.user_id
            )
          ),
        ];


      if (
        memberIds.length >
        0
      ) {

        const {
          data:
            profiles,

          error:
            profilesError,
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
              memberIds
            );


        if (
          profilesError
        ) {

          throw new Error(
            `Unable to load team profiles: ${profilesError.message}`
          );
        }


        availableMembers =
          (
            memberships ??
            []
          )
            .map(
              (
                membership
              ) => {

                const profile =
                  (
                    profiles ??
                    []
                  ).find(
                    (
                      item
                    ) =>
                      item.id ===
                      membership
                        .user_id
                  );


                if (
                  !profile
                ) {

                  return null;
                }


                return {
                  id:
                    profile.id,

                  full_name:
                    profile
                      .full_name,

                  email:
                    profile.email,

                  role_in_team:
                    membership
                      .role_in_team,
                };
              }
            )
            .filter(
              (
                member
              ): member is {
                id: string;

                full_name:
                  string | null;

                email: string;

                role_in_team:
                  string | null;
              } =>
                member !==
                null
            );
      }
    }


    /*
     * Tasks.
     */

    const {
      data:
        tasks,

      error:
        taskError,
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
            ascending:
              false,
          }
        );


    if (
      taskError
    ) {

      throw new Error(
        `Unable to load project tasks: ${taskError.message}`
      );
    }


    const assigneeIds =
      [
        ...new Set(
          (
            tasks ??
            []
          )
            .map(
              (
                task
              ) =>
                task.assigned_to
            )
            .filter(
              (
                value
              ):
                value is string =>
                  Boolean(
                    value
                  )
            )
        ),
      ];


    let assigneeProfiles:
      Array<{
        id: string;

        full_name:
          string | null;

        email: string;
      }> =
      [];


    if (
      assigneeIds.length >
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
            assigneeIds
          );


      if (
        !error
      ) {

        assigneeProfiles =
          data ??
          [];
      }
    }


    const tasksWithAssignee =
      (
        tasks ??
        []
      ).map(
        (
          task
        ) => ({
          ...task,

          assignee:
            assigneeProfiles.find(
              (
                profile
              ) =>
                profile.id ===
                task.assigned_to
            ) ??
            null,
        })
      );


    return {
      ...project,

      allocated_teams:
        allocations ??
        [],

      available_members:
        availableMembers,

      tasks:
        tasksWithAssignee,
    };
  };


/*
 * =========================================================
 * UPDATE PROJECT PROGRESS
 *
 * IMPORTANT:
 *
 * "done" from Team Progress means:
 *
 * TEAM FINISHED WORK
 *
 * It does NOT mean management confirmed the project.
 *
 * Therefore "done" submits it to completion review instead.
 * =========================================================
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
      data:
        currentProject,

      error:
        currentError,
    } =
      await supabaseAdmin
        .from("projects")
        .select(`
          id,
          status,
          actual_start_date,
          completion_review_status
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


    if (
      currentProject
        .completion_review_status ===
      "confirmed"
    ) {

      throw new Error(
        "Confirmed projects cannot be changed"
      );
    }


    /*
     * -----------------------------------------------------
     * TEAM MARKS WORK COMPLETED
     *
     * Send to management review.
     * -----------------------------------------------------
     */

    if (
      status ===
      "done"
    ) {

      /*
       * Every existing task must be Done.
       */

      const {
        data:
          tasks,

        error:
          taskError,
      } =
        await supabaseAdmin
          .from("tasks")
          .select(`
            id,
            status
          `)
          .eq(
            "project_id",
            projectId
          );


      if (
        taskError
      ) {

        throw new Error(
          `Unable to verify project tasks: ${taskError.message}`
        );
      }


      const incomplete =
        (
          tasks ??
          []
        ).filter(
          (
            task
          ) =>
            task.status !==
            "done"
        );


      if (
        incomplete.length >
        0
      ) {

        throw new Error(
          `${incomplete.length} task(s) are not Done`
        );
      }


      const now =
        new Date()
          .toISOString();


      const {
        data,
        error,
      } =
        await supabaseAdmin
          .from("projects")
          .update({
            /*
             * Do NOT set final status Done.
             *
             * Final Done belongs to manager confirmation.
             */

            status:
              currentProject
                .status ===
                "assigned"
                ? "ongoing"
                : currentProject
                    .status,

            completion_review_status:
              "pending_review",

            team_completed_at:
              now,

            team_completed_by:
              userId,

            completion_notes:
              completionNotes ??
              null,

            actual_end_date:
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
            projectId
          )
          .select()
          .single();


      if (
        error ||
        !data
      ) {

        throw new Error(
          `Unable to submit project for completion review: ${
            error?.message ||
            "Unknown error"
          }`
        );
      }


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
            "completion_submitted",

          description:
            "Team submitted project for completion review",

          metadata: {
            completionReviewStatus:
              "pending_review",
          },
        });


      return data;
    }


    /*
     * -----------------------------------------------------
     * NORMAL PROGRESS STATUS
     * -----------------------------------------------------
     */

    const updates:
      Record<
        string,
        unknown
      > =
      {
        status,
      };


    if (
      status ===
        "ongoing" &&
      !currentProject
        .actual_start_date
    ) {

      updates
        .actual_start_date =
        new Date()
          .toISOString()
          .slice(
            0,
            10
          );
    }


    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from("projects")
        .update(
          updates
        )
        .eq(
          "id",
          projectId
        )
        .select()
        .single();


    if (
      error ||
      !data
    ) {

      throw new Error(
        `Unable to update project status: ${
          error?.message ||
          "Unknown error"
        }`
      );
    }


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
 * =========================================================
 * CREATE TASK
 * =========================================================
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


    /*
     * Verify project is editable.
     */

    const {
      data:
        project,

      error:
        projectError,
    } =
      await supabaseAdmin
        .from("projects")
        .select(`
          id,
          completion_review_status
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
        "Project not found"
      );
    }


    if (
      project
        .completion_review_status ===
        "pending_review" ||
      project
        .completion_review_status ===
        "confirmed"
    ) {

      throw new Error(
        "Tasks cannot be changed while the project is under completion review"
      );
    }


    const assignedTo =
      input.assignedTo ||
      input.createdBy;


    /*
     * Find allocated teams.
     */

    const {
      data:
        allocations,

      error:
        allocationError,
    } =
      await supabaseAdmin
        .from("project_teams")
        .select(`
          team_id
        `)
        .eq(
          "project_id",
          input.projectId
        );


    if (
      allocationError
    ) {

      throw new Error(
        `Unable to validate project team: ${allocationError.message}`
      );
    }


    const teamIds =
      (
        allocations ??
        []
      ).map(
        (
          allocation
        ) =>
          allocation.team_id
      );


    if (
      teamIds.length ===
      0
    ) {

      throw new Error(
        "Project does not have an allocated team"
      );
    }


    /*
     * Assignee must belong to allocated team.
     */

    const {
      data:
        membership,

      error:
        membershipError,
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
        "Task assignee does not belong to the allocated project team"
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
            input.description ??
            null,

          assigned_to:
            assignedTo,

          status:
            "pending",

          due_date:
            input.dueDate ??
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

      throw new Error(
        `Unable to create task: ${
          error?.message ||
          "Unknown error"
        }`
      );
    }


    return data;
  };


/*
 * =========================================================
 * UPDATE TASK STATUS
 * =========================================================
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
      data:
        task,

      error:
        taskError,
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


    const {
      data:
        project,

      error:
        projectError,
    } =
      await supabaseAdmin
        .from("projects")
        .select(`
          completion_review_status
        `)
        .eq(
          "id",
          task.project_id
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


    if (
      project
        .completion_review_status ===
        "pending_review" ||
      project
        .completion_review_status ===
        "confirmed"
    ) {

      throw new Error(
        "Task cannot be changed while the project is under completion review"
      );
    }


    const updates:
      Record<
        string,
        unknown
      > =
      {
        status,
      };


    if (
      status ===
      "done"
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


    if (
      error ||
      !data
    ) {

      throw new Error(
        `Unable to update task: ${
          error?.message ||
          "Unknown error"
        }`
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