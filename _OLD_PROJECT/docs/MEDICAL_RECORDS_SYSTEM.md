# Sistema de Prontuário Eletrônico Médico

## Visão Geral

O Sistema de Prontuário Eletrônico Médico é uma solução completa desenvolvida seguindo os padrões HL7 FHIR R4, com compliance total às regulamentações CFM (Conselho Federal de Medicina), COFFITO (Conselho Federal de Fisioterapia e Terapia Ocupacional) e LGPD (Lei Geral de Proteção de Dados).

## Arquitetura

### Stack Tecnológico

- **Frontend**: React 19 + TypeScript + Vite
- **UI/UX**: shadcn/ui + TailwindCSS + Framer Motion
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Padrões**: HL7 FHIR R4
- **Testes**: Playwright + Jest
- **Validação**: Zod + React Hook Form

### Estrutura de Diretórios

```
lib/medical-records/
├── fhir/                          # Recursos FHIR
│   ├── resources/                 # Recursos FHIR (Patient, Encounter, etc.)
│   ├── validators/                # Validação FHIR
│   └── transformers/              # Transformação de dados
├── clinical/                      # Módulos clínicos
│   ├── assessment/                # Avaliações iniciais
│   ├── evolution/                 # Evoluções de sessão
│   └── documentation/             # Documentação clínica
├── compliance/                    # Validação de compliance
│   ├── CFMValidator.ts           # Validação CFM
│   ├── COFFITOValidator.ts       # Validação COFFITO
│   └── LGPDCompliance.ts         # Compliance LGPD
├── services/                      # Serviços de integração
└── config.ts                      # Configurações do sistema

components/medical-records/
├── MedicalRecordsSystem.tsx       # Componente principal
├── MedicalRecordsDashboard.tsx    # Dashboard principal
├── ClinicalTemplatesManager.tsx   # Gerenciador de templates
├── DigitalSignatureManager.tsx    # Gerenciador de assinaturas
├── ClinicalReportsGenerator.tsx   # Gerador de relatórios
├── AssessmentForm.tsx             # Formulário de avaliação
├── EvolutionEditor.tsx            # Editor de evolução
├── ClinicalTimeline.tsx           # Timeline clínica
└── DocumentViewer.tsx             # Visualizador de documentos
```

## Funcionalidades Principais

### 1. Gestão de Documentos Clínicos

- **Versionamento Automático**: Controle de versões com histórico completo
- **Imutabilidade**: Documentos assinados não podem ser alterados
- **Auditoria Completa**: Trilha de auditoria para todas as ações
- **Integração FHIR**: Compatibilidade total com padrões HL7 FHIR

### 2. Templates Clínicos Dinâmicos

- **Formulários Flexíveis**: Templates JSON Schema para diferentes especialidades
- **Validação Automática**: Regras de validação configuráveis
- **Valores Padrão**: Preenchimento automático de campos comuns
- **Multi-especialidade**: Suporte para fisioterapia, terapia ocupacional, fonoaudiologia

### 3. Assinatura Digital

- **Certificados ICP-Brasil**: Integração com certificados digitais válidos
- **Timestamp Confiável**: Marcação temporal certificada
- **Verificação de Integridade**: Validação automática de assinaturas
- **Compliance Legal**: Atendimento às exigências legais

### 4. Relatórios Clínicos

- **Relatórios de Progresso**: Análise automática da evolução do paciente
- **Relatórios de Alta**: Resumo completo do tratamento
- **Exportação Multi-formato**: PDF, DOCX, HTML
- **Gráficos e Métricas**: Visualização de dados clínicos

### 5. Compliance e Segurança

- **Validação CFM**: Verificação automática de conformidade
- **Validação COFFITO**: Atendimento às normas do conselho
- **LGPD Compliance**: Proteção de dados pessoais
- **Criptografia**: Dados sensíveis sempre criptografados

## Banco de Dados

### Schema Principal

```sql
-- Tabela principal de documentos clínicos
CREATE TABLE clinical_documents (
  id UUID PRIMARY KEY,
  patient_id UUID NOT NULL,
  document_type VARCHAR(50) NOT NULL,
  version INTEGER NOT NULL,
  content JSONB NOT NULL,
  specialty VARCHAR(30) NOT NULL,
  is_signed BOOLEAN DEFAULT FALSE,
  signature_data JSONB,
  signed_at TIMESTAMP WITH TIME ZONE,
  signed_by UUID,
  status VARCHAR(20) DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID NOT NULL
);

-- Templates clínicos
CREATE TABLE clinical_templates (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL,
  specialty VARCHAR(30) NOT NULL,
  template_schema JSONB NOT NULL,
  default_values JSONB DEFAULT '{}',
  validation_rules JSONB DEFAULT '{}',
  active BOOLEAN DEFAULT TRUE,
  version INTEGER DEFAULT 1
);

-- Assinaturas digitais
CREATE TABLE digital_signatures (
  id UUID PRIMARY KEY,
  document_id UUID NOT NULL,
  signature_data JSONB NOT NULL,
  certificate_id UUID NOT NULL,
  signed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  signed_by UUID NOT NULL,
  verification_status VARCHAR(20) DEFAULT 'pending'
);

-- Trilha de auditoria
CREATE TABLE audit_trail (
  id UUID PRIMARY KEY,
  document_id UUID,
  action VARCHAR(20) NOT NULL,
  performed_by UUID NOT NULL,
  performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  details JSONB DEFAULT '{}'
);
```

### Row Level Security (RLS)

Todas as tabelas implementam RLS para garantir que:
- Profissionais só acessem documentos de seus pacientes
- Pacientes só vejam seus próprios dados
- Administradores tenham acesso controlado
- Auditoria seja mantida para todos os acessos

