import {
  supabaseAdmin,
} from "../config/supabase";


/*
 * =========================================================
 * TYPES
 * =========================================================
 */

export type CalendarEventType =
  | "lead_created"
  | "finance_pending"
  | "finance_approved"
  | "finance_rejected"
  | "technical_pending"
  | "technical_approved"
  | "technical_rejected"
  | "project_start"
  | "project_deadline"
  | "completion_pending"
  | "changes_required"
  | "completed"
  | "reminder";


export type ReminderType =
  | "follow_up"
  | "pending_update"
  | "meeting"
  | "deadline"
  | "custom";


export type ReminderStatus =
  | "pending"
  | "done"
  | "dismissed";


export interface CalendarEvent {
  id: string;

  lead_id: string;

  project_id:
    string | null;

  reminder_id:
    string | null;

  title: string;

  company_name:
    string | null;

  event_type:
    CalendarEventType;

  label: string;

  description:
    string | null;

  date: string;

  time:
    string | null;

  lead_status:
    string | null;

  workflow_status:
    string | null;

  days_remaining:
    number | null;

  days_waiting:
    number | null;

  overdue: boolean;

  reminder_status:
    ReminderStatus | null;

  editable:
    boolean;
}


export interface CreateReminderInput {
  leadId: string;

  title: string;

  description?:
    string | null;

  reminderDate:
    string;

  reminderTime?:
    string | null;

  reminderType:
    ReminderType;

  createdBy: string;
}


export interface UpdateReminderInput {
  title?:
    string;

  description?:
    string | null;

  reminderDate?:
    string;

  reminderTime?:
    string | null;

  reminderType?:
    ReminderType;

  status?:
    ReminderStatus;
}


/*
 * =========================================================
 * HELPERS
 * =========================================================
 */

const toDateOnly =
  (
    value?:
      string |
      null
  ):
    string |
    null => {

    if (
      !value
    ) {

      return null;
    }


    return value.slice(
      0,
      10
    );
  };


const todayDate =
  () => {

    const now =
      new Date();


    const year =
      now.getFullYear();


    const month =
      String(
        now.getMonth() +
        1
      ).padStart(
        2,
        "0"
      );


    const day =
      String(
        now.getDate()
      ).padStart(
        2,
        "0"
      );


    return `${year}-${month}-${day}`;
  };


const dateToUtc =
  (
    value: string
  ) => {

    const [
      year,
      month,
      day,
    ] =
      value
        .split("-")
        .map(
          Number
        );


    return Date.UTC(
      year,
      month - 1,
      day
    );
  };


const daysBetween =
  (
    fromDate: string,

    toDate: string
  ) => {

    const milliseconds =
      dateToUtc(
        toDate
      ) -
      dateToUtc(
        fromDate
      );


    return Math.round(
      milliseconds /
      86400000
    );
  };


const getDaysRemaining =
  (
    targetDate:
      string
  ) => {

    return daysBetween(
      todayDate(),
      targetDate
    );
  };


const getDaysWaiting =
  (
    startingDate:
      string |
      null
  ) => {

    if (
      !startingDate
    ) {

      return null;
    }


    return Math.max(
      0,
      daysBetween(
        startingDate,
        todayDate()
      )
    );
  };


const getCompanyName =
  (
    lead:
      any
  ):
    string |
    null => {

    const relation =
      lead
        ?.companies;


    if (
      Array.isArray(
        relation
      )
    ) {

      return (
        relation[0]
          ?.name ??
        null
      );
    }


    return (
      relation
        ?.name ??
      null
    );
  };


const inDateRange =
  (
    date: string,

    from?:
      string,

    to?:
      string
  ) => {

    if (
      from &&
      date <
      from
    ) {

      return false;
    }


    if (
      to &&
      date >
      to
    ) {

      return false;
    }


    return true;
  };


/*
 * =========================================================
 * LEAD OPTIONS
 *
 * Used by the Create Reminder form.
 * =========================================================
 */

