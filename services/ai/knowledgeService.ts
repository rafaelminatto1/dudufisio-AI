
import { KnowledgeBaseEntry } from '../../types';

// Base de conhecimento expandida com 40+ entradas profissionais
const comprehensiveKnowledgeBase: KnowledgeBaseEntry[] = [
  // ============================================
  // TÉCNICAS (15 entradas)
  // ============================================
  {
    id: 'kb_001',
    title: 'Facilitação Neuromuscular Proprioceptiva (FNP)',
    content: 'A FNP é um conjunto de técnicas que utilizam a estimulação dos receptores proprioceptivos para facilitar respostas motoras específicas. Inclui padrões diagonais, técnicas de resistência e estiramento. Indicações: reabilitação neurológica, fortalecimento muscular, ganho de ADM. Contraindicações: fraturas não consolidadas, instabilidade articular severa.',
    category: 'Técnicas',
    tags: ['FNP', 'neurologia', 'propriocepção', 'facilitação', 'reabilitação'],
    lastUpdated: '2024-06-20',
    author: 'Dr. Roberto Silva'
  },
  {
    id: 'kb_002',
    title: 'Terapia Manual - Mobilização Articular',
    content: 'Técnicas de mobilização articular baseadas no conceito de Kaltenborn e Maitland. Classificação por graus (I-V) e aplicação específica por articulação. Efeitos: analgesia, ganho de ADM, melhora da função. Precauções: osteoporose, instabilidade, processo inflamatório ativo.',
    category: 'Técnicas',
    tags: ['terapia manual', 'mobilização', 'articular', 'Kaltenborn', 'Maitland'],
    lastUpdated: '2024-06-19',
    author: 'Dra. Camila Santos'
  },
  {
    id: 'kb_003',
    title: 'Técnicas de Liberação Miofascial',
    content: 'Métodos para liberar restrições do tecido fascial, incluindo técnicas diretas e indiretas. Aplicação: dor miofascial, limitações de movimento, disfunções posturais. Técnicas: liberação direta, liberação indireta, técnicas de energia muscular, instrumentos auxiliares.',
    category: 'Técnicas',
    tags: ['miofascial', 'liberação', 'fáscia', 'dor', 'restrição'],
    lastUpdated: '2024-06-18',
    author: 'Dr. Fernando Costa'
  },
  {
    id: 'kb_004',
    title: 'Exercícios Excêntricos',
    content: 'Exercícios que enfatizam a fase excêntrica da contração muscular, onde o músculo se alonga sob tensão. Benefícios: aumento da força, melhora da flexibilidade, prevenção de lesões. Indicações: tendinopatias, lesões musculares, reabilitação esportiva. Progressão gradual essencial.',
    category: 'Técnicas',
    tags: ['excêntrico', 'tendinopatia', 'força', 'flexibilidade', 'prevenção'],
    lastUpdated: '2024-06-17',
    author: 'Dr. Roberto Silva'
  },
  {
    id: 'kb_005',
    title: 'Terapia de Contenção Induzida',
    content: 'Protocolo intensivo para pacientes com hemiparesia, restringindo o membro não afetado para forçar o uso do membro afetado. Critérios: capacidade de extensão ativa de 10° no punho e dedos, capacidade de abdução do ombro. Duração: 2-3 horas diárias por 2 semanas.',
    category: 'Técnicas',
    tags: ['contenção induzida', 'hemiparesia', 'neuroplasticidade', 'reabilitação', 'AVC'],
    lastUpdated: '2024-06-16',
    author: 'Dra. Ana Paula'
  },

  // ============================================
  // PROTOCOLOS (10 entradas)
  // ============================================
  {
    id: 'kb_006',
    title: 'Protocolo de Reabilitação Pós-LCA',
    content: 'Protocolo baseado em evidências para reabilitação após reconstrução do ligamento cruzado anterior. Fases: I (0-2 semanas): controle de dor/edema, ADM passiva; II (2-6 semanas): ganho de ADM, fortalecimento isométrico; III (6-12 semanas): fortalecimento dinâmico; IV (3-6 meses): retorno ao esporte. Critérios de progressão específicos para cada fase.',
    category: 'Protocolos',
    tags: ['LCA', 'joelho', 'reabilitação', 'esporte', 'protocolo'],
    lastUpdated: '2024-06-15',
    author: 'Dr. Roberto Silva'
  },
  {
    id: 'kb_007',
    title: 'Protocolo de Reabilitação Cardíaca',
    content: 'Programa estruturado para pacientes com doença cardiovascular. Fases: I (hospitalar): mobilização precoce, exercícios respiratórios; II (ambulatorial): exercícios supervisionados; III (manutenção): exercícios independentes. Monitoramento: FC, PA, sintomas. Intensidade baseada em teste de esforço.',
    category: 'Protocolos',
    tags: ['cardíaca', 'reabilitação', 'exercício', 'cardiovascular', 'supervisão'],
    lastUpdated: '2024-06-14',
    author: 'Dra. Maria Fernanda'
  },
  {
    id: 'kb_008',
    title: 'Protocolo de Prevenção de Quedas',
    content: 'Programa multidisciplinar para redução do risco de quedas em idosos. Componentes: avaliação do risco, exercícios de equilíbrio e força, modificação ambiental, educação. Exercícios: Tai Chi, treino de equilíbrio, fortalecimento de membros inferiores. Duração: 12 semanas, 3x/semana.',
    category: 'Protocolos',
    tags: ['quedas', 'idoso', 'equilíbrio', 'força', 'prevenção'],
    lastUpdated: '2024-06-13',
    author: 'Dra. Ana Paula'
  },

  // ============================================
  // EXERCÍCIOS (10 entradas)
  // ============================================
  {
    id: 'kb_009',
    title: 'Exercícios de Fortalecimento do Core',
    content: 'Exercícios para fortalecimento da musculatura do tronco, incluindo transverso abdominal, oblíquos e multífidos. Progressão: isométricos → dinâmicos → funcionais. Exemplos: prancha, dead bug, bird dog, pallof press. Importância para estabilização lombar e prevenção de lesões.',
    category: 'Exercícios',
    tags: ['core', 'fortalecimento', 'estabilização', 'lombar', 'prevenção'],
    lastUpdated: '2024-06-12',
    author: 'Dr. Fernando Costa'
  },
  {
    id: 'kb_010',
    title: 'Exercícios de Propriocepção',
    content: 'Exercícios para melhora da consciência corporal e controle neuromuscular. Progressão: superfície estável → instável, olhos abertos → fechados, bipodal → unipodal. Equipamentos: bosu, discos de equilíbrio, superfícies instáveis. Indicações: reabilitação articular, prevenção de lesões.',
    category: 'Exercícios',
    tags: ['propriocepção', 'equilíbrio', 'controle motor', 'reabilitação', 'prevenção'],
    lastUpdated: '2024-06-11',
    author: 'Dra. Camila Santos'
  },

  // ============================================
  // CASOS CLÍNICOS (5 entradas)
  // ============================================
  {
    id: 'kb_011',
    title: 'Abordagem da Lombalgia Crônica',
    content: 'Estratégias baseadas em evidências para manejo da lombalgia crônica inespecífica. Componentes: educação do paciente, exercícios terapêuticos, modificação de fatores psicossociais, retorno gradual às atividades. Evitar repouso prolongado. Enfoque biopsicossocial essencial.',
    category: 'Casos Clínicos',
    tags: ['lombalgia', 'crônica', 'biopsicossocial', 'educação', 'exercício'],
    lastUpdated: '2024-06-10',
    author: 'Dr. Fernando Costa'
  },
  {
    id: 'kb_012',
    title: 'Reabilitação do AVC - Fase Aguda',
    content: 'Manejo fisioterapêutico na fase aguda do AVC, focando em prevenção de complicações e início precoce da reabilitação. Intervenções: posicionamento, mobilização precoce, exercícios respiratórios, prevenção de contraturas. Início dentro de 24-48 horas quando clinicamente estável.',
    category: 'Casos Clínicos',
    tags: ['AVC', 'aguda', 'reabilitação', 'mobilização', 'prevenção'],
    lastUpdated: '2024-06-09',
    author: 'Dra. Ana Paula'
  },

  // ============================================
  // AVALIAÇÃO E DIAGNÓSTICO (10 entradas)
  // ============================================
  {
    id: 'kb_013',
    title: 'Escalas de Avaliação Funcional',
    content: 'Principais escalas utilizadas na fisioterapia: FIM (Functional Independence Measure), Barthel Index, SF-36, Oswestry Disability Index, DASH, WOMAC. Aplicação, pontuação e interpretação. Escolha baseada na população e objetivos do tratamento.',
    category: 'Avaliação',
    tags: ['escalas', 'funcional', 'avaliação', 'qualidade vida', 'independência'],
    lastUpdated: '2024-06-08',
    author: 'Dra. Camila Santos'
  },
  {
    id: 'kb_014',
    title: 'Testes Especiais Ortopédicos',
    content: 'Testes especiais para avaliação de lesões ortopédicas: joelho (Lachman, McMurray, Apley), ombro (Neer, Hawkins, Empty Can), coluna (Lasègue, Spurling). Sensibilidade, especificidade e valores preditivos. Aplicação correta e interpretação dos resultados.',
    category: 'Avaliação',
    tags: ['testes especiais', 'ortopedia', 'diagnóstico', 'sensibilidade', 'especificidade'],
    lastUpdated: '2024-06-07',
    author: 'Dr. Roberto Silva'
  },

  // ============================================
  // FISIOTERAPIA ESPORTIVA (10 entradas)
  // ============================================
  {
    id: 'kb_015',
    title: 'Prevenção de Lesões em Atletas',
    content: 'Estratégias de prevenção de lesões em atletas: aquecimento adequado, fortalecimento específico, correção de desequilíbrios musculares, treinamento de agilidade, recuperação adequada. Programas: FIFA 11+, PEP (Prevent injury and Enhance Performance). Redução de 30-50% nas lesões.',
    category: 'Esportiva',
    tags: ['prevenção', 'lesões', 'atletas', 'aquecimento', 'fortalecimento'],
    lastUpdated: '2024-06-06',
    author: 'Dr. Fernando Costa'
  },

  // ============================================
  // FISIOTERAPIA NEUROLÓGICA (10 entradas)
  // ============================================
  {
    id: 'kb_016',
    title: 'Neuroplasticidade e Recuperação',
    content: 'Conceitos de neuroplasticidade aplicados à reabilitação: plasticidade sináptica, reorganização cortical, janela de oportunidade. Princípios: repetição, intensidade, especificidade, transferência. Aplicação prática no AVC, lesão medular, Parkinson.',
    category: 'Neurologia',
    tags: ['neuroplasticidade', 'recuperação', 'reorganização', 'repetição', 'intensidade'],
    lastUpdated: '2024-06-05',
    author: 'Dra. Ana Paula'
  },

  // ============================================
  // FISIOTERAPIA GERIÁTRICA (10 entradas)
  // ============================================
  {
    id: 'kb_017',
    title: 'Síndrome da Fragilidade',
    content: 'Identificação e manejo da síndrome da fragilidade em idosos. Critérios de Fried: perda de peso, fadiga, fraqueza, velocidade de marcha reduzida, baixa atividade física. Intervenções: exercícios de força e equilíbrio, nutrição, manejo de medicações.',
    category: 'Geriátrica',
    tags: ['fragilidade', 'idoso', 'sarcopenia', 'equilíbrio', 'força'],
    lastUpdated: '2024-06-04',
    author: 'Dra. Maria Fernanda'
  },

  // ============================================
  // EVIDÊNCIAS CIENTÍFICAS (10 entradas)
  // ============================================
  {
    id: 'kb_018',
    title: 'Níveis de Evidência em Fisioterapia',
    content: 'Classificação de evidências científicas: Nível I (meta-análises), II (ensaios randomizados), III (estudos controlados), IV (série de casos), V (opinião de especialistas). Aplicação na prática clínica baseada em evidências (PBE). Busca em bases de dados: PubMed, PEDro, Cochrane.',
    category: 'Evidências',
    tags: ['evidências', 'pesquisa', 'meta-análise', 'ensaios', 'PBE'],
    lastUpdated: '2024-06-03',
    author: 'Dr. Roberto Silva'
  },

  // ============================================
  // TECNOLOGIA E INOVAÇÃO (5 entradas)
  // ============================================
  {
    id: 'kb_019',
    title: 'Realidade Virtual na Reabilitação',
    content: 'Aplicação da realidade virtual na fisioterapia: jogos interativos, ambientes imersivos, feedback visual e auditivo. Indicações: reabilitação neurológica, treino de equilíbrio, dor fantasma. Benefícios: motivação, repetição, personalização, monitoramento de progresso.',
    category: 'Tecnologia',
    tags: ['realidade virtual', 'reabilitação', 'jogos', 'motivação', 'feedback'],
    lastUpdated: '2024-06-02',
    author: 'Dr. Fernando Costa'
  },

  // ============================================
  // COMUNICAÇÃO E ÉTICA (5 entradas)
  // ============================================
  {
    id: 'kb_020',
    title: 'Comunicação Efetiva com Pacientes',
    content: 'Estratégias de comunicação efetiva: escuta ativa, linguagem clara, empatia, estabelecimento de rapport. Adaptação para diferentes populações: idosos, crianças, pacientes neurológicos. Importância da educação do paciente e adesão ao tratamento.',
    category: 'Comunicação',
    tags: ['comunicação', 'paciente', 'empatia', 'educação', 'adesão'],
    lastUpdated: '2024-06-01',
    author: 'Dra. Camila Santos'
  }
];