## API e Integração

### Serviços Principais

```typescript
// Serviço principal de documentos clínicos
class SupabaseMedicalRecordsService {
  // Documentos
  createClinicalDocument(document: ClinicalDocument): Promise<ClinicalDocument>
  getClinicalDocument(id: string): Promise<ClinicalDocument>
  updateClinicalDocument(id: string, updates: Partial<ClinicalDocument>): Promise<ClinicalDocument>
  
  // Templates
  createClinicalTemplate(template: ClinicalTemplate): Promise<ClinicalTemplate>
  getClinicalTemplates(type?: string, specialty?: string): Promise<ClinicalTemplate[]>
  
  // Assinaturas
  createDigitalSignature(signature: DigitalSignature): Promise<DigitalSignature>
  verifySignature(signatureId: string): Promise<void>
  
  // Relatórios
  generateProgressReport(patientId: string, dateRange: DateRange): Promise<ProgressReport>
  generateDischargeReport(patientId: string): Promise<DischargeReport>
}
```

### Hook Personalizado

```typescript
// Hook para gerenciar estado do sistema
function useMedicalRecords() {
  return {
    // Estado
    patients, documents, templates, certificates, signatures,
    loading, error,
    
    // Ações
    loadPatients, createDocument, updateDocument,
    createTemplate, createSignature, generateReport,
    
    // Utilitários
    getDocumentById, getDocumentsByPatient
  };
}
```

## Configuração

### Variáveis de Ambiente

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# FHIR
FHIR_BASE_URL=http://localhost:8080/fhir

# Assinatura Digital
CERTIFICATE_STORE_URL=your_certificate_store_url
TIMESTAMP_SERVICE_URL=your_timestamp_service_url
```

### Configurações do Sistema

```typescript
export const MEDICAL_RECORDS_CONFIG = {
  versioning: {
    maxVersions: 50,
    autoIncrement: true
  },
  digitalSignature: {
    algorithms: ['RSA_SHA256', 'ECDSA_SHA256'],
    certificateValidityDays: 365
  },
  compliance: {
    cfm: { retentionYears: 20 },
    coffito: { retentionYears: 20 },
    lgpd: { anonymizationAfterYears: 5 }
  }
};
```

## Testes

### Estrutura de Testes

```
tests/medical-records/
├── MedicalRecordsSystem.test.tsx    # Testes do sistema principal
├── components/                      # Testes de componentes
├── services/                        # Testes de serviços
└── integration/                     # Testes de integração
```

### Cobertura de Testes

- **Componentes React**: Renderização, interações, acessibilidade
- **Serviços**: CRUD operations, validações, integrações
- **Integração**: Fluxos completos, APIs, banco de dados
- **E2E**: Playwright para testes end-to-end

## Deploy e Produção

### Pré-requisitos

1. **Supabase Project**: Configurado com schema completo
2. **Certificados Digitais**: ICP-Brasil válidos
3. **Serviço de Timestamp**: Para assinaturas digitais
4. **Backup**: Estratégia de backup e recuperação

### Checklist de Deploy

- [ ] Schema do banco aplicado
- [ ] RLS policies configuradas
- [ ] Certificados digitais instalados
- [ ] Variáveis de ambiente configuradas
- [ ] Testes passando
- [ ] Monitoramento configurado
- [ ] Backup automático ativo

## Monitoramento e Manutenção

### Métricas Importantes

- **Performance**: Tempo de resposta das APIs
- **Disponibilidade**: Uptime do sistema
- **Segurança**: Tentativas de acesso não autorizado
- **Compliance**: Documentos não conformes
- **Auditoria**: Ações suspeitas

### Manutenção Regular

- **Backup**: Diário automático
- **Atualizações**: Mensais de segurança
- **Auditoria**: Trimestral de compliance
- **Certificados**: Renovação anual
- **Performance**: Monitoramento contínuo

## Roadmap

### Fase 1: Fundação (Semanas 1-2) ✅
- [x] Arquitetura base
- [x] Schema do banco
- [x] Entidades de domínio

### Fase 2: Core Clínico (Semanas 3-4) ✅
- [x] Documentos clínicos
- [x] Versionamento
- [x] Auditoria

### Fase 3: Sistema FHIR (Semanas 5-6) 🔄
- [x] Recursos FHIR
- [x] Validação
- [ ] Transformação de dados

### Fase 4: Assinatura Digital (Semanas 7-8) ✅
- [x] Certificados
- [x] Assinatura
- [x] Verificação

### Fase 5: Templates e Compliance (Semanas 9-10) ✅
- [x] Templates dinâmicos
- [x] Validação CFM/COFFITO
- [x] Compliance LGPD

### Fase 6: Interface React (Semanas 11-12) 🔄
- [x] Dashboard principal
- [x] Formulários
- [x] Visualizadores
- [ ] Integração completa

### Fase 7: Relatórios e Analytics (Semanas 13-14) ⏳
- [ ] Relatórios automáticos
- [ ] Analytics clínicos
- [ ] Exportação

### Fase 8: Testes e Validação (Semanas 15-16) ⏳
- [ ] Testes E2E
- [ ] Validação de compliance
- [ ] Deploy produção

## Suporte e Contato

Para dúvidas, sugestões ou problemas:

- **Documentação**: `/docs/MEDICAL_RECORDS_SYSTEM.md`
- **Issues**: GitHub Issues
- **Email**: suporte@fisioflow.com
- **Telefone**: (11) 99999-9999

---

**Versão**: 1.0.0  
**Última Atualização**: Janeiro 2025  
**Próxima Revisão**: Março 2025

