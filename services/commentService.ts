// services/commentService.ts

export interface Comment {
  id: string;
  videoId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  likes: number;
  replies: Comment[];
  parentId?: string;
  isEdited: boolean;
}

class CommentService {
  private comments: Map<string, Comment> = new Map();
  private videoComments: Map<string, string[]> = new Map(); // videoId -> commentIds[]

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    const mockComments: Comment[] = [
      {
        id: 'comment-001',
        videoId: 'video-jiujitsu-001',
        userId: 'user-001',
        userName: 'Dr. Carlos Silva',
        userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
        content: 'Excelente técnica! Muito bem explicada e demonstrada. Vou usar com meus alunos.',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        likes: 15,
        replies: [],
        isEdited: false,
      },
      {
        id: 'comment-002',
        videoId: 'video-jiujitsu-001',
        userId: 'user-002',
        userName: 'Ana Rodrigues',
        userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana',
        content: 'Qual a melhor forma de progredir depois dessa técnica?',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
        likes: 8,
        replies: [
          {
            id: 'comment-003',
            videoId: 'video-jiujitsu-001',
            userId: 'user-001',
            userName: 'Dr. Carlos Silva',
            userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
            content: 'Depois de dominar essa passagem, recomendo praticar o controle lateral.',
            createdAt: new Date(Date.now() - 43200000).toISOString(),
            updatedAt: new Date(Date.now() - 43200000).toISOString(),
            likes: 5,
            replies: [],
            parentId: 'comment-002',
            isEdited: false,
          },
        ],
        isEdited: false,
      },
    ];

    mockComments.forEach(comment => {
      this.comments.set(comment.id, comment);
      
      const videoComments = this.videoComments.get(comment.videoId) || [];
      if (!comment.parentId) {
        videoComments.push(comment.id);
        this.videoComments.set(comment.videoId, videoComments);
      }
    });
  }

  async createComment(
    data: Omit<Comment, 'id' | 'createdAt' | 'updatedAt' | 'likes' | 'replies' | 'isEdited'>
  ): Promise<Comment> {
    const newComment: Comment = {
      ...data,
      id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      likes: 0,
      replies: [],
      isEdited: false,
    };

    this.comments.set(newComment.id, newComment);

    if (!newComment.parentId) {
      const videoComments = this.videoComments.get(newComment.videoId) || [];
      videoComments.push(newComment.id);
      this.videoComments.set(newComment.videoId, videoComments);
    } else {
      // Add to parent's replies
      const parentComment = this.comments.get(newComment.parentId);
      if (parentComment) {
        parentComment.replies.push(newComment);
        this.comments.set(parentComment.id, parentComment);
      }
    }

    return newComment;
  }

  async getCommentsByVideo(videoId: string): Promise<Comment[]> {
    const commentIds = this.videoComments.get(videoId) || [];
    return commentIds
      .map(id => this.comments.get(id))
      .filter(Boolean) as Comment[];
  }

  async updateComment(id: string, content: string): Promise<Comment | null> {
    const comment = this.comments.get(id);
    if (!comment) return null;

    comment.content = content;
    comment.updatedAt = new Date().toISOString();
    comment.isEdited = true;

    this.comments.set(id, comment);
    return comment;
  }

  async deleteComment(id: string): Promise<boolean> {
    const comment = this.comments.get(id);
    if (!comment) return false;

    // Remove from video comments
    if (!comment.parentId) {
      const videoComments = this.videoComments.get(comment.videoId) || [];
      this.videoComments.set(
        comment.videoId,
        videoComments.filter(cId => cId !== id)
      );
    } else {
      // Remove from parent's replies
      const parentComment = this.comments.get(comment.parentId);
      if (parentComment) {
        parentComment.replies = parentComment.replies.filter(r => r.id !== id);
        this.comments.set(parentComment.id, parentComment);
      }
    }

    return this.comments.delete(id);
  }

  async likeComment(id: string): Promise<boolean> {
    const comment = this.comments.get(id);
    if (!comment) return false;

    comment.likes++;
    this.comments.set(id, comment);

    // Update in parent if it's a reply
    if (comment.parentId) {
      const parentComment = this.comments.get(comment.parentId);
      if (parentComment) {
        const replyIndex = parentComment.replies.findIndex(r => r.id === id);
        if (replyIndex !== -1) {
          parentComment.replies[replyIndex] = comment;
          this.comments.set(parentComment.id, parentComment);
        }
      }
    }

    return true;
  }

  async getCommentCount(videoId: string): Promise<number> {
    const comments = await this.getCommentsByVideo(videoId);
    let total = comments.length;
    comments.forEach(comment => {
      total += comment.replies.length;
    });
    return total;
  }
}

export const commentService = new CommentService();
export default commentService;