export const getCalendarLeadOptions =
  async () => {

    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from("leads")
        .select(`
          id,
          title,
          status,
          created_at,

          companies (
            id,
            name
          )
        `)
        .order(
          "created_at",
          {
            ascending: false,
          }
        );


    if (
      error
    ) {

      console.error(
        "CALENDAR LEADS ERROR:",
        error
      );


      throw new Error(
        `Unable to load calendar leads: ${error.message}`
      );
    }


    return (
      data ??
      []
    ).map(
      (
        lead:
          any
      ) => ({
        id:
          lead.id,

        title:
          lead.title ||
          "Untitled Lead",

        status:
          lead.status ??
          null,

        company_name:
          getCompanyName(
            lead
          ),

        created_at:
          lead.created_at,
      })
    );
  };


/*
 * =========================================================
 * CALENDAR EVENTS
 *
 * This is the single Calendar data source.
 *
 * NO duplicate CRM workflow data is stored.
 * =========================================================
 */

export const getCalendarEvents =
  async (
    userId: string,

    from?:
      string,

    to?:
      string
  ):
    Promise<
      CalendarEvent[]
    > => {

    const [
      leadsResult,
      financeResult,
      technicalResult,
      projectsResult,
      remindersResult,
    ] =
      await Promise.all([

        supabaseAdmin
          .from("leads")
          .select(`
            id,
            title,
            status,
            created_at,
            updated_at,

            companies (
              id,
              name
            )
          `),

        supabaseAdmin
          .from(
            "financial_reviews"
          )
          .select(`
            id,
            lead_id,
            decision,
            review_notes,
            reviewed_at,
            created_at,
            updated_at
          `),

        supabaseAdmin
          .from(
            "technical_reviews"
          )
          .select(`
            id,
            lead_id,
            decision,
            review_notes,
            reviewed_at,
            created_at,
            updated_at
          `),

        supabaseAdmin
          .from("projects")
          .select(`
            id,
            lead_id,
            name,
            status,
            planned_start_date,
            planned_end_date,
            actual_start_date,
            actual_end_date,
            completion_review_status,
            completion_notes,
            team_completed_at,
            senior_reviewed_at,
            senior_review_notes,
            final_update_at,
            created_at,
            updated_at
          `),

        supabaseAdmin
          .from(
            "lead_calendar_reminders"
          )
          .select(`
            id,
            lead_id,
            title,
            description,
            reminder_date,
            reminder_time,
            reminder_type,
            status,
            created_by,
            created_at,
            updated_at
          `)
          .eq(
            "created_by",
            userId
          ),
      ]);


    if (
      leadsResult.error
    ) {

      throw new Error(
        `Unable to load calendar leads: ${leadsResult.error.message}`
      );
    }


    if (
      financeResult.error
    ) {

      throw new Error(
        `Unable to load Financial Review calendar data: ${financeResult.error.message}`
      );
    }


    if (
      technicalResult.error
    ) {

      throw new Error(
        `Unable to load Technical Review calendar data: ${technicalResult.error.message}`
      );
    }


    if (
      projectsResult.error
    ) {

      throw new Error(
        `Unable to load project calendar data: ${projectsResult.error.message}`
      );
    }


    if (
      remindersResult.error
    ) {

      throw new Error(
        `Unable to load reminders: ${remindersResult.error.message}`
      );
    }


    const leads =
      leadsResult.data ??
      [];


    const finances =
      financeResult.data ??
      [];


    const technicalReviews =
      technicalResult.data ??
      [];


    const projects =
      projectsResult.data ??
      [];


    const reminders =
      remindersResult.data ??
      [];


    const leadMap =
      new Map<
        string,
        any
      >(
        leads.map(
          (
            lead:
              any
          ) => [
            lead.id,
            lead,
          ]
        )
      );


    const financeMap =
      new Map<
        string,
        any
      >(
        finances.map(
          (
            review:
              any
          ) => [
            review.lead_id,
            review,
          ]
        )
      );


    const technicalMap =
      new Map<
        string,
        any
      >(
        technicalReviews.map(
          (
            review:
              any
          ) => [
            review.lead_id,
            review,
          ]
        )
      );


    const events:
      CalendarEvent[] =
      [];


    const today =
      todayDate();


    /*
     * =====================================================
     * LEAD CREATED
     * +
     * FINANCE / TECHNICAL WORKFLOW
     * =====================================================
     */

    for (
      const lead of
      leads
    ) {

      const title =
        lead.title ||
        "Untitled Lead";


      const companyName =
        getCompanyName(
          lead
        );


      const leadStatus =
        lead.status ??
        null;


      const createdDate =
        toDateOnly(
          lead.created_at
        );


      /*
       * LEAD CREATED
       */

      if (
        createdDate
      ) {

        events.push({
          id:
            `lead-created-${lead.id}`,

          lead_id:
            lead.id,

          project_id:
            null,

          reminder_id:
            null,

          title,

          company_name:
            companyName,

          event_type:
            "lead_created",

          label:
            "Lead Created",

          description:
            "Lead added to the CRM.",

          date:
            createdDate,

          time:
            null,

          lead_status:
            leadStatus,

          workflow_status:
            "created",

          days_remaining:
            null,

          days_waiting:
            null,

          overdue:
            false,

          reminder_status:
            null,

          editable:
            false,
        });
      }


      const financial =
        financeMap.get(
          lead.id
        );


      const financialDecision =
        financial
          ?.decision ??
        "pending";


      /*
       * FINANCE PENDING
       *
       * Pending items are shown on TODAY so they operate
       * as a live reminder.
       */

      if (
        financialDecision ===
        "pending"
      ) {

        events.push({
          id:
            `finance-pending-${lead.id}`,

          lead_id:
            lead.id,

          project_id:
            null,

          reminder_id:
            null,

          title,

          company_name:
            companyName,

          event_type:
            "finance_pending",

          label:
            "Finance Pending",

          description:
            "Waiting for Financial Review.",

          date:
            today,

          time:
            null,

          lead_status:
            leadStatus,

          workflow_status:
            "finance_pending",

          days_remaining:
            null,

          days_waiting:
            getDaysWaiting(
              createdDate
            ),

          overdue:
            false,

          reminder_status:
            null,

          editable:
            false,
        });


        /*
         * Do not show Technical pending before Finance
         * approval.
         */

        continue;
      }


      /*
       * FINANCE APPROVED / REJECTED
       */

      const financialDate =
        toDateOnly(
          financial
            ?.reviewed_at ||
          financial
            ?.updated_at ||
          financial
            ?.created_at
        );


      if (
        financialDate
      ) {

        const approved =
          financialDecision ===
          "approved";


        events.push({
          id:
            `finance-${financialDecision}-${financial.id}`,

          lead_id:
            lead.id,

          project_id:
            null,

          reminder_id:
            null,

          title,

          company_name:
            companyName,

          event_type:
            approved
              ? "finance_approved"
              : "finance_rejected",

          label:
            approved
              ? "Finance Approved"
              : "Finance Rejected",

          description:
            financial
              ?.review_notes ??
            null,

          date:
            financialDate,

          time:
            null,

          lead_status:
            leadStatus,

          workflow_status:
            `finance_${financialDecision}`,

          days_remaining:
            null,

          days_waiting:
            null,

          overdue:
            false,

          reminder_status:
            null,

          editable:
            false,
        });
      }


      /*
       * Rejected leads do not move to Technical Review.
       */

      if (
        financialDecision !==
        "approved"
      ) {

        continue;
      }


      const technical =
        technicalMap.get(
          lead.id
        );


      const technicalDecision =
        technical
          ?.decision ??
        "pending";


      /*
       * TECHNICAL PENDING
       */

      if (
        technicalDecision ===
        "pending"
      ) {

        events.push({
          id:
            `technical-pending-${lead.id}`,

          lead_id:
            lead.id,

          project_id:
            null,

          reminder_id:
            null,

          title,

          company_name:
            companyName,

          event_type:
            "technical_pending",

          label:
            "Technical Pending",

          description:
            "Financial Review approved. Waiting for Technical Review.",

          date:
            today,

          time:
            null,

          lead_status:
            leadStatus,

          workflow_status:
            "technical_pending",

          days_remaining:
            null,

          days_waiting:
            getDaysWaiting(
              financialDate
            ),

          overdue:
            false,

          reminder_status:
            null,

          editable:
            false,
        });


        continue;
      }


      const technicalDate =
        toDateOnly(
          technical
            ?.reviewed_at ||
          technical
            ?.updated_at ||
          technical
            ?.created_at
        );


      if (
        technicalDate
      ) {

        const approved =
          technicalDecision ===
          "approved";


        events.push({
          id:
            `technical-${technicalDecision}-${technical.id}`,

          lead_id:
            lead.id,

          project_id:
            null,

          reminder_id:
            null,

          title,

          company_name:
            companyName,

          event_type:
            approved
              ? "technical_approved"
              : "technical_rejected",

          label:
            approved
              ? "Technical Approved"
              : "Technical Rejected",

          description:
            technical
              ?.review_notes ??
            null,

          date:
            technicalDate,

          time:
            null,

          lead_status:
            leadStatus,

          workflow_status:
            `technical_${technicalDecision}`,

          days_remaining:
            null,

          days_waiting:
            null,

          overdue:
            false,

          reminder_status:
            null,

          editable:
            false,
        });
      }
    }


    /*
     * =====================================================
     * PROJECT / DELIVERY / COMPLETION EVENTS
     * =====================================================
     */

    for (
      const project of
      projects
    ) {

      const lead =
        leadMap.get(
          project.lead_id
        );


      if (
        !lead
      ) {

        continue;
      }


      const title =
        lead.title ||
        project.name ||
        "Untitled Lead";


      const companyName =
        getCompanyName(
          lead
        );


      const leadStatus =
        lead.status ??
        null;


      /*
       * PROJECT START
       */

      const plannedStartDate =
        toDateOnly(
          project
            .planned_start_date
        );


      if (
        plannedStartDate
      ) {

        events.push({
          id:
            `project-start-${project.id}`,

          lead_id:
            project.lead_id,

          project_id:
            project.id,

          reminder_id:
            null,

          title,

          company_name:
            companyName,

          event_type:
            "project_start",

          label:
            "Project Start",

          description:
            "Planned delivery start date.",

          date:
            plannedStartDate,

          time:
            null,

          lead_status:
            leadStatus,

          workflow_status:
            project.status,

          days_remaining:
            null,

          days_waiting:
            null,

          overdue:
            false,

          reminder_status:
            null,

          editable:
            false,
        });
      }


      /*
       * PROJECT DEADLINE
       */

      const plannedEndDate =
        toDateOnly(
          project
            .planned_end_date
        );


      if (
        plannedEndDate
      ) {

        const isCompleted =
          project.status ===
            "done" ||
          project
            .completion_review_status ===
            "confirmed";


        const remaining =
          isCompleted
            ? null
            : getDaysRemaining(
                plannedEndDate
              );


        events.push({
          id:
            `project-deadline-${project.id}`,

          lead_id:
            project.lead_id,

          project_id:
            project.id,

          reminder_id:
            null,

          title,

          company_name:
            companyName,

          event_type:
            "project_deadline",

          label:
            "Project Deadline",

          description:
            isCompleted
              ? "Project delivery deadline."
              : (
                  remaining ===
                  0
                    ? "Project is due today."
                    : remaining !==
                        null &&
                      remaining <
                        0
                      ? `${Math.abs(
                          remaining
                        )} day(s) overdue.`
                      : `${remaining} day(s) remaining.`
                ),

          date:
            plannedEndDate,

          time:
            null,

          lead_status:
            leadStatus,

          workflow_status:
            project.status,

          days_remaining:
            remaining,

          days_waiting:
            null,

          overdue:
            remaining !==
              null &&
            remaining <
              0,

          reminder_status:
            null,

          editable:
            false,
        });
      }


      /*
       * TEAM SUBMITTED COMPLETION
       */

      if (
        project
          .completion_review_status ===
        "pending_review"
      ) {

        const submissionDate =
          toDateOnly(
            project
              .team_completed_at
          ) ??
          today;


        events.push({
          id:
            `completion-pending-${project.id}`,

          lead_id:
            project.lead_id,

          project_id:
            project.id,

          reminder_id:
            null,

          title,

          company_name:
            companyName,

          event_type:
            "completion_pending",

          label:
            "Completion Review Pending",

          description:
            project
              .completion_notes ||
            "Team submitted the project for management review.",

          date:
            submissionDate,

          time:
            null,

          lead_status:
            leadStatus,

          workflow_status:
            "pending_review",

          days_remaining:
            null,

          days_waiting:
            getDaysWaiting(
              submissionDate
            ),

          overdue:
            false,

          reminder_status:
            null,

          editable:
            false,
        });
      }


      /*
       * CHANGES REQUIRED
       */

      if (
        project
          .completion_review_status ===
        "changes_requested"
      ) {

        const changesDate =
          toDateOnly(
            project
              .senior_reviewed_at ||
            project
              .updated_at
          ) ??
          today;


        events.push({
          id:
            `changes-required-${project.id}`,

          lead_id:
            project.lead_id,

          project_id:
            project.id,

          reminder_id:
            null,

          title,

          company_name:
            companyName,

          event_type:
            "changes_required",

          label:
            "Changes Required",

          description:
            project
              .senior_review_notes ||
            "Management requested project changes.",

          date:
            changesDate,

          time:
            null,

          lead_status:
            leadStatus,

          workflow_status:
            "changes_requested",

          days_remaining:
            null,

          days_waiting:
            getDaysWaiting(
              changesDate
            ),

          overdue:
            false,

          reminder_status:
            null,

          editable:
            false,
        });
      }


      /*
       * COMPLETED
       */

      if (
        project.status ===
          "done" ||
        project
          .completion_review_status ===
          "confirmed"
      ) {

        const completedDate =
          toDateOnly(
            project
              .actual_end_date ||
            project
              .final_update_at ||
            project
              .senior_reviewed_at
          );


        if (
          completedDate
        ) {

          events.push({
            id:
              `completed-${project.id}`,

            lead_id:
              project.lead_id,

            project_id:
              project.id,

            reminder_id:
              null,

            title,

            company_name:
              companyName,

            event_type:
              "completed",

            label:
              "Completed",

            description:
              project
                .senior_review_notes ||
              "Project confirmed completed.",

            date:
              completedDate,

            time:
              null,

            lead_status:
              leadStatus,

            workflow_status:
              "confirmed",

            days_remaining:
              null,

            days_waiting:
              null,

            overdue:
              false,

            reminder_status:
              null,

            editable:
              false,
          });
        }
      }
    }


    /*
     * =====================================================
     * USER REMINDERS
     * =====================================================
     */

    for (
      const reminder of
      reminders
    ) {

      const lead =
        leadMap.get(
          reminder.lead_id
        );


      if (
        !lead
      ) {

        continue;
      }


      const remaining =
        reminder.status ===
          "pending"
          ? getDaysRemaining(
              reminder
                .reminder_date
            )
          : null;


      events.push({
        id:
          `reminder-${reminder.id}`,

        lead_id:
          reminder.lead_id,

        project_id:
          null,

        reminder_id:
          reminder.id,

        title:
          lead.title ||
          "Untitled Lead",

        company_name:
          getCompanyName(
            lead
          ),

        event_type:
          "reminder",

        label:
          reminder.title,

        description:
          reminder.description ??
          null,

        date:
          reminder
            .reminder_date,

        time:
          reminder
            .reminder_time ??
          null,

        lead_status:
          lead.status ??
          null,

        workflow_status:
          reminder
            .reminder_type,

        days_remaining:
          remaining,

        days_waiting:
          null,

        overdue:
          reminder.status ===
            "pending" &&
          remaining !==
            null &&
          remaining <
            0,

        reminder_status:
          reminder.status,

        editable:
          true,
      });
    }


    /*
     * =====================================================
     * FILTER REQUESTED DATE RANGE
     * =====================================================
     */

    return events
      .filter(
        (
          event
        ) =>
          inDateRange(
            event.date,
            from,
            to
          )
      )
      .sort(
        (
          a,
          b
        ) => {

          if (
            a.date !==
            b.date
          ) {

            return a.date.localeCompare(
              b.date
            );
          }


          return a.label.localeCompare(
            b.label
          );
        }
      );
  };


