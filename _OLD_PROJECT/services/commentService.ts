import { AppointmentComment, CommentAttachment } from '../types/comments';

class CommentService {
  private comments: AppointmentComment[] = [];
  private initialized = false;

  private initialize() {
    if (this.initialized) return;
    
    const stored = localStorage.getItem('fisioflow-comments');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        this.comments = parsed.map((c: any) => ({
          ...c,
          createdAt: new Date(c.createdAt),
          updatedAt: c.updatedAt ? new Date(c.updatedAt) : undefined,
          attachments: c.attachments?.map((a: any) => ({
            ...a,
            uploadedAt: new Date(a.uploadedAt)
          }))
        }));
      } catch {
        this.comments = [];
      }
    }

    this.initialized = true;
  }

  private save() {
    localStorage.setItem('fisioflow-comments', JSON.stringify(this.comments));
  }

  async getCommentsByAppointment(appointmentId: string): Promise<AppointmentComment[]> {
    this.initialize();
    return new Promise(resolve => {
      setTimeout(() => {
        const filtered = this.comments
          .filter(c => c.appointmentId === appointmentId)
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        resolve(filtered);
      }, 100);
    });
  }

  async addComment(data: {
    appointmentId: string;
    userId: string;
    userName: string;
    userRole: string;
    content: string;
    attachments?: Omit<CommentAttachment, 'id' | 'uploadedAt'>[];
  }): Promise<AppointmentComment> {
    this.initialize();
    return new Promise(resolve => {
      setTimeout(() => {
        const newComment: AppointmentComment = {
          id: `comment-${Date.now()}`,
          appointmentId: data.appointmentId,
          userId: data.userId,
          userName: data.userName,
          userRole: data.userRole,
          content: data.content,
          createdAt: new Date(),
          isEdited: false,
          attachments: data.attachments?.map((a, idx) => ({
            ...a,
            id: `attach-${Date.now()}-${idx}`,
            uploadedAt: new Date()
          }))
        };

        this.comments.push(newComment);
        this.save();
        resolve(newComment);
      }, 200);
    });
  }

  async updateComment(id: string, content: string): Promise<AppointmentComment> {
    this.initialize();
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = this.comments.findIndex(c => c.id === id);
        if (index === -1) {
          reject(new Error('Comment not found'));
          return;
        }

        this.comments[index] = {
          ...this.comments[index],
          content,
          updatedAt: new Date(),
          isEdited: true
        };

        this.save();
        resolve(this.comments[index]);
      }, 200);
    });
  }

  async deleteComment(id: string): Promise<void> {
    this.initialize();
    return new Promise(resolve => {
      setTimeout(() => {
        this.comments = this.comments.filter(c => c.id !== id);
        this.save();
        resolve();
      }, 150);
    });
  }

  async getCommentCount(appointmentId: string): Promise<number> {
    this.initialize();
    return new Promise(resolve => {
      setTimeout(() => {
        const count = this.comments.filter(c => c.appointmentId === appointmentId).length;
        resolve(count);
      }, 50);
    });
  }
}

export const commentService = new CommentService();
