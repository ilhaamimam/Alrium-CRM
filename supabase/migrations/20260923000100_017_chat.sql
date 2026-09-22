/*
 * =========================================================
 * ALTRIUM CRM CHAT
 *
 * Completely independent from the existing CRM workflow.
 * Existing tables are NOT modified.
 * =========================================================
 */


/*
 * =========================================================
 * CONVERSATIONS
 * =========================================================
 */

create table if not exists public.chat_conversations (
    id uuid primary key default gen_random_uuid(),

    type text not null
        check (
            type in (
                'direct',
                'group'
            )
        ),

    name text null,

    /*
     * For direct chats:
     *
     * smaller-user-uuid:larger-user-uuid
     *
     * This guarantees only one direct conversation
     * between the same two people.
     */
    direct_key text null,

    created_by uuid not null
        references public.profiles(id)
        on delete cascade,

    last_message_at timestamptz null,

    created_at timestamptz not null
        default now(),

    updated_at timestamptz not null
        default now(),

    constraint chat_group_name_check
        check (
            type <> 'group'
            or (
                name is not null
                and length(trim(name)) > 0
            )
        )
);


create unique index if not exists
    idx_chat_conversations_direct_key
on public.chat_conversations(direct_key)
where direct_key is not null;


create index if not exists
    idx_chat_conversations_last_message
on public.chat_conversations(last_message_at desc);


/*
 * =========================================================
 * CONVERSATION MEMBERS
 * =========================================================
 */

create table if not exists public.chat_conversation_members (
    conversation_id uuid not null
        references public.chat_conversations(id)
        on delete cascade,

    user_id uuid not null
        references public.profiles(id)
        on delete cascade,

    member_role text not null
        default 'member'
        check (
            member_role in (
                'owner',
                'admin',
                'member'
            )
        ),

    joined_at timestamptz not null
        default now(),

    last_read_at timestamptz null,

    primary key (
        conversation_id,
        user_id
    )
);


create index if not exists
    idx_chat_members_user
on public.chat_conversation_members(user_id);


create index if not exists
    idx_chat_members_conversation
on public.chat_conversation_members(conversation_id);


/*
 * =========================================================
 * MESSAGES
 * =========================================================
 */

create table if not exists public.chat_messages (
    id uuid primary key
        default gen_random_uuid(),

    conversation_id uuid not null
        references public.chat_conversations(id)
        on delete cascade,

    sender_id uuid not null
        references public.profiles(id)
        on delete cascade,

    body text null,

    message_type text not null
        default 'text'
        check (
            message_type in (
                'text',
                'file',
                'system'
            )
        ),

    reply_to_message_id uuid null
        references public.chat_messages(id)
        on delete set null,

    edited_at timestamptz null,

    deleted_at timestamptz null,

    created_at timestamptz not null
        default now(),

    updated_at timestamptz not null
        default now()
);


create index if not exists
    idx_chat_messages_conversation_created
on public.chat_messages(
    conversation_id,
    created_at desc
);


create index if not exists
    idx_chat_messages_sender
on public.chat_messages(sender_id);


/*
 * =========================================================
 * MENTIONS
 * =========================================================
 */

create table if not exists public.chat_mentions (
    message_id uuid not null
        references public.chat_messages(id)
        on delete cascade,

    conversation_id uuid not null
        references public.chat_conversations(id)
        on delete cascade,

    user_id uuid not null
        references public.profiles(id)
        on delete cascade,

    created_at timestamptz not null
        default now(),

    primary key (
        message_id,
        user_id
    )
);


create index if not exists
    idx_chat_mentions_user
on public.chat_mentions(
    user_id,
    conversation_id,
    created_at desc
);


/*
 * =========================================================
 * READ RECEIPTS
 * =========================================================
 */

create table if not exists public.chat_message_reads (
    message_id uuid not null
        references public.chat_messages(id)
        on delete cascade,

    conversation_id uuid not null
        references public.chat_conversations(id)
        on delete cascade,

    user_id uuid not null
        references public.profiles(id)
        on delete cascade,

    read_at timestamptz not null
        default now(),

    primary key (
        message_id,
        user_id
    )
);


create index if not exists
    idx_chat_reads_conversation
on public.chat_message_reads(
    conversation_id,
    user_id
);


/*
 * =========================================================
 * REACTIONS
 * =========================================================
 */

create table if not exists public.chat_reactions (
    message_id uuid not null
        references public.chat_messages(id)
        on delete cascade,

    conversation_id uuid not null
        references public.chat_conversations(id)
        on delete cascade,

    user_id uuid not null
        references public.profiles(id)
        on delete cascade,

    emoji text not null,

    created_at timestamptz not null
        default now(),

    primary key (
        message_id,
        user_id,
        emoji
    )
);


create index if not exists
    idx_chat_reactions_conversation
on public.chat_reactions(conversation_id);


/*
 * =========================================================
 * ATTACHMENTS
 * =========================================================
 */

create table if not exists public.chat_attachments (
    id uuid primary key
        default gen_random_uuid(),

    message_id uuid not null
        references public.chat_messages(id)
        on delete cascade,

    conversation_id uuid not null
        references public.chat_conversations(id)
        on delete cascade,

    uploaded_by uuid not null
        references public.profiles(id)
        on delete cascade,

    storage_path text not null,

    file_name text not null,

    mime_type text not null,

    size_bytes bigint not null,

    created_at timestamptz not null
        default now()
);


