import {
  api,
} from "../../api/http";

import type {
  CalendarEvent,
  CalendarLeadOption,
  CalendarReminder,
  CreateCalendarReminderInput,
  UpdateCalendarReminderInput,
} from "./calendar.types";


/*
 * =========================================================
 * EVENTS
 * =========================================================
 */

export const fetchCalendarEvents =
  async (
    from: string,

    to: string
  ): Promise<
    CalendarEvent[]
  > => {

    const response =
      await api.get(
        "/calendar/events",
        {
          params: {
            from,
            to,
          },
        }
      );


    return (
      response.data
        ?.data ??
      []
    );
  };


/*
 * =========================================================
 * LEAD OPTIONS
 * =========================================================
 */

export const fetchCalendarLeads =
  async (): Promise<
    CalendarLeadOption[]
  > => {

    const response =
      await api.get(
        "/calendar/leads"
      );


    return (
      response.data
        ?.data ??
      []
    );
  };


/*
 * =========================================================
 * REMINDERS
 * =========================================================
 */

export const fetchCalendarReminders =
  async (): Promise<
    CalendarReminder[]
  > => {

    const response =
      await api.get(
        "/calendar/reminders"
      );


    return (
      response.data
        ?.data ??
      []
    );
  };


export const createCalendarReminder =
  async (
    input:
      CreateCalendarReminderInput
  ): Promise<
    CalendarReminder
  > => {

    const response =
      await api.post(
        "/calendar/reminders",
        input
      );


    return response.data
      ?.data;
  };


export const updateCalendarReminder =
  async (
    reminderId: string,

    input:
      UpdateCalendarReminderInput
  ): Promise<
    CalendarReminder
  > => {

    const response =
      await api.patch(
        `/calendar/reminders/${reminderId}`,
        input
      );


    return response.data
      ?.data;
  };


export const deleteCalendarReminder =
  async (
    reminderId: string
  ) => {

    await api.delete(
      `/calendar/reminders/${reminderId}`
    );
  };