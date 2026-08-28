import {
  Request,
  Response,
} from "express";

import {
  createProjectTask,
  getTeamProgressProjectById,
  getTeamProgressProjects,
  updateProjectProgressStatus,
  updateTaskProgressStatus,
  type ProjectProgressStatus,
  type TaskProgressStatus,
} from "../services/teamProgress.service";


const allowedProjectStatuses:
  ProjectProgressStatus[] =
[
  "assigned",
  "ongoing",
  "on_hold",
  "done",
];


const allowedTaskStatuses:
  TaskProgressStatus[] =
[
  "pending",
  "ongoing",
  "on_hold",
  "done",
];


/*
 * GET /api/team-progress/projects
 */
export const listTeamProgressProjects =
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


      const projects =
        await getTeamProgressProjects(
          req.user.id,
          req.user.role || ""
        );


      return res
        .status(200)
        .json({
          success: true,

          data:
            projects,
        });

    } catch (error) {

      console.error(
        "LIST TEAM PROGRESS ERROR:",
        error
      );


      return res
        .status(500)
        .json({
          success: false,

          message:
            error instanceof Error
              ? error.message
              : "Unable to load projects",
        });
    }
  };


/*
 * GET /api/team-progress/projects/:id
 */
export const getSingleTeamProgressProject =
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


      const project =
        await getTeamProgressProjectById(
          req.params.id,
          req.user.id,
          req.user.role || ""
        );


      return res
        .status(200)
        .json({
          success: true,

          data:
            project,
        });

    } catch (error) {

      console.error(
        "GET TEAM PROJECT ERROR:",
        error
      );


      return res
        .status(403)
        .json({
          success: false,

          message:
            error instanceof Error
              ? error.message
              : "Unable to load project",
        });
    }
  };


/*
 * PATCH /api/team-progress/projects/:id/status
 */
export const editProjectProgressStatus =
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
        status,
        completionNotes,
      } =
        req.body ?? {};


      if (
        !allowedProjectStatuses
          .includes(
            status
          )
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Invalid project status",
          });
      }


      const project =
        await updateProjectProgressStatus(
          req.params.id,
          status,
          typeof completionNotes ===
            "string"
            ? completionNotes.trim()
            : null,
          req.user.id,
          req.user.role || ""
        );


      return res
        .status(200)
        .json({
          success: true,

          message:
            "Project status updated successfully",

          data:
            project,
        });

    } catch (error) {

      console.error(
        "UPDATE PROJECT PROGRESS ERROR:",
        error
      );


      return res
        .status(500)
        .json({
          success: false,

          message:
            error instanceof Error
              ? error.message
              : "Unable to update project",
        });
    }
  };


/*
 * POST /api/team-progress/projects/:id/tasks
 */
export const addProjectTask =
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
        title,
        description,
        assignedTo,
        dueDate,
      } =
        req.body ?? {};


      if (
        typeof title !==
          "string" ||
        !title.trim()
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Task title is required",
          });
      }


      const task =
        await createProjectTask(
          {
            projectId:
              req.params.id,

            title:
              title.trim(),

            description:
              typeof description ===
                "string"
                ? description.trim()
                : null,

            assignedTo:
              typeof assignedTo ===
                "string" &&
              assignedTo
                ? assignedTo
                : null,

            dueDate:
              typeof dueDate ===
                "string" &&
              dueDate
                ? dueDate
                : null,

            createdBy:
              req.user.id,
          },

          req.user.role || ""
        );


      return res
        .status(201)
        .json({
          success: true,

          message:
            "Task created successfully",

          data:
            task,
        });

    } catch (error) {

      console.error(
        "CREATE PROJECT TASK ERROR:",
        error
      );


      return res
        .status(500)
        .json({
          success: false,

          message:
            error instanceof Error
              ? error.message
              : "Unable to create task",
        });
    }
  };


/*
 * PATCH /api/team-progress/tasks/:taskId/status
 */
export const editTaskProgressStatus =
  async (
    req: Request<{
      taskId: string;
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
        status,
      } =
        req.body ?? {};


      if (
        !allowedTaskStatuses
          .includes(
            status
          )
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Invalid task status",
          });
      }


      const task =
        await updateTaskProgressStatus(
          req.params.taskId,
          status,
          req.user.id,
          req.user.role || ""
        );


      return res
        .status(200)
        .json({
          success: true,

          message:
            "Task status updated successfully",

          data:
            task,
        });

    } catch (error) {

      console.error(
        "UPDATE TASK PROGRESS ERROR:",
        error
      );


      return res
        .status(500)
        .json({
          success: false,

          message:
            error instanceof Error
              ? error.message
              : "Unable to update task",
        });
    }
  };