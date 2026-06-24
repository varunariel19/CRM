export interface TeamUser {
  id: string;
  name: string;
  email: string;
  profileImage?: string | null;
}

export interface TeamConversationMember extends TeamUser {
  joinedAt: string;
  lastReadAt?: string | null;
}

export type TeamAttachmentType = 'image' | 'audio' | 'video' | 'document' | 'file';

export interface TeamMessageAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  uploadId: string;
  contentType: string;
  attachmentType: TeamAttachmentType;
  sizeBytes: number;
  createdAt: string;
}

export interface TeamMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderProfileImage?: string | null;
  body: string;
  sentAt: string;
  editedAt?: string | null;
  attachments: TeamMessageAttachment[];
  pending?: boolean;
  failed?: boolean;
}

export interface TeamConversation {
  id: string;
  name?: string | null;
  isGroup: boolean;
  createdById: string;
  createdAt: string;
  lastMessageAt?: string | null;
  members: TeamConversationMember[];
  lastMessage?: TeamMessage | null;
}

export interface TeamCallSignal {
  conversationId: string;
  callId: string;
  callType: 'voice' | 'video';
  signalType: 'incoming' | 'accepted' | 'declined' | 'ended';
  payload?: string | null;
}