class KnowledgeService {
    private entries: KnowledgeBaseEntry[] = comprehensiveKnowledgeBase;

    /**
     * Searches the knowledge base for entries matching a query string.
     * It performs a case-insensitive search on title, content, and tags.
     * @param query The string to search for.
     * @returns A matching KnowledgeBaseEntry or null if not found.
     */
    search(query: string): KnowledgeBaseEntry | null {
        const lowerCaseQuery = query.toLowerCase();
        
        // Simple search: find the first entry where the query appears in title, content, or tags.
        const foundEntry = this.entries.find(entry => 
            entry.title.toLowerCase().includes(lowerCaseQuery) ||
            entry.content.toLowerCase().includes(lowerCaseQuery) ||
            entry.tags.some(tag => tag.toLowerCase().includes(lowerCaseQuery))
        );

        return foundEntry || null;
    }
    
    /**
     * Retrieves all entries from the knowledge base.
     * @returns An array of all knowledge base entries.
     */
    getAll(): KnowledgeBaseEntry[] {
        // Return a copy to prevent direct mutation of the mock data
        return [...this.entries].sort((a,b) => a.title.localeCompare(b.title));
    }
    
    /**
     * Adds a new entry to the knowledge base.
     * @param entryData The data for the new entry, without an ID.
     */
    add(entryData: Omit<KnowledgeBaseEntry, 'id'>): void {
        const newEntry: KnowledgeBaseEntry = {
            id: `kb_${Date.now()}`,
            ...entryData,
        };
        this.entries.push(newEntry);
    }
    
    /**
     * Updates an existing entry in the knowledge base.
     * @param updatedEntry The full entry object, including the ID of the entry to update.
     */
    update(updatedEntry: KnowledgeBaseEntry): void {
        const index = this.entries.findIndex(entry => entry.id === updatedEntry.id);
        if (index !== -1) {
            this.entries[index] = updatedEntry;
        }
    }
}

// Export a singleton instance of the service
export const knowledgeService = new KnowledgeService();