/*
 * =========================================================
 * REMINDER LIST
 * =========================================================
 */

export const getCalendarReminders =
  async (
    userId: string
  ) => {

    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from(
          "lead_calendar_reminders"
        )
        .select(`
          id,
          lead_id,
          title,
          description,
          reminder_date,
          reminder_time,
          reminder_type,
          status,
          created_by,
          created_at,
          updated_at
        `)
        .eq(
          "created_by",
          userId
        )
        .order(
          "reminder_date",
          {
            ascending: true,
          }
        );


    if (
      error
    ) {

      throw new Error(
        `Unable to load reminders: ${error.message}`
      );
    }


    return (
      data ??
      []
    );
  };


/*
 * =========================================================
 * CREATE REMINDER
 * =========================================================
 */

export const createCalendarReminder =
  async (
    input:
      CreateReminderInput
  ) => {

    const {
      data:
        lead,

      error:
        leadError,
    } =
      await supabaseAdmin
        .from("leads")
        .select(
          "id"
        )
        .eq(
          "id",
          input.leadId
        )
        .maybeSingle();


    if (
      leadError ||
      !lead
    ) {

      throw new Error(
        "Lead not found"
      );
    }


    const title =
      input.title.trim();


    if (
      !title
    ) {

      throw new Error(
        "Reminder title is required"
      );
    }


    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from(
          "lead_calendar_reminders"
        )
        .insert({
          lead_id:
            input.leadId,

          title,

          description:
            input.description
              ?.trim() ||
            null,

          reminder_date:
            input
              .reminderDate,

          reminder_time:
            input
              .reminderTime ||
            null,

          reminder_type:
            input
              .reminderType,

          status:
            "pending",

          created_by:
            input
              .createdBy,
        })
        .select()
        .single();


    if (
      error ||
      !data
    ) {

      throw new Error(
        `Unable to create reminder: ${
          error?.message ||
          "Unknown database error"
        }`
      );
    }


    return data;
  };


