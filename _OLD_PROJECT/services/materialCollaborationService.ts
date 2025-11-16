import { v4 as uuidv4 } from 'uuid';
import { MaterialCollaborator } from '../types';

// Mock data para desenvolvimento
const mockCollaborators: MaterialCollaborator[] = [];

class MaterialCollaborationService {
  private collaborators: MaterialCollaborator[] = [...mockCollaborators];

  // Listar colaboradores de um material
  async getCollaboratorsByMaterialId(materialId: string): Promise<MaterialCollaborator[]> {
    return this.collaborators.filter(c => c.materialId === materialId)
      .sort((a, b) => {
        // Owner primeiro, depois editores, depois visualizadores
        const roleOrder = { owner: 0, editor: 1, viewer: 2 };
        return roleOrder[a.role] - roleOrder[b.role];
      });
  }

  // Adicionar colaborador
  async addCollaborator(data: Omit<MaterialCollaborator, 'id' | 'invitedAt' | 'lastAccessAt'>): Promise<MaterialCollaborator> {
    // Verificar se já existe
    const existing = this.collaborators.find(
      c => c.materialId === data.materialId && c.userId === data.userId
    );

    if (existing) {
      throw new Error('Usuário já é colaborador deste material');
    }

    const newCollaborator: MaterialCollaborator = {
      ...data,
      id: uuidv4(),
      invitedAt: new Date().toISOString(),
    };

    this.collaborators.push(newCollaborator);
    return newCollaborator;
  }

  // Atualizar role do colaborador
  async updateCollaboratorRole(id: string, role: 'editor' | 'viewer'): Promise<MaterialCollaborator | null> {
    const index = this.collaborators.findIndex(c => c.id === id);
    if (index === -1) return null;

    // Não permitir mudar role do owner
    if (this.collaborators[index].role === 'owner') {
      throw new Error('Não é possível alterar a role do proprietário');
    }

    this.collaborators[index] = {
      ...this.collaborators[index],
      role,
    };

    return this.collaborators[index];
  }

  // Remover colaborador
  async removeCollaborator(id: string): Promise<boolean> {
    const collaborator = this.collaborators.find(c => c.id === id);
    
    if (!collaborator) return false;

    // Não permitir remover owner
    if (collaborator.role === 'owner') {
      throw new Error('Não é possível remover o proprietário');
    }

    this.collaborators = this.collaborators.filter(c => c.id !== id);
    return true;
  }

  // Atualizar último acesso
  async updateLastAccess(materialId: string, userId: string): Promise<void> {
    const collaborator = this.collaborators.find(
      c => c.materialId === materialId && c.userId === userId
    );

    if (collaborator) {
      collaborator.lastAccessAt = new Date().toISOString();
    }
  }

  // Verificar permissão
  async hasPermission(materialId: string, userId: string, requiredRole: 'owner' | 'editor' | 'viewer'): Promise<boolean> {
    const collaborator = this.collaborators.find(
      c => c.materialId === materialId && c.userId === userId
    );

    if (!collaborator) return false;

    const roleLevel = { owner: 3, editor: 2, viewer: 1 };
    return roleLevel[collaborator.role] >= roleLevel[requiredRole];
  }

  // Obter role do usuário no material
  async getUserRole(materialId: string, userId: string): Promise<'owner' | 'editor' | 'viewer' | null> {
    const collaborator = this.collaborators.find(
      c => c.materialId === materialId && c.userId === userId
    );

    return collaborator?.role || null;
  }

  // Transferir propriedade
  async transferOwnership(materialId: string, newOwnerId: string, currentOwnerId: string): Promise<boolean> {
    const currentOwner = this.collaborators.find(
      c => c.materialId === materialId && c.userId === currentOwnerId && c.role === 'owner'
    );

    if (!currentOwner) {
      throw new Error('Usuário atual não é o proprietário');
    }

    const newOwner = this.collaborators.find(
      c => c.materialId === materialId && c.userId === newOwnerId
    );

    if (!newOwner) {
      throw new Error('Novo proprietário não é colaborador do material');
    }

    // Trocar roles
    currentOwner.role = 'editor';
    newOwner.role = 'owner';

    return true;
  }

  // Listar materiais onde o usuário é colaborador
  async getMaterialsByUser(userId: string): Promise<string[]> {
    return this.collaborators
      .filter(c => c.userId === userId)
      .map(c => c.materialId);
  }

  // Obter contagem de colaboradores
  async getCollaboratorCount(materialId: string): Promise<number> {
    return this.collaborators.filter(c => c.materialId === materialId).length;
  }
}

export const materialCollaborationService = new MaterialCollaborationService();
export default materialCollaborationService;

