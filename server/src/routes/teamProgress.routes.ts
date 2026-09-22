import {
  Router,
} from "express";

import {
  addProjectTask,
  editProjectProgressStatus,
  editTaskProgressStatus,
  getSingleTeamProgressProject,
  listTeamProgressProjects,
} from "../controllers/teamProgress.controller";

import {
  requireAuth,
} from "../middleware/auth.middleware";

import {
  allowRoles,
} from "../middleware/role.middleware";


const router =
  Router();


/*
 * =========================================================
 * LIST TEAM PROGRESS PROJECTS
 *
 * Accessible by:
 * - Team Member
 * - Sales Manager
 * - Senior Manager
 * =========================================================
 */

router.get(
  "/team-progress/projects",

  requireAuth,

  allowRoles(
    "team_member",
    "sales_manager",
    "senior_manager"
  ),

  listTeamProgressProjects
);


/*
 * =========================================================
 * GET SINGLE TEAM PROGRESS PROJECT
 * =========================================================
 */

router.get(
  "/team-progress/projects/:id",

  requireAuth,

  allowRoles(
    "team_member",
    "sales_manager",
    "senior_manager"
  ),

  getSingleTeamProgressProject
);


/*
 * =========================================================
 * UPDATE PROJECT PROGRESS STATUS
 * =========================================================
 */

router.patch(
  "/team-progress/projects/:id/status",

  requireAuth,

  allowRoles(
    "team_member",
    "sales_manager",
    "senior_manager"
  ),

  editProjectProgressStatus
);


/*
 * =========================================================
 * ADD PROJECT TASK
 * =========================================================
 */

router.post(
  "/team-progress/projects/:id/tasks",

  requireAuth,

  allowRoles(
    "team_member",
    "sales_manager",
    "senior_manager"
  ),

  addProjectTask
);


/*
 * =========================================================
 * UPDATE TASK STATUS
 * =========================================================
 */

router.patch(
  "/team-progress/tasks/:taskId/status",

  requireAuth,

  allowRoles(
    "team_member",
    "sales_manager",
    "senior_manager"
  ),

  editTaskProgressStatus
);


export default router;