/*
 * =========================================================
 * UPDATE REMINDER
 * =========================================================
 */

export const updateCalendarReminder =
  async (
    reminderId: string,

    userId: string,

    input:
      UpdateReminderInput
  ) => {

    const updates:
      Record<
        string,
        unknown
      > =
      {};


    if (
      input.title !==
      undefined
    ) {

      const title =
        input.title.trim();


      if (
        !title
      ) {

        throw new Error(
          "Reminder title is required"
        );
      }


      updates.title =
        title;
    }


    if (
      input.description !==
      undefined
    ) {

      updates.description =
        input.description
          ?.trim() ||
        null;
    }


    if (
      input.reminderDate !==
      undefined
    ) {

      updates.reminder_date =
        input.reminderDate;
    }


    if (
      input.reminderTime !==
      undefined
    ) {

      updates.reminder_time =
        input.reminderTime ||
        null;
    }


    if (
      input.reminderType !==
      undefined
    ) {

      updates.reminder_type =
        input.reminderType;
    }


    if (
      input.status !==
      undefined
    ) {

      updates.status =
        input.status;
    }


    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from(
          "lead_calendar_reminders"
        )
        .update(
          updates
        )
        .eq(
          "id",
          reminderId
        )
        .eq(
          "created_by",
          userId
        )
        .select()
        .maybeSingle();


    if (
      error
    ) {

      throw new Error(
        `Unable to update reminder: ${error.message}`
      );
    }


    if (
      !data
    ) {

      throw new Error(
        "Reminder not found"
      );
    }


    return data;
  };


/*
 * =========================================================
 * DELETE REMINDER
 * =========================================================
 */

export const deleteCalendarReminder =
  async (
    reminderId: string,

    userId: string
  ) => {

    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from(
          "lead_calendar_reminders"
        )
        .delete()
        .eq(
          "id",
          reminderId
        )
        .eq(
          "created_by",
          userId
        )
        .select(
          "id"
        )
        .maybeSingle();


    if (
      error
    ) {

      throw new Error(
        `Unable to delete reminder: ${error.message}`
      );
    }


    if (
      !data
    ) {

      throw new Error(
        "Reminder not found"
      );
    }
  };