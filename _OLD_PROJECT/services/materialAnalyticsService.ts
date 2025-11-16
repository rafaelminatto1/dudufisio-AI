import { v4 as uuidv4 } from 'uuid';

interface MaterialView {
  id: string;
  materialId: string;
  userId: string;
  viewedAt: string;
  duration: number; // segundos
  device: string;
}

interface MaterialEdit {
  id: string;
  materialId: string;
  userId: string;
  editedAt: string;
  changesCount: number;
}

interface MaterialShare {
  id: string;
  materialId: string;
  sharedBy: string;
  sharedWith: string[];
  sharedAt: string;
  method: 'email' | 'link' | 'direct';
}

interface MaterialAnalytics {
  materialId: string;
  totalViews: number;
  uniqueViewers: number;
  totalEdits: number;
  uniqueEditors: number;
  totalShares: number;
  averageViewDuration: number; // segundos
  popularityScore: number; // 0-100
  lastViewedAt: string | null;
  lastEditedAt: string | null;
  viewsByDay: Record<string, number>;
  viewsByUser: Record<string, number>;
  editsByUser: Record<string, number>;
}

class MaterialAnalyticsService {
  private views: MaterialView[] = [];
  private edits: MaterialEdit[] = [];
  private shares: MaterialShare[] = [];

  // Registrar visualização
  async trackView(materialId: string, userId: string, duration: number = 0, device: string = 'desktop'): Promise<void> {
    const view: MaterialView = {
      id: uuidv4(),
      materialId,
      userId,
      viewedAt: new Date().toISOString(),
      duration,
      device,
    };

    this.views.push(view);
  }

  // Registrar edição
  async trackEdit(materialId: string, userId: string, changesCount: number = 1): Promise<void> {
    const edit: MaterialEdit = {
      id: uuidv4(),
      materialId,
      userId,
      editedAt: new Date().toISOString(),
      changesCount,
    };

    this.edits.push(edit);
  }

  // Registrar compartilhamento
  async trackShare(materialId: string, sharedBy: string, sharedWith: string[], method: 'email' | 'link' | 'direct' = 'link'): Promise<void> {
    const share: MaterialShare = {
      id: uuidv4(),
      materialId,
      sharedBy,
      sharedWith,
      sharedAt: new Date().toISOString(),
      method,
    };

    this.shares.push(share);
  }

  // Obter analytics de um material
  async getMaterialAnalytics(materialId: string): Promise<MaterialAnalytics> {
    const materialViews = this.views.filter(v => v.materialId === materialId);
    const materialEdits = this.edits.filter(e => e.materialId === materialId);
    const materialShares = this.shares.filter(s => s.materialId === materialId);

    const uniqueViewers = new Set(materialViews.map(v => v.userId)).size;
    const uniqueEditors = new Set(materialEdits.map(e => e.userId)).size;

    const totalViewDuration = materialViews.reduce((sum, v) => sum + v.duration, 0);
    const averageViewDuration = materialViews.length > 0 ? totalViewDuration / materialViews.length : 0;

    // Calcular views por dia
    const viewsByDay: Record<string, number> = {};
    materialViews.forEach(v => {
      const date = v.viewedAt.split('T')[0];
      viewsByDay[date] = (viewsByDay[date] || 0) + 1;
    });

    // Calcular views por usuário
    const viewsByUser: Record<string, number> = {};
    materialViews.forEach(v => {
      viewsByUser[v.userId] = (viewsByUser[v.userId] || 0) + 1;
    });

    // Calcular edits por usuário
    const editsByUser: Record<string, number> = {};
    materialEdits.forEach(e => {
      editsByUser[e.userId] = (editsByUser[e.userId] || 0) + 1;
    });

    // Calcular score de popularidade (0-100)
    const viewScore = Math.min(materialViews.length / 10, 1) * 40;
    const editScore = Math.min(materialEdits.length / 5, 1) * 30;
    const shareScore = Math.min(materialShares.length / 3, 1) * 30;
    const popularityScore = Math.round(viewScore + editScore + shareScore);

    const lastViewedAt = materialViews.length > 0
      ? materialViews[materialViews.length - 1].viewedAt
      : null;

    const lastEditedAt = materialEdits.length > 0
      ? materialEdits[materialEdits.length - 1].editedAt
      : null;

    return {
      materialId,
      totalViews: materialViews.length,
      uniqueViewers,
      totalEdits: materialEdits.length,
      uniqueEditors,
      totalShares: materialShares.length,
      averageViewDuration,
      popularityScore,
      lastViewedAt,
      lastEditedAt,
      viewsByDay,
      viewsByUser,
      editsByUser,
    };
  }

