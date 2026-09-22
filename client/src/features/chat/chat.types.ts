export interface ChatProfile {
  id: string;

  full_name:
    string | null;

  email: string;

  role: string;

  availability_status?:
    string | null;
}


export interface ChatConversationMember {
  conversation_id:
    string;

  user_id:
    string;

  member_role:
    "owner" |
    "admin" |
    "member";

  joined_at:
    string;

  last_read_at:
    string | null;

  profile:
    ChatProfile | null;
}


export interface ChatLastMessage {
  id: string;

  sender_id: string;

  body:
    string | null;

  message_type:
    "text" |
    "file" |
    "system";

  deleted_at:
    string | null;

  created_at:
    string;

  sender:
    ChatProfile | null;
}


export interface ChatConversation {
  id: string;

  type:
    "direct" |
    "group";

  name:
    string | null;

  direct_key:
    string | null;

  created_by:
    string;

  last_message_at:
    string | null;

  created_at:
    string;

  updated_at:
    string;

  members:
    ChatConversationMember[];

  unread_count:
    number;

  unread_mention_count:
    number;

  last_message:
    ChatLastMessage | null;
}


export interface ChatAttachment {
  id: string;

  message_id:
    string;

  conversation_id:
    string;

  uploaded_by:
    string;

  storage_path:
    string;

  file_name:
    string;

  mime_type:
    string;

  size_bytes:
    number;

  created_at:
    string;
}


export interface ChatReaction {
  emoji: string;

  count: number;

  user_ids: string[];

  reacted_by_me:
    boolean;
}


export interface ChatMention {
  user_id: string;

  profile:
    ChatProfile | null;
}


export interface ChatReplyPreview {
  id: string;

  body:
    string | null;

  sender_id:
    string;

  deleted_at:
    string | null;

  created_at:
    string;

  sender:
    ChatProfile | null;
}


export interface ChatMessage {
  id: string;

  conversation_id:
    string;

  sender_id:
    string;

  body:
    string | null;

  message_type:
    "text" |
    "file" |
    "system";

  reply_to_message_id:
    string | null;

  edited_at:
    string | null;

  deleted_at:
    string | null;

  created_at:
    string;

  updated_at:
    string;

  sender:
    ChatProfile | null;

  reply_to:
    ChatReplyPreview | null;

  attachments:
    ChatAttachment[];

  reactions:
    ChatReaction[];

  mentions:
    ChatMention[];

  read_by:
    string[];
}