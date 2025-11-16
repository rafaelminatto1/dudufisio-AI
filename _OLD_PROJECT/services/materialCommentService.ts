import { v4 as uuidv4 } from 'uuid';
import { MaterialComment } from '../types';

// Mock data para desenvolvimento
const mockComments: MaterialComment[] = [];

class MaterialCommentService {
  private comments: MaterialComment[] = [...mockComments];

  // Listar comentários de um material
  async getCommentsByMaterialId(materialId: string): Promise<MaterialComment[]> {
    const comments = this.comments.filter(c => c.materialId === materialId && !c.parentCommentId);
    
    // Adicionar replies a cada comentário
    return comments.map(comment => ({
      ...comment,
      replies: this.comments.filter(c => c.parentCommentId === comment.id)
    })).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  // Criar novo comentário
  async createComment(data: Omit<MaterialComment, 'id' | 'createdAt' | 'updatedAt' | 'replies'>): Promise<MaterialComment> {
    const newComment: MaterialComment = {
      ...data,
      id: uuidv4(),
      isResolved: false,
      createdAt: new Date().toISOString(),
      replies: [],
    };

    this.comments.push(newComment);
    return newComment;
  }

  // Atualizar comentário
  async updateComment(id: string, content: string): Promise<MaterialComment | null> {
    const index = this.comments.findIndex(c => c.id === id);
    if (index === -1) return null;

    this.comments[index] = {
      ...this.comments[index],
      content,
      updatedAt: new Date().toISOString(),
    };

    return this.comments[index];
  }

  // Deletar comentário
  async deleteComment(id: string): Promise<boolean> {
    const index = this.comments.findIndex(c => c.id === id);
    if (index === -1) return false;

    // Deletar também as replies
    this.comments = this.comments.filter(c => c.id !== id && c.parentCommentId !== id);
    return true;
  }

  // Resolver comentário
  async resolveComment(id: string, userId: string): Promise<MaterialComment | null> {
    const index = this.comments.findIndex(c => c.id === id);
    if (index === -1) return null;

    this.comments[index] = {
      ...this.comments[index],
      isResolved: true,
      resolvedBy: userId,
      resolvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return this.comments[index];
  }

  // Reabrir comentário
  async reopenComment(id: string): Promise<MaterialComment | null> {
    const index = this.comments.findIndex(c => c.id === id);
    if (index === -1) return null;

    this.comments[index] = {
      ...this.comments[index],
      isResolved: false,
      resolvedBy: undefined,
      resolvedAt: undefined,
      updatedAt: new Date().toISOString(),
    };

    return this.comments[index];
  }

  // Obter contagem de comentários por material
  async getCommentCount(materialId: string): Promise<number> {
    return this.comments.filter(c => c.materialId === materialId).length;
  }

  // Obter comentários não resolvidos
  async getUnresolvedComments(materialId: string): Promise<MaterialComment[]> {
    return this.comments.filter(c => c.materialId === materialId && !c.isResolved);
  }

  // Buscar comentários por menção
  async getCommentsByMention(userId: string): Promise<MaterialComment[]> {
    return this.comments.filter(c => c.mentions?.includes(userId));
  }
}

export const materialCommentService = new MaterialCommentService();
export default materialCommentService;

