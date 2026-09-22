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


export type CalendarFilter =
  | "all"
  | "created"
  | "pending"
  | "deadlines"
  | "completed"
  | "reminders";


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

  editable: boolean;
}


export interface CalendarLeadOption {
  id: string;

  title: string;

  status:
    string | null;

  company_name:
    string | null;

  created_at:
    string | null;
}


export interface CalendarReminder {
  id: string;

  lead_id: string;

  title: string;

  description:
    string | null;

  reminder_date: string;

  reminder_time:
    string | null;

  reminder_type:
    ReminderType;

  status:
    ReminderStatus;

  created_by: string;

  created_at: string;

  updated_at: string;
}


export interface CreateCalendarReminderInput {
  leadId: string;

  title: string;

  description?:
    string | null;

  reminderDate: string;

  reminderTime?:
    string | null;

  reminderType:
    ReminderType;
}


export interface UpdateCalendarReminderInput {
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