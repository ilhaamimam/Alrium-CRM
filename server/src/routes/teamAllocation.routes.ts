import {
  Router,
} from "express";

import {
  addMemberToTeam,
  addTeam,
  assignTeam,
  deleteMemberFromTeam,
  editTeam,
  listAvailableTeamMembers,
  listProjectsForAllocation,
  listTeamAssignedProjects,
  listTeams,
} from "../controllers/teamAllocation.controller";

import {
  requireAuth,
} from "../middleware/auth.middleware";

import {
  allowRoles,
} from "../middleware/role.middleware";


const router =
  Router();


/*
 * All Team Allocation management
 * is Senior Manager only.
 */


router.get(
  "/teams",
  requireAuth,
  allowRoles(
    "senior_manager"
  ),
  listTeams
);


router.post(
  "/teams",
  requireAuth,
  allowRoles(
    "senior_manager"
  ),
  addTeam
);


router.patch(
  "/teams/:id",
  requireAuth,
  allowRoles(
    "senior_manager"
  ),
  editTeam
);


router.get(
  "/team-members/available",
  requireAuth,
  allowRoles(
    "senior_manager"
  ),
  listAvailableTeamMembers
);


router.post(
  "/teams/:id/members",
  requireAuth,
  allowRoles(
    "senior_manager"
  ),
  addMemberToTeam
);


router.delete(
  "/teams/:id/members/:userId",
  requireAuth,
  allowRoles(
    "senior_manager"
  ),
  deleteMemberFromTeam
);


router.get(
  "/team-allocation/projects",
  requireAuth,
  allowRoles(
    "senior_manager"
  ),
  listProjectsForAllocation
);


router.post(
  "/team-allocation/projects/:projectId",
  requireAuth,
  allowRoles(
    "senior_manager"
  ),
  assignTeam
);


router.get(
  "/team-allocation/assigned",
  requireAuth,
  allowRoles(
    "senior_manager"
  ),
  listTeamAssignedProjects
);


export default router;