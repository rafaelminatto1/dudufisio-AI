import { MaterialCategory } from '../types';

// Biblioteca Completa de Materiais Clínicos - 60+ itens profissionais
export const mockMaterialCategories: MaterialCategory[] = [
  {
    id: 'cat1',
    name: 'Avaliação e Diagnóstico',
    materials: [
      { id: 'mat001', name: 'Escala Visual Analógica de Dor (EVA)', type: 'Escala de Avaliação', description: 'Escala de 0-10 para mensuração subjetiva da intensidade da dor', updatedAt: '2024-01-15' },
      { id: 'mat002', name: 'Questionário de Incapacidade Roland-Morris', type: 'Escala de Avaliação', description: 'Questionário de 24 itens para avaliação de incapacidade por lombalgia', updatedAt: '2024-01-15' },
      { id: 'mat003', name: 'Teste de Força Muscular de Oxford (0-5)', type: 'Escala de Avaliação', description: 'Graduação manual de força muscular de 0 (sem contração) a 5 (força normal)', updatedAt: '2024-01-10' },
      { id: 'mat004', name: 'Goniometria - Manual Completo', type: 'Protocolo Clínico', description: 'Guia para medição de amplitude de movimento de todas articulações', updatedAt: '2024-01-20' },
      { id: 'mat005', name: 'Escala WOMAC para Osteoartrite de Joelho', type: 'Escala de Avaliação', description: 'Questionário de 24 questões sobre dor, rigidez e função física', updatedAt: '2024-01-18' },
      { id: 'mat006', name: 'Índice de Incapacidade de Oswestry (ODI)', type: 'Escala de Avaliação', description: 'Questionário de 10 itens para avaliação de dor lombar crônica', updatedAt: '2024-01-12' },
      { id: 'mat007', name: 'Escala DASH - Disabilities of Arm, Shoulder and Hand', type: 'Escala de Avaliação', description: 'Questionário de 30 itens para avaliação funcional de membros superiores', updatedAt: '2024-01-14' },
      { id: 'mat008', name: 'Teste de Straight Leg Raise (Lasègue)', type: 'Protocolo Clínico', description: 'Teste provocativo para avaliar irritação de nervo ciático', updatedAt: '2024-01-16' },
      { id: 'mat009', name: 'Testes Especiais de Ombro - Compilação', type: 'Protocolo Clínico', description: 'Neer, Hawkins-Kennedy, Jobe, Drop arm e outros testes', updatedAt: '2024-01-19' },
      { id: 'mat010', name: 'Testes Especiais de Joelho - Compilação', type: 'Protocolo Clínico', description: 'Lachman, Gaveta, McMurray, Apley e outros testes', updatedAt: '2024-01-17' },
      { id: 'mat011', name: 'Escala de Equilíbrio de Berg', type: 'Escala de Avaliação', description: 'Avaliação de equilíbrio funcional com 14 tarefas', updatedAt: '2024-01-13' },
      { id: 'mat012', name: 'Timed Up and Go Test (TUG)', type: 'Protocolo Clínico', description: 'Teste funcional de mobilidade e risco de quedas', updatedAt: '2024-01-11' },
      { id: 'mat013', name: 'Teste de Caminhada de 6 Minutos', type: 'Protocolo Clínico', description: 'Avaliação de capacidade funcional e resistência aeróbica', updatedAt: '2024-01-09' },
      { id: 'mat014', name: 'Escala de Borg para Percepção de Esforço', type: 'Escala de Avaliação', description: 'Escala de 6-20 para mensuração de intensidade de exercício', updatedAt: '2024-01-21' },
      { id: 'mat015', name: 'Questionário Nórdico de Sintomas Osteomusculares', type: 'Escala de Avaliação', description: 'Triagem de sintomas musculoesqueléticos relacionados ao trabalho', updatedAt: '2024-01-08' }
    ],
  },
  {
    id: 'cat2',
    name: 'Protocolos Clínicos',
    materials: [
      { id: 'mat016', name: 'Protocolo Pós-operatório de Reconstrução de LCA', type: 'Protocolo Clínico', description: 'Programa completo de 6-12 meses para reabilitação pós-LCA', updatedAt: '2024-02-01' },
      { id: 'mat017', name: 'Protocolo para Síndrome do Impacto Subacromial', type: 'Protocolo Clínico', description: 'Tratamento conservador com fortalecimento de manguito rotador', updatedAt: '2024-02-02' },
      { id: 'mat018', name: 'Diretrizes para Lombalgia Mecânica Crônica', type: 'Protocolo Clínico', description: 'Abordagem baseada em estabilização lombar e controle motor', updatedAt: '2024-02-03' },
      { id: 'mat019', name: 'Protocolo de Tratamento para Fascite Plantar', type: 'Protocolo Clínico', description: 'Alongamento, fortalecimento e controle de carga', updatedAt: '2024-02-04' },
      { id: 'mat020', name: 'Protocolo para Tendinopatia de Aquiles', type: 'Protocolo Clínico', description: 'Programa de exercícios excêntricos progressivos', updatedAt: '2024-02-05' },
      { id: 'mat021', name: 'Protocolo Pós-Artroplastia Total de Joelho', type: 'Protocolo Clínico', description: 'Reabilitação completa após ATJ primária', updatedAt: '2024-02-06' },
      { id: 'mat022', name: 'Protocolo Pós-Artroplastia Total de Quadril', type: 'Protocolo Clínico', description: 'Programa respeitando precauções e progressão funcional', updatedAt: '2024-02-07' },
      { id: 'mat023', name: 'Protocolo para Capsulite Adesiva (Ombro Congelado)', type: 'Protocolo Clínico', description: 'Manejo respeitando fases da doença', updatedAt: '2024-02-08' },
      { id: 'mat024', name: 'Protocolo para Condromalácia Patelar', type: 'Protocolo Clínico', description: 'Fortalecimento de quadríceps e glúteos', updatedAt: '2024-02-09' },
      { id: 'mat025', name: 'Protocolo para Entorse de Tornozelo', type: 'Protocolo Clínico', description: 'Restauração de ADM, força e propriocepção', updatedAt: '2024-02-10' },
      { id: 'mat026', name: 'Protocolo para Epicondilite Lateral', type: 'Protocolo Clínico', description: 'Exercícios excêntricos para cotovelo de tenista', updatedAt: '2024-02-11' },
      { id: 'mat027', name: 'Protocolo para Hérnia de Disco Lombar', type: 'Protocolo Clínico', description: 'Extensão baseada em classificação MDT', updatedAt: '2024-02-12' },
      { id: 'mat028', name: 'Protocolo para Cervicalgia Mecânica', type: 'Protocolo Clínico', description: 'Controle motor cervical e fortalecimento', updatedAt: '2024-02-13' },
      { id: 'mat029', name: 'Protocolo para Osteoartrite de Joelho', type: 'Protocolo Clínico', description: 'Programa conservador com exercícios e educação', updatedAt: '2024-02-14' },
      { id: 'mat030', name: 'Protocolo de Retorno ao Esporte Pós-LCA', type: 'Protocolo Clínico', description: 'Bateria de testes funcionais e progressão', updatedAt: '2024-02-15' }
    ],
  },
  {
    id: 'cat3',
    name: 'Materiais de Prescrição',
    materials: [
      { id: 'mat031', name: 'Template de Programa de Exercícios Domiciliares (HEP)', type: 'Material Educacional', description: 'Modelo editável para prescrição de exercícios em casa', updatedAt: '2024-03-01' },
      { id: 'mat032', name: 'Guia de Progressão de Carga e Intensidade', type: 'Material Educacional', description: 'Princípios de progressão segura de exercícios', updatedAt: '2024-03-02' },
      { id: 'mat033', name: 'Orientações Posturais para Home Office', type: 'Material Educacional', description: 'Guia de ergonomia para trabalho remoto', updatedAt: '2024-03-03' },
      { id: 'mat034', name: 'Prescrição de Exercícios para Lombalgia', type: 'Material Educacional', description: 'Programa de estabilização lombar para casa', updatedAt: '2024-03-04' },
      { id: 'mat035', name: 'Exercícios de Manguito Rotador com Theraband', type: 'Material Educacional', description: 'Programa ilustrado de fortalecimento de ombro', updatedAt: '2024-03-05' },
      { id: 'mat036', name: 'Programa de Exercícios para Idosos em Casa', type: 'Material Educacional', description: 'Exercícios seguros de força e equilíbrio', updatedAt: '2024-03-06' },
      { id: 'mat037', name: 'Alongamentos para Prevenção de LER/DORT', type: 'Material Educacional', description: 'Rotina de alongamentos para trabalhadores', updatedAt: '2024-03-07' },
      { id: 'mat038', name: 'Prescrição de Exercícios Respiratórios', type: 'Material Educacional', description: 'Programa de fisioterapia respiratória domiciliar', updatedAt: '2024-03-08' },
      { id: 'mat039', name: 'Exercícios de Core Stability Progressivos', type: 'Material Educacional', description: 'Programa de estabilização de core em 3 fases', updatedAt: '2024-03-09' },
      { id: 'mat040', name: 'Ficha de Acompanhamento de Exercícios', type: 'Material Educacional', description: 'Template para paciente registrar adesão', updatedAt: '2024-03-10' }
    ],
  },
  {
    id: 'cat4',
    name: 'Recursos Educacionais para Pacientes',
    materials: [
      { id: 'mat041', name: 'Folder: O que é Hérnia de Disco?', type: 'Material Educacional', description: 'Explicação simplificada sobre patologia e tratamento', updatedAt: '2024-04-01' },
      { id: 'mat042', name: 'Infográfico: Ergonomia no Trabalho', type: 'Material Educacional', description: 'Guia visual de postura e ajustes ergonômicos', updatedAt: '2024-04-02' },
      { id: 'mat043', name: 'Folder: Benefícios da Atividade Física Regular', type: 'Material Educacional', description: 'Informações sobre importância do exercício', updatedAt: '2024-04-03' },
      { id: 'mat044', name: 'Cartilha: Cuidados Pós-Cirurgia de LCA', type: 'Material Educacional', description: 'Orientações para pacientes no pós-operatório', updatedAt: '2024-04-04' },
      { id: 'mat045', name: 'Vídeo: Como Fazer Crioterapia Corretamente', type: 'Material Educacional', description: 'Instruções para aplicação de gelo em casa', updatedAt: '2024-04-05' },
      { id: 'mat046', name: 'Folder: Prevenção de Quedas em Idosos', type: 'Material Educacional', description: 'Dicas de segurança doméstica e exercícios', updatedAt: '2024-04-06' },
      { id: 'mat047', name: 'Cartilha: Entendendo sua Dor Lombar', type: 'Material Educacional', description: 'Neuro educação da dor para pacientes', updatedAt: '2024-04-07' },
      { id: 'mat048', name: 'Infográfico: Anatomia do Ombro Simplificada', type: 'Material Educacional', description: 'Guia visual de estruturas do ombro', updatedAt: '2024-04-08' },
      { id: 'mat049', name: 'Vídeo: Exercícios de Propriocepção de Tornozelo', type: 'Material Educacional', description: 'Demonstração de exercícios de equilíbrio', updatedAt: '2024-04-09' },
      { id: 'mat050', name: 'Folder: Mitos e Verdades sobre Fisioterapia', type: 'Material Educacional', description: 'Esclarecimentos sobre tratamento fisioterapêutico', updatedAt: '2024-04-10' }
    ],
  },
  {
    id: 'cat5',
    name: 'Técnicas de Terapia Manual',
    materials: [
      { id: 'mat051', name: 'Manual de Mobilização Articular de Maitland', type: 'Protocolo Clínico', description: 'Técnicas de mobilização graus I-IV', updatedAt: '2024-05-01' },
      { id: 'mat052', name: 'Técnicas de Liberação Miofascial', type: 'Protocolo Clínico', description: 'Protocolos de liberação miofascial por região', updatedAt: '2024-05-02' },
      { id: 'mat053', name: 'Mobilização Neural - Técnicas Práticas', type: 'Protocolo Clínico', description: 'Deslizamentos neurais para principais nervos', updatedAt: '2024-05-03' },
      { id: 'mat054', name: 'Massagem Terapêutica - Protocolos', type: 'Protocolo Clínico', description: 'Técnicas de massagem para diferentes condições', updatedAt: '2024-05-04' },
      { id: 'mat055', name: 'Manipulação de Coluna Vertebral - Safety Guidelines', type: 'Protocolo Clínico', description: 'Protocolos seguros de manipulação espinhal', updatedAt: '2024-05-05' }
    ],
  },
  {
    id: 'cat6',
    name: 'Eletroterapia e Recursos Físicos',
    materials: [
      { id: 'mat056', name: 'Guia de Uso de TENS (Estimulação Elétrica)', type: 'Protocolo Clínico', description: 'Parâmetros e aplicações de TENS', updatedAt: '2024-06-01' },
      { id: 'mat057', name: 'Protocolos de Ultrassom Terapêutico', type: 'Protocolo Clínico', description: 'Dosimetria e aplicações de US', updatedAt: '2024-06-02' },
      { id: 'mat058', name: 'Laserterapia de Baixa Potência - Manual', type: 'Protocolo Clínico', description: 'Aplicações e dosagens de laser', updatedAt: '2024-06-03' },
      { id: 'mat059', name: 'Termoterapia e Crioterapia - Indicações', type: 'Protocolo Clínico', description: 'Quando usar calor ou frio no tratamento', updatedAt: '2024-06-04' },
      { id: 'mat060', name: 'Ondas de Choque - Protocolos de Aplicação', type: 'Protocolo Clínico', description: 'Terapia por ondas de choque para tendinopatias', updatedAt: '2024-06-05' }
    ],
  }
];
