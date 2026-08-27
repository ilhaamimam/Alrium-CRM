import {
  Request,
  Response,
} from "express";

import {
  addTeamMember,
  assignProjectToTeam,
  createTeam,
  getAvailableTeamMemberUsers,
  getProjectsForTeamAllocation,
  getTeamAssignedProjects,
  getTeams,
  removeTeamMember,
  updateTeam,
} from "../services/teamAllocation.service";


/*
 * ========================================================
 * GET /api/teams
 * ========================================================
 */

export const listTeams =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const teams =
        await getTeams();


      return res
        .status(200)
        .json({
          success: true,
          data: teams,
        });

    } catch (error) {

      console.error(
        "LIST TEAMS ERROR:",
        error
      );


      return res
        .status(500)
        .json({
          success: false,

          message:
            error instanceof Error
              ? error.message
              : "Unable to load teams",
        });
    }
  };


/*
 * ========================================================
 * POST /api/teams
 * ========================================================
 */

export const addTeam =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      if (!req.user) {

        return res
          .status(401)
          .json({
            success: false,

            message:
              "Authentication required",
          });
      }


      const {
        name,
        description,
      } =
        req.body ?? {};


      if (
        typeof name !==
          "string" ||
        !name.trim()
      ) {

        return res
          .status(400)
          .json({
            success: false,

            message:
              "Team name is required",
          });
      }


      const team =
        await createTeam({
          name:
            name.trim(),

          description:
            typeof description ===
              "string"
              ? description.trim()
              : null,

          createdBy:
            req.user.id,
        });


      return res
        .status(201)
        .json({
          success: true,

          message:
            "Team created successfully",

          data: team,
        });

    } catch (error) {

      console.error(
        "CREATE TEAM ERROR:",
        error
      );


      return res
        .status(500)
        .json({
          success: false,

          message:
            error instanceof Error
              ? error.message
              : "Unable to create team",
        });
    }
  };


/*
 * ========================================================
 * PATCH /api/teams/:id
 * ========================================================
 */

export const editTeam =
  async (
    req: Request<{
      id: string;
    }>,
    res: Response
  ) => {

    try {

      const {
        name,
        description,
      } =
        req.body ?? {};


      if (
        name !== undefined &&
        (
          typeof name !==
            "string" ||
          !name.trim()
        )
      ) {

        return res
          .status(400)
          .json({
            success: false,

            message:
              "Team name cannot be empty",
          });
      }


      const team =
        await updateTeam(
          req.params.id,
          {
            ...(name !==
              undefined && {
              name:
                name.trim(),
            }),

            ...(description !==
              undefined && {
              description:
                typeof description ===
                  "string"
                  ? description.trim()
                  : null,
            }),
          }
        );


      return res
        .status(200)
        .json({
          success: true,

          message:
            "Team updated successfully",

          data: team,
        });

    } catch (error) {

      console.error(
        "EDIT TEAM ERROR:",
        error
      );


      return res
        .status(500)
        .json({
          success: false,

          message:
            error instanceof Error
              ? error.message
              : "Unable to update team",
        });
    }
  };


/*
 * ========================================================
 * GET /api/team-members/available
 * ========================================================
 */

export const listAvailableTeamMembers =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const members =
        await getAvailableTeamMemberUsers();


      return res
        .status(200)
        .json({
          success: true,

          data: members,
        });

    } catch (error) {

      console.error(
        "AVAILABLE TEAM MEMBERS ERROR:",
        error
      );


      return res
        .status(500)
        .json({
          success: false,

          message:
            error instanceof Error
              ? error.message
              : "Unable to load team members",
        });
    }
  };


/*
 * ========================================================
 * POST /api/teams/:id/members
 * ========================================================
 */

