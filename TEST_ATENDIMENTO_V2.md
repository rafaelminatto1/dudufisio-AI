# Como Testar a Nova Página de Atendimento V2

## Acesso Direto (Método Temporário)

Como a integração com o roteador principal ainda não foi feita, você pode testar a nova página acessando diretamente:

### Opção 1: Adicionar rota manual temporária

Adicione esta linha no arquivo que gerencia as rotas internas (geralmente onde AtendimentoPage está sendo usado):

```tsx
import AtendimentoPageV2 from '../pages/AtendimentoPageV2';

// Na seção de rotas, adicione:
<Route path="/atendimento-v2/:appointmentId" element={<AtendimentoPageV2 />} />
```

### Opção 2: Substituir a rota atual temporariamente

No arquivo de rotas, encontre a rota atual:
```tsx
<Route path="/atendimento/:appointmentId" element={<AtendimentoPage />} />
```

E substitua por:
```tsx
<Route path="/atendimento/:appointmentId" element={<AtendimentoPageV2 />} />
```

## Testando a Nova Interface

1. **Acesse um agendamento**: Navegue para qualquer página que tenha um botão "Iniciar Atendimento"

2. **Verifique as funcionalidades**:
   - ✅ Header fixo sempre visível
   - ✅ Timer de sessão (Play/Pause)
   - ✅ Status de salvamento (Salvo, Salvando, Erro)
   - ✅ 4 tabs (SOAP, Métricas, IA, Anexos)
   - ✅ Formulário SOAP vertical
   - ✅ Auto-save após 2 segundos
   - ✅ Botão "Gerar com IA" no tab SOAP
   - ✅ Escala de dor no tab Métricas
   - ✅ Progresso visual (barra de %)
   - ✅ Botão "Finalizar Sessão" sempre visível

3. **Teste os atalhos de teclado**:
   - `Ctrl+1-4`: Trocar entre tabs
   - `Ctrl+S`: Salvar manualmente (aparecerá toast)
   - `Ctrl+Enter`: Finalizar sessão
   - `Ctrl+G`: Ir para tab IA
   - `Ctrl+R`: Repetir conduta da última sessão
   - `Ctrl+H`: Toggle painel de contexto (direita)

4. **Teste a Tab IA (NOVO - Fase 3)**:
   - Preencha campos Subjetivo (S) e Objetivo (O)
   - Pressione `Ctrl+G` para ir para tab IA
   - Clique em "Gerar Sugestões de IA"
   - Veja análise de risco aparecer (Critical/Important/Info)
   - Veja sugestões para Avaliação (A) e Plano (P)
   - Clique em "Aplicar" para inserir no formulário
   - OU clique em "Editar e Aplicar" para modificar antes
   - Veja evidências científicas abaixo
   - Teste botão "Regerar Sugestões"

5. **Teste os Painéis Laterais (NOVO - Fase 2)**:
   - **Sidebar Esquerda**:
     - Veja ícones de ações rápidas
     - Clique na seta para expandir/colapsar
     - Teste botões: Repetir Conduta, Sugestão IA, Tirar Foto, Adicionar Anexo
   - **Painel Direito**:
     - Veja histórico das últimas 3 sessões
     - Veja plano de tratamento
     - Veja exercícios prescritos
     - Pressione `Ctrl+H` para colapsar/expandir

6. **Teste o Mapa Corporal (NOVO - Fase 4)**:
   - Pressione `Ctrl+2` para ir para Métricas
   - Role até "Mapa Corporal Interativo"
   - Clique em pontos azuis no corpo
   - Veja pontos ficarem vermelhos
   - Clique em "Vista Posterior"
   - Selecione pontos da coluna
   - Veja lista de "Pontos de Dor Registrados"
   - Clique no "X" em um ponto para remover
   - Clique em "Limpar Todos"

7. **Teste a Tabela de Métricas (NOVO - Fase 4)**:
   - Se houver sessões anteriores, role até "Histórico e Evolução"
   - Veja tabela com dor de sessões anteriores
   - Note indicadores de tendência (↗↘→)
   - Veja color coding de dor (verde/amarelo/vermelho)
   - Veja médias no footer da tabela

