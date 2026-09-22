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
 * =========================================================
 * TEAM ALLOCATION MANAGEMENT
 *
 * BOTH:
 *
 * sales_manager
 * senior_manager
 *
 * have the same management access.
 * =========================================================
 */


/*
 * =========================================================
 * LIST TEAMS
 * =========================================================
 */

router.get(
  "/teams",

  requireAuth,

  allowRoles(
    "sales_manager",
    "senior_manager"
  ),

  listTeams
);


/*
 * =========================================================
 * CREATE TEAM
 * =========================================================
 */

router.post(
  "/teams",

  requireAuth,

  allowRoles(
    "sales_manager",
    "senior_manager"
  ),

  addTeam
);


/*
 * =========================================================
 * EDIT TEAM
 * =========================================================
 */

router.patch(
  "/teams/:id",

  requireAuth,

  allowRoles(
    "sales_manager",
    "senior_manager"
  ),

  editTeam
);


/*
 * =========================================================
 * AVAILABLE TEAM MEMBERS
 * =========================================================
 */

router.get(
  "/team-members/available",

  requireAuth,

  allowRoles(
    "sales_manager",
    "senior_manager"
  ),

  listAvailableTeamMembers
);


/*
 * =========================================================
 * ADD MEMBER TO TEAM
 * =========================================================
 */

router.post(
  "/teams/:id/members",

  requireAuth,

  allowRoles(
    "sales_manager",
    "senior_manager"
  ),

  addMemberToTeam
);


/*
 * =========================================================
 * REMOVE MEMBER FROM TEAM
 * =========================================================
 */

router.delete(
  "/teams/:id/members/:userId",

  requireAuth,

  allowRoles(
    "sales_manager",
    "senior_manager"
  ),

  deleteMemberFromTeam
);


/*
 * =========================================================
 * PROJECTS READY FOR TEAM ALLOCATION
 * =========================================================
 */

router.get(
  "/team-allocation/projects",

  requireAuth,

  allowRoles(
    "sales_manager",
    "senior_manager"
  ),

  listProjectsForAllocation
);


/*
 * =========================================================
 * ASSIGN TEAM TO PROJECT
 * =========================================================
 */

router.post(
  "/team-allocation/projects/:projectId",

  requireAuth,

  allowRoles(
    "sales_manager",
    "senior_manager"
  ),

  assignTeam
);


/*
 * =========================================================
 * LIST ASSIGNED PROJECTS
 * =========================================================
 */

router.get(
  "/team-allocation/assigned",

  requireAuth,

  allowRoles(
    "sales_manager",
    "senior_manager"
  ),

  listTeamAssignedProjects
);


export default router;