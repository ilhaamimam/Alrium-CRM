import {
  Router,
} from "express";

import {
  addCalendarReminder,
  editCalendarReminder,
  listCalendarEvents,
  listCalendarLeads,
  listCalendarReminders,
  removeCalendarReminder,
} from "../controllers/calendar.controller";

import {
  requireAuth,
} from "../middleware/auth.middleware";


const router =
  Router();


/*
 * =========================================================
 * CALENDAR
 *
 * Every authenticated CRM user may access Calendar.
 * =========================================================
 */


/*
 * SYSTEM + REMINDER EVENTS
 */

router.get(
  "/calendar/events",

  requireAuth,

  listCalendarEvents
);


/*
 * LEADS FOR REMINDER DROPDOWN
 */

router.get(
  "/calendar/leads",

  requireAuth,

  listCalendarLeads
);


/*
 * USER REMINDERS
 */

router.get(
  "/calendar/reminders",

  requireAuth,

  listCalendarReminders
);


router.post(
  "/calendar/reminders",

  requireAuth,

  addCalendarReminder
);


router.patch(
  "/calendar/reminders/:id",

  requireAuth,

  editCalendarReminder
);


router.delete(
  "/calendar/reminders/:id",

  requireAuth,

  removeCalendarReminder
);


export default router;