create index if not exists
    idx_chat_attachments_message
on public.chat_attachments(message_id);


create index if not exists
    idx_chat_attachments_conversation
on public.chat_attachments(conversation_id);


/*
 * =========================================================
 * UPDATED_AT TRIGGER
 * =========================================================
 */

create or replace function public.chat_set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;


drop trigger if exists
    trg_chat_conversations_updated_at
on public.chat_conversations;


create trigger
    trg_chat_conversations_updated_at
before update
on public.chat_conversations
for each row
execute function
    public.chat_set_updated_at();


drop trigger if exists
    trg_chat_messages_updated_at
on public.chat_messages;


create trigger
    trg_chat_messages_updated_at
before update
on public.chat_messages
for each row
execute function
    public.chat_set_updated_at();


/*
 * =========================================================
 * RLS HELPER
 *
 * Used by realtime subscriptions.
 *
 * Users may only SELECT rows from conversations they belong
 * to.
 *
 * All writes are performed through your Express backend
 * using supabaseAdmin.
 * =========================================================
 */

create or replace function public.is_chat_member(
    p_conversation_id uuid,
    p_user_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1
        from public.chat_conversation_members m
        where
            m.conversation_id =
                p_conversation_id
            and
            m.user_id =
                p_user_id
    );
$$;


revoke all
on function public.is_chat_member(uuid, uuid)
from public;


grant execute
on function public.is_chat_member(uuid, uuid)
to authenticated;


/*
 * =========================================================
 * ENABLE RLS
 * =========================================================
 */

alter table public.chat_conversations
enable row level security;

alter table public.chat_conversation_members
enable row level security;

alter table public.chat_messages
enable row level security;

alter table public.chat_mentions
enable row level security;

alter table public.chat_message_reads
enable row level security;

alter table public.chat_reactions
enable row level security;

alter table public.chat_attachments
enable row level security;


/*
 * =========================================================
 * SELECT POLICIES
 * =========================================================
 */

drop policy if exists
    "chat conversation members can view conversations"
on public.chat_conversations;


create policy
    "chat conversation members can view conversations"
on public.chat_conversations
for select
to authenticated
using (
    public.is_chat_member(
        id,
        auth.uid()
    )
);


drop policy if exists
    "chat members can view conversation members"
on public.chat_conversation_members;


create policy
    "chat members can view conversation members"
on public.chat_conversation_members
for select
to authenticated
using (
    public.is_chat_member(
        conversation_id,
        auth.uid()
    )
);


drop policy if exists
    "chat members can view messages"
on public.chat_messages;


create policy
    "chat members can view messages"
on public.chat_messages
for select
to authenticated
using (
    public.is_chat_member(
        conversation_id,
        auth.uid()
    )
);


drop policy if exists
    "chat members can view mentions"
on public.chat_mentions;


create policy
    "chat members can view mentions"
on public.chat_mentions
for select
to authenticated
using (
    public.is_chat_member(
        conversation_id,
        auth.uid()
    )
);


drop policy if exists
    "chat members can view reads"
on public.chat_message_reads;


create policy
    "chat members can view reads"
on public.chat_message_reads
for select
to authenticated
using (
    public.is_chat_member(
        conversation_id,
        auth.uid()
    )
);


drop policy if exists
    "chat members can view reactions"
on public.chat_reactions;


create policy
    "chat members can view reactions"
on public.chat_reactions
for select
to authenticated
using (
    public.is_chat_member(
        conversation_id,
        auth.uid()
    )
);


drop policy if exists
    "chat members can view attachments"
on public.chat_attachments;


create policy
    "chat members can view attachments"
on public.chat_attachments
for select
to authenticated
using (
    public.is_chat_member(
        conversation_id,
        auth.uid()
    )
);


/*
 * =========================================================
 * PRIVATE STORAGE BUCKET
 *
 * Files are uploaded/downloaded only through Express.
 * =========================================================
 */

insert into storage.buckets (
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
)
values (
    'chat-attachments',
    'chat-attachments',
    false,
    10485760,
    array[
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'text/plain',
        'text/csv',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
)
on conflict (id)
do update set
    public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types =
        excluded.allowed_mime_types;


/*
 * =========================================================
 * REALTIME
 * =========================================================
 */

alter table public.chat_messages
replica identity full;

alter table public.chat_reactions
replica identity full;

alter table public.chat_message_reads
replica identity full;


do $$
begin

    if not exists (
        select 1
        from pg_publication_tables
        where
            pubname = 'supabase_realtime'
            and schemaname = 'public'
            and tablename = 'chat_messages'
    ) then

        alter publication supabase_realtime
        add table public.chat_messages;

    end if;


    if not exists (
        select 1
        from pg_publication_tables
        where
            pubname = 'supabase_realtime'
            and schemaname = 'public'
            and tablename = 'chat_reactions'
    ) then

        alter publication supabase_realtime
        add table public.chat_reactions;

    end if;


    if not exists (
        select 1
        from pg_publication_tables
        where
            pubname = 'supabase_realtime'
            and schemaname = 'public'
            and tablename = 'chat_message_reads'
    ) then

        alter publication supabase_realtime
        add table public.chat_message_reads;

    end if;

end
$$;