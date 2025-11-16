# Guia Completo da Agenda - DuduFisio-AI

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Funcionalidades Principais](#funcionalidades-principais)
3. [Atalhos de Teclado](#atalhos-de-teclado)
4. [Como Usar](#como-usar)
5. [FAQ](#faq)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

A Agenda é a página principal do sistema DuduFisio-AI. Ela permite gerenciar todos os agendamentos da clínica de forma intuitiva e eficiente.

### Características Principais

- ✅ **CRUD Completo**: Criar, visualizar, editar e excluir agendamentos
- ✅ **Múltiplas Visualizações**: Diária, Semanal, Mensal e Lista
- ✅ **Lista de Espera**: Gerencie pacientes aguardando por vagas
- ✅ **Bloqueios de Agenda**: Configure férias, almoço e ausências
- ✅ **Detecção de Conflitos**: Sistema inteligente detecta sobreposições
- ✅ **Filtros Avançados**: Encontre rapidamente o que precisa
- ✅ **Estatísticas em Tempo Real**: Acompanhe métricas importantes
- ✅ **Notificações**: Lembretes e alertas automáticos

---

## 🚀 Funcionalidades Principais

### 1. Visualizações da Agenda

#### **Visualização Diária**
- Mostra agendamentos de um único dia
- Ideal para visualizar detalhes de cada horário
- Atalho: `1`

#### **Visualização Semanal**
- Mostra uma semana completa
- Visualização padrão recomendada
- Atalho: `2`

#### **Visualização Mensal**
- Visão geral do mês
- Badges mostram número de agendamentos por dia
- Atalho: `3`

#### **Visualização em Lista**
- Lista ordenada de agendamentos
- Ideal para impressão ou exportação
- Atalho: `4`

### 2. Criar Agendamento

**Métodos:**
1. Clique em um slot vazio no calendário
2. Botão "Novo Agendamento" no toolbar
3. Atalho de teclado: `N` ou `Ctrl+N`

**Campos Obrigatórios:**
- Paciente
- Data e Hora
- Terapeuta
- Tipo de Atendimento
- Duração

**Funcionalidades Extras:**
- Agendamentos Recorrentes
- Templates de Horários
- Sugestão de Horários Alternativos (em caso de conflito)

### 3. Editar Agendamento

**Métodos:**
1. Clique no card do agendamento
2. Botão "Editar" no modal de detalhes
3. Quick Action ao hover (ícone de lápis)
4. Atalho: `E`

### 4. Excluir Agendamento

**Métodos:**
1. Modal de detalhes → Botão "Excluir"
2. Quick Action ao hover (ícone de lixeira)
3. Atalho: `Del`

**Opções:**
- Excluir apenas esta ocorrência
- Excluir esta e todas as futuras (para séries recorrentes)

### 5. Lista de Espera

**Acessar:**
- Botão "Lista de Espera" no toolbar
- Atalho: `W`

**Funcionalidades:**
- Adicionar paciente à lista
- Editar entrada (urgência, preferências)
- Agendar automaticamente quando vaga disponível
- Filtrar por urgência e terapeuta

### 6. Bloqueios de Agenda

**Acessar:**
- Botão "Bloqueios" no toolbar
- Atalho: `B`

**Tipos de Bloqueio:**
- Férias
- Almoço
- Ausência
- Feriado
- Treinamento
- Outro

**Recorrência:**
- Bloqueios podem ser recorrentes (diário, semanal, mensal)
- Configure dias específicos da semana

### 7. Filtros Avançados

**Acessar:**
- Botão "Filtros" no toolbar
- Atalho: `F`

**Filtros Disponíveis:**
- Status (agendado, concluído, cancelado, no-show)
- Tipo de Atendimento
- Terapeuta (multi-select)
- Paciente Específico
- Status de Pagamento
- Apenas Conflitos

**Filtros Salvos:**
- Salve combinações de filtros como favoritos
- Carregue com um clique
- Histórico de filtros usados

### 8. Busca Inteligente

**Acessar:**
- Campo de busca no toolbar
- Atalho: `/`

**Busca Por:**
- Nome do paciente
- CPF
- Telefone
- Nome do terapeuta
- Tipo de atendimento

**Funcionalidades:**
- Autocomplete com sugestões
- Histórico de buscas
- Score de relevância

### 9. Painel de Estatísticas

**Métricas Exibidas:**
- Total de agendamentos
- Taxa de ocupação (%)
- Valor total agendado
- Pacientes únicos
- Status: concluídos, agendados, cancelados, faltas
- Status de pagamento (pago vs pendente)
- Agendamentos por tipo

**Alertas Automáticos:**
- Taxa de faltas alta (>10%)
- Ocupação baixa (<50%)

### 10. Quick Actions

**Ações Disponíveis (ao hover no card):**
- ✓ Marcar como concluído
- $ Marcar como pago
- 📞 Ligar para paciente
- ✏️ Editar agendamento
- 🗑️ Excluir agendamento

### 11. Check-in Rápido

**Painel Lateral:**
- Lista agendamentos do dia
- Botão "Confirmar" para cada um
- Indicador de agendamentos em andamento
- Contador de confirmados

### 12. Templates de Horários

**Criar Template:**
1. Acesse "Templates" no menu
2. Defina nome, horário, dias e terapeuta
3. Salve o template

**Aplicar Template:**
1. Selecione um template
2. Clique em "Aplicar"
3. Agendamentos serão criados automaticamente

### 13. Exportação

**Formatos Disponíveis:**
- Imprimir (HTML otimizado)
- PDF
- Excel (CSV)
- Compartilhar link

### 14. Notificações

**Tipos de Notificações:**
- 🔔 Lembrete (1h antes)
- ⚠️ Atraso (paciente não confirmou)
- ❌ Conflito detectado
- ℹ️ Confirmação necessária

**Central de Notificações:**
- Badge com contagem de não lidas
- Marcar como lida
- Marcar todas como lidas
- Deletar notificações

---

## ⌨️ Atalhos de Teclado

### Navegação
| Atalho | Ação |
|--------|------|
| `←` | Período anterior |
| `→` | Próximo período |
| `T` | Ir para hoje |

### Ações
| Atalho | Ação |
|--------|------|
| `N` ou `Ctrl+N` | Novo agendamento |
| `E` | Editar agendamento selecionado |
| `Del` | Deletar agendamento selecionado |
| `S` | Salvar agendamento |

### Visualizações
| Atalho | Ação |
|--------|------|
| `1` | Visualização Diária |
| `2` | Visualização Semanal |
| `3` | Visualização Mensal |
| `4` | Visualização em Lista |

### Geral
| Atalho | Ação |
|--------|------|
| `F` ou `/` | Focar busca |
| `W` | Abrir lista de espera |
| `B` | Gerenciar bloqueios |
| `Esc` | Fechar modal/diálogo |
| `?` | Mostrar ajuda de atalhos |

---

## 📖 Como Usar

### Criar um Novo Agendamento

1. **Clique em um slot vazio** no calendário ou pressione `N`
2. **Selecione o paciente** usando a busca
3. **Escolha o terapeuta**
4. **Defina o tipo de atendimento**
5. **Configure duração** (30, 45 ou 60 minutos)
6. **Adicione observações** (opcional)
7. **Configure recorrência** (opcional)
8. **Clique em "Confirmar Agendamento"**

### Agendar Paciente da Lista de Espera

1. Acesse a **Lista de Espera** (`W`)
2. Clique em **"Agendar"** ao lado do paciente
3. O formulário abrirá com dados pré-preenchidos
4. Ajuste horário se necessário
5. Confirme o agendamento

### Criar Bloqueio de Agenda

1. Clique em **"Bloqueios"** (`B`)
2. Preencha as informações:
   - Terapeuta
   - Data e horário
   - Tipo de bloqueio
   - Motivo (opcional)
3. Configure recorrência (opcional)
4. Clique em **"Criar Bloqueio"**

### Usar Filtros

1. Clique em **"Filtros"** (`F`)
2. Selecione os filtros desejados
3. Os agendamentos serão filtrados automaticamente
4. **Salve o filtro** para usar novamente
5. **Limpe** para remover todos os filtros

### Buscar Agendamento

1. Pressione `/` para focar a busca
2. Digite o nome, CPF ou telefone
3. Selecione uma sugestão ou pressione Enter
4. Acesse histórico de buscas anteriores

### Marcar Presença Rapidamente

1. Localize o **Painel de Check-in** (lateral)
2. Clique em **"Confirmar"** ao lado do paciente
3. O status será atualizado automaticamente

### Exportar Agenda

1. Clique em **"Exportar"** no menu
2. Escolha o formato:
   - **Imprimir**: Para impressão em papel
   - **PDF**: Para arquivo PDF
   - **Excel**: Para planilha CSV
   - **Compartilhar**: Para enviar link

---

## ❓ FAQ

### Como agendar múltiplas sessões de uma vez?

Use a opção de **Agendamento Recorrente** no formulário. Defina:
- Frequência (diária, semanal, mensal)
- Dias da semana
- Data final (opcional)

### Como saber se há conflitos?

Conflitos são detectados automaticamente e exibidos com:
- Borda vermelha no card
- Badge "Conflito"
- Mensagem explicativa

### Como resolver um conflito?

1. Clique no agendamento com conflito
2. Visualize os horários alternativos sugeridos
3. Escolha um horário sugerido ou edite manualmente
4. Salve as alterações

### Como marcar um agendamento como pago?

**Métodos:**
1. Quick Action ao hover (ícone $)
2. Modal de detalhes → Aba "Pagamento"
3. Lista de agendamentos → Coluna de pagamento

### Como ver histórico de um paciente?

1. Clique no agendamento
2. Vá para a aba **"Histórico"**
3. Visualize últimas 10 sessões

### Como criar um template de horários?

1. Acesse **"Templates"** no menu
2. Preencha as informações
3. Salve o template
4. Use "Aplicar" para criar agendamentos rapidamente

### Como receber lembretes?

Os lembretes são automáticos:
- 1 hora antes do agendamento
- Notificação aparece no sistema
- Badge no ícone de sino

### Como filtrar agendamentos por pagamento?

1. Abra **Filtros** (`F`)
2. Em "Status de Pagamento":
   - Selecione "Pago" para ver apenas pagos
   - Selecione "Pendente" para ver apenas pendentes

### Como salvar uma configuração de filtros?

1. Configure os filtros desejados
2. Clique em **"Salvar"**
3. Digite um nome para o filtro
4. Carregue-o depois em **"Filtros Salvos"**

---

## 🔧 Troubleshooting

### Problema: Agendamento não aparece

**Soluções:**
1. Verifique os filtros ativos
2. Confirme que está na visualização correta
3. Verifique se o período está correto
4. Limpe o cache do navegador

### Problema: Conflito não detectado

**Soluções:**
1. Verifique se os horários estão corretos
2. Confirme que o terapeuta está correto
3. Recarregue a página
4. Verifique bloqueios de agenda

### Problema: Lista de espera não atualiza

**Soluções:**
1. Clique em "Atualizar"
2. Verifique filtro de status
3. Recarregue a página

### Problema: Exportação não funciona

**Soluções:**
1. Verifique bloqueador de pop-ups
2. Tente outro formato de exportação
3. Verifique permissões do navegador

### Problema: Notificações não aparecem

**Soluções:**
1. Verifique permissões de notificação do navegador
2. Confirme que o serviço está ativo
3. Verifique configurações de horário

### Problema: Atalhos de teclado não funcionam

**Soluções:**
1. Certifique-se de não estar em um campo de entrada
2. Pressione `Esc` para sair de campos
3. Recarregue a página

---

## 📞 Suporte

Para mais informações ou suporte:
- Email: suporte@dudufisio.com
- Telefone: (XX) XXXX-XXXX
- Documentação: https://docs.dudufisio.com

---

## 📝 Changelog

### Versão 1.0.0 (2025-01-17)
- ✅ CRUD completo de agendamentos
- ✅ Lista de espera com edição
- ✅ Gerenciamento de bloqueios
- ✅ Detecção inteligente de conflitos
- ✅ Filtros avançados com salvamento
- ✅ Busca inteligente com autocomplete
- ✅ Painel de estatísticas
- ✅ Quick actions
- ✅ Templates de horários
- ✅ Sistema de notificações
- ✅ Exportação (imprimir, PDF, Excel)
- ✅ Atalhos de teclado completos

---

**Última atualização:** 17 de Janeiro de 2025