export const addMemberToTeam =
  async (
    req: Request<{
      id: string;
    }>,
    res: Response
  ) => {

    try {

      if (!req.user) {

        return res
          .status(401)
          .json({
            success: false,

            message:
              "Authentication required",
          });
      }


      const {
        userId,
        roleInTeam,
      } =
        req.body ?? {};


      if (
        typeof userId !==
          "string" ||
        !userId
      ) {

        return res
          .status(400)
          .json({
            success: false,

            message:
              "Team member is required",
          });
      }


      const member =
        await addTeamMember({
          teamId:
            req.params.id,

          userId,

          roleInTeam:
            typeof roleInTeam ===
              "string"
              ? roleInTeam.trim()
              : null,

          addedBy:
            req.user.id,
        });


      return res
        .status(201)
        .json({
          success: true,

          message:
            "Team member added successfully",

          data: member,
        });

    } catch (error) {

      console.error(
        "ADD MEMBER TO TEAM ERROR:",
        error
      );


      return res
        .status(500)
        .json({
          success: false,

          message:
            error instanceof Error
              ? error.message
              : "Unable to add team member",
        });
    }
  };


/*
 * ========================================================
 * DELETE /api/teams/:id/members/:userId
 * ========================================================
 */

export const deleteMemberFromTeam =
  async (
    req: Request<{
      id: string;
      userId: string;
    }>,
    res: Response
  ) => {

    try {

      await removeTeamMember(
        req.params.id,
        req.params.userId
      );


      return res
        .status(200)
        .json({
          success: true,

          message:
            "Team member removed successfully",
        });

    } catch (error) {

      console.error(
        "REMOVE TEAM MEMBER ERROR:",
        error
      );


      return res
        .status(500)
        .json({
          success: false,

          message:
            error instanceof Error
              ? error.message
              : "Unable to remove team member",
        });
    }
  };


/*
 * ========================================================
 * GET /api/team-allocation/projects
 * ========================================================
 */

export const listProjectsForAllocation =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const projects =
        await getProjectsForTeamAllocation();


      return res
        .status(200)
        .json({
          success: true,

          data: projects,
        });

    } catch (error) {

      console.error(
        "PROJECT ALLOCATION LIST ERROR:",
        error
      );


      return res
        .status(500)
        .json({
          success: false,

          message:
            error instanceof Error
              ? error.message
              : "Unable to load Lead Board projects",
        });
    }
  };


/*
 * ========================================================
 * POST /api/team-allocation/projects/:projectId
 * ========================================================
 */

export const assignTeam =
  async (
    req: Request<{
      projectId: string;
    }>,
    res: Response
  ) => {

    try {

      if (!req.user) {

        return res
          .status(401)
          .json({
            success: false,

            message:
              "Authentication required",
          });
      }


      const {
        teamId,
        plannedStartDate,
        plannedEndDate,
      } =
        req.body ?? {};


      if (
        typeof teamId !==
          "string" ||
        !teamId
      ) {

        return res
          .status(400)
          .json({
            success: false,

            message:
              "Team is required",
          });
      }


      if (
        plannedStartDate &&
        plannedEndDate &&
        plannedEndDate <
          plannedStartDate
      ) {

        return res
          .status(400)
          .json({
            success: false,

            message:
              "Planned end date cannot be before planned start date",
          });
      }


      const project =
        await assignProjectToTeam({
          projectId:
            req.params.projectId,

          teamId,

          plannedStartDate:
            plannedStartDate ||
            null,

          plannedEndDate:
            plannedEndDate ||
            null,

          assignedBy:
            req.user.id,
        });


      return res
        .status(200)
        .json({
          success: true,

          message:
            "Team allocated successfully",

          data: project,
        });

    } catch (error) {

      console.error(
        "ASSIGN TEAM ERROR:",
        error
      );


      return res
        .status(500)
        .json({
          success: false,

          message:
            error instanceof Error
              ? error.message
              : "Unable to allocate team",
        });
    }
  };


/*
 * ========================================================
 * GET /api/team-allocation/assigned
 *
 * Optional:
 *
 * /api/team-allocation/assigned?teamId=UUID
 * ========================================================
 */

export const listTeamAssignedProjects =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const teamId =
        typeof req.query.teamId ===
          "string"
          ? req.query.teamId
          : undefined;


      const projects =
        await getTeamAssignedProjects(
          teamId
        );


      return res
        .status(200)
        .json({
          success: true,

          data: projects,
        });

    } catch (error) {

      console.error(
        "TEAM ASSIGNED PROJECTS ERROR:",
        error
      );


      return res
        .status(500)
        .json({
          success: false,

          message:
            error instanceof Error
              ? error.message
              : "Unable to load team assigned leads",
        });
    }
  };