8. **Teste o Sistema de Anexos (NOVO - Fase 4)**:
   - Pressione `Ctrl+4` para ir para Anexos
   - **Drag & Drop**:
     - Arraste uma imagem da área de trabalho
     - Veja área ficar azul durante drag
     - Solte arquivo
     - Veja toast de confirmação
   - **Seleção Manual**:
     - Clique em "Selecionar Arquivo"
     - Escolha múltiplos arquivos
     - Veja todos aparecerem no grid
   - **Câmera**:
     - Clique em "Tirar Foto"
     - Permita acesso à câmera
     - Veja preview ao vivo
     - Clique em "Capturar Foto"
     - Foto aparece automaticamente
   - **Visualização**:
     - Clique em "Ver" em uma imagem
     - Modal abre com imagem grande
     - Clique fora para fechar
     - Teste com vídeo (player com controles)
   - **Ações**:
     - Clique em "Baixar" para download
     - Clique na lixeira para remover
     - Veja animação de remoção

## Componentes Implementados

### ✅ Fase 1 - Fundação (COMPLETA)
- [x] Layout 3 painéis
- [x] Header fixo com timer
- [x] Sistema de tabs (Radix UI)
- [x] Formulário SOAP vertical
- [x] Auto-save com debounce de 2s
- [x] Status de salvamento visual
- [x] Atalhos de teclado
- [x] Progresso de preenchimento
- [x] Escala de dor (tab Métricas)

### ✅ Fase 2 - Core Functionalities (COMPLETA)
- [x] Sidebar esquerda (ações rápidas) com collapse
- [x] Painel direito (histórico, plano, exercícios) com collapse
- [x] Cards de contexto (SessionHistory, TreatmentPlan, Exercises)
- [x] Repetir conduta (última sessão ou sessão específica)
- [x] Integração completa de dados (paciente, sessões, plano)

### ✅ Fase 3 - Inteligência (COMPLETA)
- [x] Tab IA completa com sugestões editáveis
- [x] Componente AISuggestion (Apply/Edit/Discard)
- [x] Componente RiskAnalysis (Critical/Important/Info)
- [x] Evidências científicas
- [x] Análise de risco contextual
- [x] Integração com FormContext e auto-save
- [x] Botão "Gerar com IA" na tab IA

### ✅ Fase 4 - Polimento e Anexos (COMPLETA)
- [x] Mapa corporal interativo com 58 pontos anatômicos
- [x] MetricsTable com tendências e métricas comparativas
- [x] Tab Anexos completa (upload drag&drop, câmera, preview)
- [x] Animações avançadas (Framer Motion) em todos componentes
- [x] Grid responsivo de anexos (1-2-3 colunas)

### 🚧 Pendente (Pós-Fase 4)
- [ ] Gráficos de evolução com Recharts
- [ ] Responsividade mobile otimizada (< 768px)
- [ ] Testes E2E completos
- [ ] Persistência de anexos (Supabase Storage)
- [ ] SessionViewModal para visualizar sessões completas

## Documentação Detalhada

Para informações completas sobre cada fase:
- **Fase 1**: Ver [IMPLEMENTACAO_FASE1_COMPLETA.md](./IMPLEMENTACAO_FASE1_COMPLETA.md)
- **Fase 2**: Ver [IMPLEMENTACAO_FASE2_COMPLETA.md](./IMPLEMENTACAO_FASE2_COMPLETA.md)
- **Fase 3**: Ver [IMPLEMENTACAO_FASE3_COMPLETA.md](./IMPLEMENTACAO_FASE3_COMPLETA.md)
- **Fase 4**: Ver [IMPLEMENTACAO_FASE4_COMPLETA.md](./IMPLEMENTACAO_FASE4_COMPLETA.md)
- **Projeto Completo**: Ver [PROJETO_ATENDIMENTO_V2_COMPLETO.md](./PROJETO_ATENDIMENTO_V2_COMPLETO.md)

## Próximos Passos

1. ✅ Testar Fase 1 (Fundação) - Layout, tabs, auto-save
2. ✅ Testar Fase 2 (Core) - Sidebars, contexto, repetir conduta
3. ✅ Testar Fase 3 (IA) - Sugestões editáveis, análise de risco
4. 🚧 Implementar Fase 4 (Polimento) - Métricas avançadas, anexos, responsividade

## Problemas Conhecidos

- **AI Service**: Atualmente usa mock service - integrar com Gemini API real
- **Tab Anexos**: Ainda é placeholder (Fase 4)
- **Mapa Corporal Avançado**: Versão simples implementada - expandir na Fase 4
- **Responsividade Mobile**: Layout funcional mas não otimizado para mobile
