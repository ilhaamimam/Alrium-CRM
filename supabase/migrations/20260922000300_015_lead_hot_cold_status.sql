-- =========================================================
-- CANONICAL HOT / COLD LEAD STATUS
-- =========================================================


-- =========================================================
-- 1. ADD STATUS COLUMN
-- =========================================================

alter table public.leads
add column if not exists status text;


-- =========================================================
-- 2. TRY TO COPY OLD HOT/COLD DATA
--
-- Some older versions of the CRM may have stored
-- Hot/Cold under another column name.
-- =========================================================

do $$
begin

    -- lead_status
    if exists (
        select 1
        from information_schema.columns
        where table_schema = 'public'
          and table_name = 'leads'
          and column_name = 'lead_status'
    ) then

        execute '
            update public.leads
            set status = lower(lead_status::text)
            where status is null
              and lower(lead_status::text) in (''hot'', ''cold'')
        ';

    end if;


    -- temperature
    if exists (
        select 1
        from information_schema.columns
        where table_schema = 'public'
          and table_name = 'leads'
          and column_name = 'temperature'
    ) then

        execute '
            update public.leads
            set status = lower(temperature::text)
            where status is null
              and lower(temperature::text) in (''hot'', ''cold'')
        ';

    end if;


    -- tag
    if exists (
        select 1
        from information_schema.columns
        where table_schema = 'public'
          and table_name = 'leads'
          and column_name = 'tag'
    ) then

        execute '
            update public.leads
            set status = lower(tag::text)
            where status is null
              and lower(tag::text) in (''hot'', ''cold'')
        ';

    end if;


    -- lead_type
    if exists (
        select 1
        from information_schema.columns
        where table_schema = 'public'
          and table_name = 'leads'
          and column_name = 'lead_type'
    ) then

        execute '
            update public.leads
            set status = lower(lead_type::text)
            where status is null
              and lower(lead_type::text) in (''hot'', ''cold'')
        ';

    end if;

end
$$;


-- =========================================================
-- 3. EXISTING LEADS WITHOUT A VALUE BECOME COLD
-- =========================================================

update public.leads
set status = 'cold'
where status is null;


-- Normalise casing.

update public.leads
set status = lower(status)
where status is not null;


-- =========================================================
-- 4. DEFAULT
-- =========================================================

alter table public.leads
alter column status
set default 'cold';


alter table public.leads
alter column status
set not null;


-- =========================================================
-- 5. VALIDATION
-- =========================================================

alter table public.leads
drop constraint if exists leads_status_check;


alter table public.leads
add constraint leads_status_check
check (
    status in (
        'cold',
        'hot'
    )
);


-- =========================================================
-- 6. INDEX
-- =========================================================

create index if not exists
idx_leads_status
on public.leads(status);


-- =========================================================
-- 7. RELOAD SUPABASE POSTGREST SCHEMA
-- =========================================================

notify pgrst, 'reload schema';