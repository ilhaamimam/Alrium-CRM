import type {
  Request,
  Response,
} from "express";

import {
  createCalendarReminder,
  deleteCalendarReminder,
  getCalendarEvents,
  getCalendarLeadOptions,
  getCalendarReminders,
  updateCalendarReminder,
} from "../services/calendar.service";

import type {
  ReminderStatus,
  ReminderType,
} from "../services/calendar.service";


const validReminderTypes:
  ReminderType[] =
  [
    "follow_up",
    "pending_update",
    "meeting",
    "deadline",
    "custom",
  ];


const validReminderStatuses:
  ReminderStatus[] =
  [
    "pending",
    "done",
    "dismissed",
  ];


/*
 * =========================================================
 * ERROR HELPER
 * =========================================================
 */

const sendCalendarError =
  (
    res: Response,

    error: unknown
  ) => {

    const message =
      error instanceof Error
        ? error.message
        : "Calendar request failed";


    const status =
      message
        .toLowerCase()
        .includes(
          "not found"
        )
        ? 404
        : 400;


    return res
      .status(status)
      .json({
        success:
          false,

        message,
      });
  };


/*
 * =========================================================
 * GET EVENTS
 * =========================================================
 */

export const listCalendarEvents =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      if (
        !req.user
      ) {

        return res
          .status(401)
          .json({
            success:
              false,

            message:
              "Authentication required",
          });
      }


      const from =
        typeof req.query.from ===
        "string"
          ? req.query.from
          : undefined;


      const to =
        typeof req.query.to ===
        "string"
          ? req.query.to
          : undefined;


      const events =
        await getCalendarEvents(
          req.user.id,
          from,
          to
        );


      return res.json({
        success:
          true,

        data:
          events,
      });

    } catch (error) {

      console.error(
        "CALENDAR EVENTS ERROR:",
        error
      );


      return sendCalendarError(
        res,
        error
      );
    }
  };


/*
 * =========================================================
 * GET LEADS FOR REMINDER DROPDOWN
 * =========================================================
 */

export const listCalendarLeads =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      if (
        !req.user
      ) {

        return res
          .status(401)
          .json({
            success:
              false,

            message:
              "Authentication required",
          });
      }


      const leads =
        await getCalendarLeadOptions();


      return res.json({
        success:
          true,

        data:
          leads,
      });

    } catch (error) {

      return sendCalendarError(
        res,
        error
      );
    }
  };


/*
 * =========================================================
 * GET REMINDERS
 * =========================================================
 */

export const listCalendarReminders =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      if (
        !req.user
      ) {

        return res
          .status(401)
          .json({
            success:
              false,

            message:
              "Authentication required",
          });
      }


      const reminders =
        await getCalendarReminders(
          req.user.id
        );


      return res.json({
        success:
          true,

        data:
          reminders,
      });

    } catch (error) {

      return sendCalendarError(
        res,
        error
      );
    }
  };


/*
 * =========================================================
 * CREATE REMINDER
 * =========================================================
 */

export const addCalendarReminder =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      if (
        !req.user
      ) {

        return res
          .status(401)
          .json({
            success:
              false,

            message:
              "Authentication required",
          });
      }


      const {
        leadId,
        title,
        description,
        reminderDate,
        reminderTime,
        reminderType,
      } =
        req.body ??
        {};


      if (
        typeof leadId !==
          "string" ||
        !leadId.trim()
      ) {

        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Lead is required",
          });
      }


      if (
        typeof title !==
          "string" ||
        !title.trim()
      ) {

        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Reminder title is required",
          });
      }


      if (
        typeof reminderDate !==
          "string" ||
        !reminderDate
      ) {

        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Reminder date is required",
          });
      }


      const normalizedType:
        ReminderType =
        validReminderTypes
          .includes(
            reminderType
          )
          ? reminderType
          : "follow_up";


      const reminder =
        await createCalendarReminder({
          leadId:
            leadId.trim(),

          title,

          description:
            typeof description ===
              "string"
              ? description
              : null,

          reminderDate,

          reminderTime:
            typeof reminderTime ===
              "string"
              ? reminderTime
              : null,

          reminderType:
            normalizedType,

          createdBy:
            req.user.id,
        });


      return res
        .status(201)
        .json({
          success:
            true,

          message:
            "Reminder created",

          data:
            reminder,
        });

    } catch (error) {

      return sendCalendarError(
        res,
        error
      );
    }
  };


/*
 * =========================================================
 * UPDATE REMINDER
 * =========================================================
 */

export const editCalendarReminder =
  async (
    req: Request<{
      id: string;
    }>,
    res: Response
  ) => {

    try {

      if (
        !req.user
      ) {

        return res
          .status(401)
          .json({
            success:
              false,

            message:
              "Authentication required",
          });
      }


      const {
        title,
        description,
        reminderDate,
        reminderTime,
        reminderType,
        status,
      } =
        req.body ??
        {};


      if (
        reminderType !==
          undefined &&
        !validReminderTypes
          .includes(
            reminderType
          )
      ) {

        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Invalid reminder type",
          });
      }


      if (
        status !==
          undefined &&
        !validReminderStatuses
          .includes(
            status
          )
      ) {

        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Invalid reminder status",
          });
      }


      const reminder =
        await updateCalendarReminder(
          req.params.id,
          req.user.id,
          {
            title:
              typeof title ===
                "string"
                ? title
                : undefined,

            description:
              typeof description ===
                "string" ||
              description ===
                null
                ? description
                : undefined,

            reminderDate:
              typeof reminderDate ===
                "string"
                ? reminderDate
                : undefined,

            reminderTime:
              typeof reminderTime ===
                "string" ||
              reminderTime ===
                null
                ? reminderTime
                : undefined,

            reminderType:
              reminderType,

            status:
              status,
          }
        );


      return res.json({
        success:
          true,

        message:
          "Reminder updated",

        data:
          reminder,
      });

    } catch (error) {

      return sendCalendarError(
        res,
        error
      );
    }
  };


/*
 * =========================================================
 * DELETE REMINDER
 * =========================================================
 */

export const removeCalendarReminder =
  async (
    req: Request<{
      id: string;
    }>,
    res: Response
  ) => {

    try {

      if (
        !req.user
      ) {

        return res
          .status(401)
          .json({
            success:
              false,

            message:
              "Authentication required",
          });
      }


      await deleteCalendarReminder(
        req.params.id,
        req.user.id
      );


      return res.json({
        success:
          true,

        message:
          "Reminder deleted",
      });

    } catch (error) {

      return sendCalendarError(
        res,
        error
      );
    }
  };