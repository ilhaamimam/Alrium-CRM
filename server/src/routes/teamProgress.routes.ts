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


router.get(
  "/team-progress/projects",
  requireAuth,
  allowRoles(
    "team_member",
    "senior_manager"
  ),
  listTeamProgressProjects
);


router.get(
  "/team-progress/projects/:id",
  requireAuth,
  allowRoles(
    "team_member",
    "senior_manager"
  ),
  getSingleTeamProgressProject
);


router.patch(
  "/team-progress/projects/:id/status",
  requireAuth,
  allowRoles(
    "team_member",
    "senior_manager"
  ),
  editProjectProgressStatus
);


router.post(
  "/team-progress/projects/:id/tasks",
  requireAuth,
  allowRoles(
    "team_member",
    "senior_manager"
  ),
  addProjectTask
);


router.patch(
  "/team-progress/tasks/:taskId/status",
  requireAuth,
  allowRoles(
    "team_member",
    "senior_manager"
  ),
  editTaskProgressStatus
);


export default router;