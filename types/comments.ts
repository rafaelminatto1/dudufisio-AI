export interface AppointmentComment {
  id: string;
  appointmentId: string;
  userId: string;
  userName: string;
  userRole: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
  isEdited: boolean;
  attachments?: CommentAttachment[];
}

export interface CommentAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: Date;
}

