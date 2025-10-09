// services/exerciseProtocolService.ts
import { getClinicalProtocols, getExercises } from '../scripts/integrate-clinical-content-to-db';

export interface ExerciseProtocolLink {
  exerciseId: string;
  protocolId: string;
  phase?: string;
  order?: number;
  sets?: number;
  repetitions?: number;
  duration?: number;
  notes?: string;
}

export interface ProtocolWithExercises {
  protocol: any;
  exercises: Array<{
    exercise: any;
    link: ExerciseProtocolLink;
  }>;
}

export class ExerciseProtocolService {
  private links: ExerciseProtocolLink[] = [];

  constructor() {
    this.loadDefaultLinks();
  }

  // Carregar links padrão baseados no conteúdo clínico
  private loadDefaultLinks() {
    const protocols = getClinicalProtocols();
    const exercises = getExercises();

    // Links automáticos baseados em tags e especialidades
    protocols.forEach(protocol => {
      exercises.forEach(exercise => {
        if (this.shouldLink(protocol, exercise)) {
          this.addLink({
            exerciseId: exercise.id,
            protocolId: protocol.id,
            phase: this.getRelevantPhase(protocol, exercise),
            order: 1,
            sets: 3,
            repetitions: 10
          });
        }
      });
    });
  }

  // Verificar se exercício deve ser vinculado ao protocolo
  private shouldLink(protocol: any, exercise: any): boolean {
    // Mesma especialidade
    if (protocol.specialty === exercise.specialty) {
      return true;
    }

    // Tags em comum
    const protocolTags = protocol.tags || [];
    const exerciseTags = exercise.tags || [];
    const commonTags = protocolTags.filter((tag: string) => exerciseTags.includes(tag));
    
    if (commonTags.length > 0) {
      return true;
    }

    // Palavras-chave em comum no nome/descrição
    const protocolText = `${protocol.title} ${protocol.description}`.toLowerCase();
    const exerciseText = `${exercise.name} ${exercise.description}`.toLowerCase();
    
    const keywords = ['joelho', 'ombro', 'quadril', 'coluna', 'LCA', 'menisco', 'tendinite', 'bursite'];
    return keywords.some(keyword => 
      protocolText.includes(keyword) && exerciseText.includes(keyword)
    );
  }

  // Obter fase relevante do protocolo para o exercício
  private getRelevantPhase(protocol: any, exercise: any): string {
    const phases = protocol.phases || [];
    
    // Se exercício é de baixa dificuldade, fase inicial
    if (exercise.difficulty === 'beginner') {
      return phases[0]?.name || 'Fase 1';
    }
    
    // Se exercício é de alta dificuldade, fase avançada
    if (exercise.difficulty === 'advanced') {
      return phases[phases.length - 1]?.name || 'Fase Final';
    }
    
    // Caso contrário, fase intermediária
    const middleIndex = Math.floor(phases.length / 2);
    return phases[middleIndex]?.name || 'Fase Intermediária';
  }

  // Adicionar link entre exercício e protocolo
  addLink(link: ExerciseProtocolLink): void {
    // Verificar se já existe
    const exists = this.links.some(l => 
      l.exerciseId === link.exerciseId && l.protocolId === link.protocolId
    );
    
    if (!exists) {
      this.links.push(link);
    }
  }

  // Remover link
  removeLink(exerciseId: string, protocolId: string): void {
    this.links = this.links.filter(l => 
      !(l.exerciseId === exerciseId && l.protocolId === protocolId)
    );
  }

  // Obter protocolos vinculados a um exercício
  getProtocolsForExercise(exerciseId: string): any[] {
    const protocolLinks = this.links.filter(l => l.exerciseId === exerciseId);
    const protocols = getClinicalProtocols();
    
    return protocolLinks.map(link => {
      const protocol = protocols.find(p => p.id === link.protocolId);
      return protocol ? { ...protocol, link } : null;
    }).filter(Boolean);
  }

  // Obter exercícios vinculados a um protocolo
  getExercisesForProtocol(protocolId: string): any[] {
    const exerciseLinks = this.links.filter(l => l.protocolId === protocolId);
    const exercises = getExercises();
    
    return exerciseLinks.map(link => {
      const exercise = exercises.find(e => e.id === link.exerciseId);
      return exercise ? { ...exercise, link } : null;
    }).filter(Boolean);
  }

  // Obter todos os protocolos com seus exercícios
  getAllProtocolsWithExercises(): ProtocolWithExercises[] {
    const protocols = getClinicalProtocols();
    
    return protocols.map(protocol => ({
      protocol,
      exercises: this.getExercisesForProtocol(protocol.id)
    }));
  }

