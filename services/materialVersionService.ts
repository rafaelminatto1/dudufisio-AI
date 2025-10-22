import { v4 as uuidv4 } from 'uuid';
import { MaterialVersion } from '../types';

// Mock data para desenvolvimento
const mockVersions: MaterialVersion[] = [];

interface DiffResult {
  added: string[];
  removed: string[];
  modified: string[];
  unchanged: string[];
}

class MaterialVersionService {
  private versions: MaterialVersion[] = [...mockVersions];

  // Criar nova versão
  async createVersion(
    materialId: string,
    content: string,
    changes: string,
    createdBy: string
  ): Promise<MaterialVersion> {
    // Obter versão anterior
    const previousVersions = this.versions.filter(v => v.materialId === materialId);
    const latestVersion = previousVersions.length > 0
      ? Math.max(...previousVersions.map(v => v.version))
      : 0;

    const newVersion: MaterialVersion = {
      id: uuidv4(),
      materialId,
      version: latestVersion + 1,
      content,
      changes,
      createdBy,
      createdAt: new Date().toISOString(),
    };

    this.versions.push(newVersion);
    return newVersion;
  }

  // Listar versões de um material
  async getVersionsByMaterialId(materialId: string): Promise<MaterialVersion[]> {
    return this.versions
      .filter(v => v.materialId === materialId)
      .sort((a, b) => b.version - a.version);
  }

  // Obter versão específica
  async getVersion(materialId: string, version: number): Promise<MaterialVersion | null> {
    return this.versions.find(
      v => v.materialId === materialId && v.version === version
    ) || null;
  }

  // Obter última versão
  async getLatestVersion(materialId: string): Promise<MaterialVersion | null> {
    const versions = await this.getVersionsByMaterialId(materialId);
    return versions.length > 0 ? versions[0] : null;
  }

  // Comparar duas versões (diff simplificado)
  async compareVersions(materialId: string, version1: number, version2: number): Promise<DiffResult> {
    const v1 = await this.getVersion(materialId, version1);
    const v2 = await this.getVersion(materialId, version2);

    if (!v1 || !v2) {
      throw new Error('Versão não encontrada');
    }

    // Diff simplificado baseado em linhas
    const lines1 = v1.content.split('\n');
    const lines2 = v2.content.split('\n');

    const added: string[] = [];
    const removed: string[] = [];
    const modified: string[] = [];
    const unchanged: string[] = [];

    // Algoritmo de diff simples (pode ser melhorado com biblioteca como 'diff')
    const maxLen = Math.max(lines1.length, lines2.length);
    
    for (let i = 0; i < maxLen; i++) {
      const line1 = lines1[i];
      const line2 = lines2[i];

      if (line1 === undefined && line2 !== undefined) {
        added.push(line2);
      } else if (line1 !== undefined && line2 === undefined) {
        removed.push(line1);
      } else if (line1 !== line2) {
        modified.push(`${line1} → ${line2}`);
      } else {
        unchanged.push(line1);
      }
    }

    return { added, removed, modified, unchanged };
  }

  // Restaurar para uma versão específica
  async restoreVersion(materialId: string, version: number): Promise<MaterialVersion | null> {
    const versionToRestore = await this.getVersion(materialId, version);
    if (!versionToRestore) return null;

    // Criar nova versão com o conteúdo restaurado
    return await this.createVersion(
      materialId,
      versionToRestore.content,
      `Restaurado da versão ${version}`,
      versionToRestore.createdBy
    );
  }

  // Obter histórico completo
  async getVersionHistory(materialId: string): Promise<{
    versions: MaterialVersion[];
    totalVersions: number;
    firstVersion: MaterialVersion | null;
    latestVersion: MaterialVersion | null;
  }> {
    const versions = await this.getVersionsByMaterialId(materialId);
    
    return {
      versions,
      totalVersions: versions.length,
      firstVersion: versions.length > 0 ? versions[versions.length - 1] : null,
      latestVersion: versions.length > 0 ? versions[0] : null,
    };
  }

  // Obter estatísticas de edição
  async getVersionStatistics(materialId: string): Promise<{
    totalVersions: number;
    totalEditors: number;
    editsByEditor: Record<string, number>;
    lastEditDate: string | null;
    averageTimeBetweenEdits: number; // em minutos
  }> {
    const versions = await this.getVersionsByMaterialId(materialId);

    if (versions.length === 0) {
      return {
        totalVersions: 0,
        totalEditors: 0,
        editsByEditor: {},
        lastEditDate: null,
        averageTimeBetweenEdits: 0,
      };
    }

    const editsByEditor: Record<string, number> = {};
    versions.forEach(v => {
      editsByEditor[v.createdBy] = (editsByEditor[v.createdBy] || 0) + 1;
    });

    // Calcular tempo médio entre edições
    let totalTimeDiff = 0;
    for (let i = 0; i < versions.length - 1; i++) {
      const time1 = new Date(versions[i].createdAt).getTime();
      const time2 = new Date(versions[i + 1].createdAt).getTime();
      totalTimeDiff += Math.abs(time1 - time2);
    }
    
    const averageTimeBetweenEdits = versions.length > 1
      ? totalTimeDiff / (versions.length - 1) / 60000 // converter para minutos
      : 0;

    return {
      totalVersions: versions.length,
      totalEditors: Object.keys(editsByEditor).length,
      editsByEditor,
      lastEditDate: versions[0].createdAt,
      averageTimeBetweenEdits,
    };
  }

  // Deletar versões antigas (manter apenas N últimas)
  async pruneOldVersions(materialId: string, keepLast: number = 10): Promise<number> {
    const versions = await this.getVersionsByMaterialId(materialId);
    
    if (versions.length <= keepLast) return 0;

    const toDelete = versions.slice(keepLast);
    const idsToDelete = toDelete.map(v => v.id);

    this.versions = this.versions.filter(v => !idsToDelete.includes(v.id));
    
    return toDelete.length;
  }
}

export const materialVersionService = new MaterialVersionService();
export default materialVersionService;