  // Obter analytics gerais
  async getGlobalAnalytics(): Promise<{
    totalViews: number;
    totalEdits: number;
    totalShares: number;
    totalMaterials: number;
    mostViewedMaterials: Array<{ materialId: string; views: number }>;
    mostEditedMaterials: Array<{ materialId: string; edits: number }>;
    activeUsers: number;
    viewsThisWeek: number;
    viewsThisMonth: number;
  }> {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const viewsThisWeek = this.views.filter(v => new Date(v.viewedAt) >= weekAgo).length;
    const viewsThisMonth = this.views.filter(v => new Date(v.viewedAt) >= monthAgo).length;

    // Contagem de visualizações por material
    const viewsByMaterial: Record<string, number> = {};
    this.views.forEach(v => {
      viewsByMaterial[v.materialId] = (viewsByMaterial[v.materialId] || 0) + 1;
    });

    // Contagem de edições por material
    const editsByMaterial: Record<string, number> = {};
    this.edits.forEach(e => {
      editsByMaterial[e.materialId] = (editsByMaterial[e.materialId] || 0) + 1;
    });

    const mostViewedMaterials = Object.entries(viewsByMaterial)
      .map(([materialId, views]) => ({ materialId, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    const mostEditedMaterials = Object.entries(editsByMaterial)
      .map(([materialId, edits]) => ({ materialId, edits }))
      .sort((a, b) => b.edits - a.edits)
      .slice(0, 10);

    const activeUsers = new Set([
      ...this.views.map(v => v.userId),
      ...this.edits.map(e => e.userId)
    ]).size;

    const totalMaterials = new Set([
      ...this.views.map(v => v.materialId),
      ...this.edits.map(e => e.materialId)
    ]).size;

    return {
      totalViews: this.views.length,
      totalEdits: this.edits.length,
      totalShares: this.shares.length,
      totalMaterials,
      mostViewedMaterials,
      mostEditedMaterials,
      activeUsers,
      viewsThisWeek,
      viewsThisMonth,
    };
  }

  // Obter tendências
  async getTrends(days: number = 30): Promise<{
    dailyViews: Array<{ date: string; count: number }>;
    dailyEdits: Array<{ date: string; count: number }>;
    dailyShares: Array<{ date: string; count: number }>;
  }> {
    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const dailyViews: Record<string, number> = {};
    const dailyEdits: Record<string, number> = {};
    const dailyShares: Record<string, number> = {};

    this.views
      .filter(v => new Date(v.viewedAt) >= startDate)
      .forEach(v => {
        const date = v.viewedAt.split('T')[0];
        dailyViews[date] = (dailyViews[date] || 0) + 1;
      });

    this.edits
      .filter(e => new Date(e.editedAt) >= startDate)
      .forEach(e => {
        const date = e.editedAt.split('T')[0];
        dailyEdits[date] = (dailyEdits[date] || 0) + 1;
      });

    this.shares
      .filter(s => new Date(s.sharedAt) >= startDate)
      .forEach(s => {
        const date = s.sharedAt.split('T')[0];
        dailyShares[date] = (dailyShares[date] || 0) + 1;
      });

    return {
      dailyViews: Object.entries(dailyViews).map(([date, count]) => ({ date, count })),
      dailyEdits: Object.entries(dailyEdits).map(([date, count]) => ({ date, count })),
      dailyShares: Object.entries(dailyShares).map(([date, count]) => ({ date, count })),
    };
  }

  // Limpar dados antigos
  async pruneOldData(days: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const oldViewsCount = this.views.length;
    const oldEditsCount = this.edits.length;
    const oldSharesCount = this.shares.length;

    this.views = this.views.filter(v => new Date(v.viewedAt) >= cutoffDate);
    this.edits = this.edits.filter(e => new Date(e.editedAt) >= cutoffDate);
    this.shares = this.shares.filter(s => new Date(s.sharedAt) >= cutoffDate);

    return (oldViewsCount - this.views.length) + 
           (oldEditsCount - this.edits.length) + 
           (oldSharesCount - this.shares.length);
  }
}

export const materialAnalyticsService = new MaterialAnalyticsService();
export default materialAnalyticsService;

