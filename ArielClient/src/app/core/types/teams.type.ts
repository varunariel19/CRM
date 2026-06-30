export interface TeamUser {
  id: string;
  name: string;
  email: string;
  profileImage?: string | null;
}

export interface TeamConversationMember extends TeamUser {
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
  seenByIds: string[];
  senderName: string;
  senderProfileImage?: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
  attachments: TeamMessageAttachment[];
  pending?: boolean;
  failed?: boolean;
  isEdited?: boolean;
  isDeleted?: boolean;
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