  // Obter estatísticas de vinculação
  getLinkStatistics() {
    const protocols = getClinicalProtocols();
    const exercises = getExercises();
    
    return {
      totalProtocols: protocols.length,
      totalExercises: exercises.length,
      totalLinks: this.links.length,
      protocolsWithExercises: protocols.filter(p => 
        this.links.some(l => l.protocolId === p.id)
      ).length,
      exercisesWithProtocols: exercises.filter(e => 
        this.links.some(l => l.exerciseId === e.id)
      ).length,
      averageExercisesPerProtocol: this.links.length / protocols.length,
      averageProtocolsPerExercise: this.links.length / exercises.length
    };
  }

  // Buscar links por critérios
  searchLinks(criteria: {
    exerciseId?: string;
    protocolId?: string;
    phase?: string;
    specialty?: string;
  }): ExerciseProtocolLink[] {
    return this.links.filter(link => {
      if (criteria.exerciseId && link.exerciseId !== criteria.exerciseId) return false;
      if (criteria.protocolId && link.protocolId !== criteria.protocolId) return false;
      if (criteria.phase && link.phase !== criteria.phase) return false;
      
      if (criteria.specialty) {
        const exercise = getExercises().find(e => e.id === link.exerciseId);
        if (exercise?.specialty !== criteria.specialty) return false;
      }
      
      return true;
    });
  }

  // Exportar links para backup
  exportLinks(): string {
    return JSON.stringify(this.links, null, 2);
  }

  // Importar links de backup
  importLinks(jsonData: string): void {
    try {
      this.links = JSON.parse(jsonData);
    } catch (error) {
      console.error('Erro ao importar links:', error);
    }
  }

  // Obter recomendações de novos links
  getRecommendations(): Array<{
    exercise: any;
    protocol: any;
    reason: string;
    confidence: number;
  }> {
    const protocols = getClinicalProtocols();
    const exercises = getExercises();
    const recommendations: any[] = [];

    protocols.forEach(protocol => {
      exercises.forEach(exercise => {
        // Verificar se já está vinculado
        const alreadyLinked = this.links.some(l => 
          l.exerciseId === exercise.id && l.protocolId === protocol.id
        );
        
        if (alreadyLinked) return;

        let reason = '';
        let confidence = 0;

        // Mesma especialidade = alta confiança
        if (protocol.specialty === exercise.specialty) {
          reason = 'Mesma especialidade clínica';
          confidence = 0.9;
        }
        // Tags em comum = média confiança
        else {
          const protocolTags = protocol.tags || [];
          const exerciseTags = exercise.tags || [];
          const commonTags = protocolTags.filter((tag: string) => exerciseTags.includes(tag));
          
          if (commonTags.length > 0) {
            reason = `Tags em comum: ${commonTags.join(', ')}`;
            confidence = 0.7;
          }
          // Palavras-chave em comum = baixa confiança
          else {
            const protocolText = `${protocol.title} ${protocol.description}`.toLowerCase();
            const exerciseText = `${exercise.name} ${exercise.description}`.toLowerCase();
            
            const keywords = ['joelho', 'ombro', 'quadril', 'coluna', 'LCA', 'menisco'];
            const matchingKeywords = keywords.filter(keyword => 
              protocolText.includes(keyword) && exerciseText.includes(keyword)
            );
            
            if (matchingKeywords.length > 0) {
              reason = `Palavras-chave em comum: ${matchingKeywords.join(', ')}`;
              confidence = 0.5;
            }
          }
        }

        if (confidence > 0.4) {
          recommendations.push({
            exercise,
            protocol,
            reason,
            confidence
          });
        }
      });
    });

    return recommendations.sort((a, b) => b.confidence - a.confidence);
  }
}

// Instância singleton
export const exerciseProtocolService = new ExerciseProtocolService();

// Funções de conveniência para uso em componentes
export const getExerciseProtocolLinks = (exerciseId: string) => 
  exerciseProtocolService.getProtocolsForExercise(exerciseId);

export const getProtocolExerciseLinks = (protocolId: string) => 
  exerciseProtocolService.getExercisesForProtocol(protocolId);

export const getAllProtocolExerciseLinks = () => 
  exerciseProtocolService.getAllProtocolsWithExercises();

export const getLinkStatistics = () => 
  exerciseProtocolService.getLinkStatistics();

export const getLinkRecommendations = () => 
  exerciseProtocolService.getRecommendations();
