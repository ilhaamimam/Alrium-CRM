/*
 * =========================================================
 * ALTRIUM CRM CALENDAR / LEAD REMINDERS
 *
 * Existing CRM tables are NOT modified.
 *
 * System calendar events are derived from:
 *
 * leads
 * financial_reviews
 * technical_reviews
 * projects
 *
 * This table stores only user-created reminders.
 * =========================================================
 */

create table if not exists public.lead_calendar_reminders (
    id uuid primary key
        default gen_random_uuid(),

    lead_id uuid not null
        references public.leads(id)
        on delete cascade,

    title text not null,

    description text null,

    reminder_date date not null,

    reminder_time time null,

    reminder_type text not null
        default 'follow_up'
        check (
            reminder_type in (
                'follow_up',
                'pending_update',
                'meeting',
                'deadline',
                'custom'
            )
        ),

    status text not null
        default 'pending'
        check (
            status in (
                'pending',
                'done',
                'dismissed'
            )
        ),

    created_by uuid not null
        references public.profiles(id)
        on delete cascade,

    created_at timestamptz not null
        default now(),

    updated_at timestamptz not null
        default now()
);


create index if not exists
    idx_lead_calendar_reminders_lead
on public.lead_calendar_reminders(lead_id);


create index if not exists
    idx_lead_calendar_reminders_date
on public.lead_calendar_reminders(reminder_date);


create index if not exists
    idx_lead_calendar_reminders_user
on public.lead_calendar_reminders(created_by);


create index if not exists
    idx_lead_calendar_reminders_status
on public.lead_calendar_reminders(status);


/*
 * =========================================================
 * UPDATED_AT
 * =========================================================
 */

create or replace function public.calendar_set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;


drop trigger if exists
    trg_lead_calendar_reminders_updated_at
on public.lead_calendar_reminders;


create trigger
    trg_lead_calendar_reminders_updated_at
before update
on public.lead_calendar_reminders
for each row
execute function
    public.calendar_set_updated_at();


/*
 * =========================================================
 * RLS
 * =========================================================
 */

alter table public.lead_calendar_reminders
enable row level security;


/*
 * Users can see their own reminders.
 */

drop policy if exists
    "users can view own calendar reminders"
on public.lead_calendar_reminders;


create policy
    "users can view own calendar reminders"
on public.lead_calendar_reminders
for select
to authenticated
using (
    created_by = auth.uid()
);


/*
 * Users can create their own reminders.
 */

drop policy if exists
    "users can create own calendar reminders"
on public.lead_calendar_reminders;


create policy
    "users can create own calendar reminders"
on public.lead_calendar_reminders
for insert
to authenticated
with check (
    created_by = auth.uid()
);


/*
 * Users can update their own reminders.
 */

drop policy if exists
    "users can update own calendar reminders"
on public.lead_calendar_reminders;


create policy
    "users can update own calendar reminders"
on public.lead_calendar_reminders
for update
to authenticated
using (
    created_by = auth.uid()
)
with check (
    created_by = auth.uid()
);


/*
 * Users can delete their own reminders.
 */

drop policy if exists
    "users can delete own calendar reminders"
on public.lead_calendar_reminders;


create policy
    "users can delete own calendar reminders"
on public.lead_calendar_reminders
for delete
to authenticated
using (
    created_by = auth.uid()
);