# 📖 Guia de Uso - Agenda Modernizada FisioFlow

## 🎯 Visão Geral

A Agenda FisioFlow foi completamente modernizada com funcionalidades de última geração. Este guia explica como usar cada funcionalidade.

---

## 🚀 FUNCIONALIDADES PRINCIPAIS

### 1. 📋 Templates de Agendamento Rápido

**O que é**: Sistema de templates pré-configurados para agendar rapidamente.

**Como usar:**

1. **Abrir Templates**
   - Clique no botão verde **"Templates"** na barra de ferramentas
   - Ou use o atalho: `Cmd/Ctrl + K` → "Templates"

2. **Escolher Template**
   - Veja os 16 templates organizados por categoria:
     - 🏃 Fisioterapia (3 tipos)
     - 🧘 Pilates (2 tipos)
     - 📋 Avaliação (2 tipos)
     - 🔄 Retorno (2 tipos)
   - Use as tabs: "Todos", "Mais Usados", "Padrões"
   - Busque por nome ou tipo

3. **Aplicar Template**
   - Clique no template desejado
   - O formulário abre PRÉ-PREENCHIDO com:
     - Tipo de consulta
     - Duração (em minutos)
     - Valor padrão
     - Configurações de recorrência
   - Ajuste o paciente, data e hora
   - Salve!

**Benefícios:**
- ⚡ 50% mais rápido que preencher manualmente
- 📏 Padronização de valores e durações
- 🎯 Zero erros de digitação
- 📊 Contador de uso (veja quais são mais usados)

**Criar Template Personalizado:**
1. No dialog de templates, clique "Novo Template"
2. Preencha:
   - Nome e descrição
   - Ícone emoji (ex: 🏃, 🧘, 📋)
   - Tipo e duração
   - Valor padrão
   - Configurações (recorrência, equipamentos, salas)
3. Salve e use sempre que quiser!

---

### 2. 🤖 Sugestões Inteligentes de IA

**O que é**: Sistema de IA que sugere os 10 melhores horários para agendar baseado em múltiplos fatores.

**Como funciona:**
O algoritmo analisa:
- ✅ Carga de trabalho do terapeuta
- ✅ Gaps na agenda (evita muito pequenos ou grandes)
- ✅ Horários preferidos (manhã é melhor)
- ✅ Balanceamento entre dias
- ✅ Proximidade da data
- ✅ Evita sobrecarga

**Como usar:**

1. **Ver Sugestões**
   - Abra o formulário de novo agendamento
   - Selecione o paciente
   - Veja automaticamente as sugestões de IA
   - Lista ordenada por score (0-100)

2. **Entender o Score**
   - 🏆 80-100 (Verde): **Excelente** - Horário ideal
   - 🥈 60-79 (Azul): **Bom** - Horário recomendado
   - 🥉 0-59 (Laranja): **Disponível** - Horário OK

3. **Ranking Visual**
   - #1 🏆 Melhor horário
   - #2 🥈 Segunda melhor opção
   - #3 🥉 Terceira opção
   - #4-10 Outras boas opções

4. **Informações de Cada Sugestão**
   - 📅 Data completa em português
   - ⏰ Horário exato
   - 👨‍⚕️ Terapeuta disponível
   - 📊 Score e classificação
   - 💡 Razão do score
   - ✅ Lista de benefícios

5. **Selecionar Sugestão**
   - Clique na sugestão desejada
   - Data, hora e terapeuta são preenchidos automaticamente
   - Confirme os outros dados
   - Salve!

**Insights de Otimização:**

O sistema também analisa sua agenda e mostra:
- ⚠️ **Gaps Grandes**: Espaços >90min que podem ser preenchidos
- 🔴 **Sobrecarga**: Terapeutas com >8 consultas/dia
- 🟡 **Subutilização**: Dias com <3 consultas
- ❗ **Conflitos**: Agendamentos conflitantes

**Recomendações Personalizadas (Gemini):**
- Para pacientes específicos
- Considera condição médica
- Sugere frequência de tratamento
- Recomenda duração ideal

---

### 3. 🎫 Check-in com QR Code

**O que é**: Sistema automatizado de check-in usando QR Codes.

**Como usar:**

#### Para a Recepção:

1. **Acessar Painel de Recepção**
   - Navegue para `/checkin`
   - Ou adicione botão na agenda: "Recepção"

2. **Visualizar Próximas Chegadas**
   - Banner azul mostra próximas 2 horas
   - Cards com:
     - Avatar do paciente
     - Horário da consulta
     - Tempo restante (em X min)
     - Terapeuta responsável
     - Telefone para contato

3. **Gerenciar Check-ins**
   - **4 Tabs Organizadas:**
     - ⏱️ **Aguardando**: Pacientes esperados
     - ✅ **Check-in**: Já fizeram check-in
     - ⚠️ **Atrasados**: Passaram do horário
     - ❌ **No-show**: Faltaram

4. **Fazer Check-in Manual**
   - Botão verde "Fazer Check-in"
   - Marca instantaneamente
   - Atualiza status

5. **Gerar QR Code**
   - Clique no ícone de QR Code
   - Dialog abre com:
     - QR Code grande (300x300px)
     - Informações do paciente
     - URL de check-in
     - Botão "Download" (PNG)
     - Botão "Copiar URL"
   - **Uso**: Envie por WhatsApp ou Email!

#### Para o Paciente:

1. **Receber QR Code**
   - Via WhatsApp, Email ou impresso

2. **Escanear com Celular**
   - Abrir câmera
   - Apontar para QR Code
   - Link abre automaticamente

3. **Confirmar Check-in**
   - Página mostra dados da consulta
   - Paciente confirma
   - Check-in registrado!

4. **Notificação para Recepção**
   - Recepcionista vê atualização instantânea
   - Badge de status muda para "Check-in"

**Detecção Automática de Atrasos:**
- Sistema compara hora atual com horário marcado
- Se passou do horário → Move para tab "Atrasados"
- Mostra quantos minutos de atraso
- Badge laranja de alerta

**Stats em Tempo Real:**
- Números grandes no topo:
  - Aguardando (azul)
  - Check-in realizados (verde)
  - Atrasados (laranja)
- Atualiza automaticamente a cada 30 segundos

---

### 4. 📊 Dashboard de Analytics

**O que é**: Página dedicada com análises detalhadas da agenda.

**Como acessar:**
- Navegue para `/agenda-analytics`
- Ou adicione link na agenda

**O que você vê:**

#### KPIs (5 cards no topo)
1. **Total de Consultas** 📅 (azul)
   - Número total do mês
   
2. **Concluídos** 🏆 (verde)
   - Consultas finalizadas
   
3. **Receita Total** 💰 (emerald)
   - Soma de todos os valores
   
4. **Pacientes Únicos** 👥 (roxo)
   - Quantos pacientes diferentes
   
5. **Ticket Médio** 📈 (laranja)
   - Receita / Total de consultas

#### Gráficos Interativos (3 tabs)

**Tab 1 - Tendência (30 dias)**
- Gráfico de Área
- 2 linhas:
  - Consultas por dia (azul)
  - Receita por dia (verde)
- Identifique:
  - Dias mais movimentados
  - Picos de receita
  - Tendências crescentes/decrescentes

**Tab 2 - Por Tipo de Consulta**
- Gráfico de Pizza
- Distribuição %:
  - Fisioterapia Motora
  - Pilates
  - Avaliação
  - Retorno
  - Outros
- Cores distintas
- Percentuais visuais

**Tab 3 - Por Terapeuta**
- Gráfico de Barras duplas
- Para cada terapeuta:
  - Barra azul: Número de consultas
  - Barra verde: Receita em R$
- Compare performance
- Identifique top performers

**Ações Disponíveis:**
- 🔄 Atualização automática
- ⬇️ Exportar Relatório (botão preparado)
- 🔙 Voltar para Agenda

---

### 5. 📱 Atalhos de Teclado

**Command Palette (⌘K ou Ctrl+K):**
- Abre paleta de comandos
- Busque qualquer ação
- Execute rapidamente

**Atalhos Disponíveis:**
- `N` - Novo agendamento
- `F` - Toggle filtros
- `W` - Lista de espera
- `B` - Bloqueios
- `T` - Ir para hoje
- `1` - Vista diária
- `2` - Vista semanal
- `3` - Vista mensal
- `Esc` - Fechar modais
- `⌘K` - Command Palette

---

## 📐 LAYOUT E NAVEGAÇÃO

### Header (Topo)
- **Logo e Título**: Agenda
- **Data Atual**: Formatada em português
- **Mini Calendário**: Clique para abrir popover
- **Stats Rápidos**: Total, Pendentes, Concluídos, Ocupação, Alertas

### Toolbar (Segunda linha)
- **Busca**: Digite para filtrar
- **Filtros**: Toggle filtros avançados
- **Lista de Espera**: Ver lista (se houver)
- **Bloqueios**: Gerenciar bloqueios
- **Templates**: Botão verde ✨
- **Mais**: Menu com exportar, imprimir, compartilhar
- **Novo**: Botão azul principal

### Navegação de Data
- **◀**: Dia/semana/mês anterior
- **Hoje**: Volta para hoje
- **▶**: Dia/semana/mês seguinte

### Seletor de Vista
- Diária | Semanal | Mensal | Lista

### Mobile
- **FAB**: Botão azul flutuante (canto inferior direito) ✨
- **Touch**: Toque em qualquer elemento
- **Swipe**: Deslize para navegar

---

## 🎨 ESQUEMA DE CORES

### Status de Agendamento
- 🟢 **Verde**: Concluído
- 🔵 **Azul**: Agendado
- 🟠 **Laranja**: Pendente/Atrasado
- 🔴 **Vermelho**: Cancelado/No-show
- 🟣 **Roxo**: Conflito

### Indicadores
- **Progress Bars**: 
  - Verde: Completo
  - Azul: Em progresso
  - Laranja: Atenção
  
- **Badges**:
  - Verde: Pago/Concluído/Positivo
  - Azul: Informação/Padrão
  - Laranja: Pendente/Alerta
  - Vermelho: Erro/Conflito

---

## 💡 DICAS E MELHORES PRÁTICAS

### Agendamento
1. ✅ Use **Templates** para tipos comuns
2. ✅ Veja **Sugestões de IA** antes de escolher horário
3. ✅ Verifique **Conflitos** (badge vermelho)
4. ✅ Configure **Recorrência** para tratamentos longos
5. ✅ Preencha **Observações** importantes

### Check-in
1. ✅ Gere QR Codes **com antecedência**
2. ✅ Envie por **WhatsApp** 1 dia antes
3. ✅ Mantenha painel de recepção **sempre aberto**
4. ✅ Acompanhe **próximas chegadas**
5. ✅ Ligue para **atrasados** proativamente

### Analytics
1. ✅ Revise **semanalmente** para identificar padrões
2. ✅ Compare **terapeutas** para balancear carga
3. ✅ Identifique **horários de pico**
4. ✅ Otimize baseado em **gaps detectados**
5. ✅ Acompanhe **taxa de no-show**

### Templates
1. ✅ Crie templates para **procedimentos frequentes**
2. ✅ Revise e atualize **mensalmente**
3. ✅ Use templates **mais usados** para economia de tempo
4. ✅ Configure **equipamentos** necessários
5. ✅ Ative **recorrência** quando aplicável

---

## 🔄 FLUXOS DE TRABALHO

### Fluxo 1: Novo Agendamento (Método Rápido)
```
1. Cmd+K → "Novo Agendamento"
   OU clique botão "Templates"
   
2. Escolha template apropriado
   (ex: "Fisioterapia - Sessão Padrão")
   
3. Selecione paciente

4. Veja sugestões de IA
   → Escolha horário recomendado
   
5. Confirme → Salvar!

⏱️ Tempo: 30 segundos
```

### Fluxo 2: Novo Agendamento (Método Wizard)
```
1. Clique "Novo Agendamento"

2. Wizard Etapa 1: Selecione Paciente
   ✓ Lista com busca
   ✓ Clique no paciente
   ✓ "Próximo"

3. Wizard Etapa 2: Data e Hora
   ✓ Escolha data no calendário
   ✓ Escolha horário
   ✓ Selecione terapeuta
   ✓ "Próximo"

4. Wizard Etapa 3: Detalhes
   ✓ Tipo de consulta
   ✓ Valor
   ✓ Observações
   ✓ "Próximo"

5. Wizard Etapa 4: Confirmação
   ✓ Revise tudo
   ✓ "Confirmar Agendamento"

⏱️ Tempo: 1-2 minutos
```

### Fluxo 3: Check-in de Paciente
```
Opção A - Manual (Recepcionista):
1. Acesse /checkin
2. Veja "Próximas Chegadas"
3. Paciente chega
4. Clique "Fazer Check-in"
5. ✅ Pronto!

Opção B - Automático (QR Code):
1. Antes da consulta:
   → Gere QR Code
   → Envie por WhatsApp
   
2. Paciente escaneia ao chegar
   → Confirma dados
   → Check-in automático
   
3. Recepcionista vê atualização instantânea

⏱️ Tempo: 5 segundos (QR) vs 30 segundos (manual)
```

### Fluxo 4: Análise Semanal
```
1. Segunda-feira de manhã

2. Navegue para /agenda-analytics

3. Revise KPIs:
   - Quantas consultas na semana?
   - Taxa de conclusão está boa?
   - Receita dentro do esperado?
   - Ticket médio está saudável?

4. Veja gráficos:
   - Tab "Tendência": Identifique padrões
   - Tab "Tipos": Veja distribuição
   - Tab "Terapeutas": Compare performance

5. Tome ações:
   - Redistribua carga se necessário
   - Promova horários disponíveis
   - Entre em contato com no-shows
   - Otimize gaps grandes

⏱️ Tempo: 5-10 minutos/semana
```

---

## 📱 USO MOBILE

### FAB (Floating Action Button)
**Onde**: Canto inferior direito (apenas mobile)

**Quando aparece**: 
- Telas < 640px (smartphones)
- Role: Admin, Therapist, Educator

**O que faz**:
- Toque → Abre formulário de novo agendamento
- Sempre visível (z-index 50)
- Animação suave

### Gestos Mobile
- **Toque**: Abrir detalhes
- **Toque longo**: Menu de contexto
- **Arraste**: Mover agendamento (drag & drop)
- **Pinça**: Zoom (em desenvolvimento)

### Bottom Sheet (Vista Mobile)
- Swipe up: Ver mais detalhes
- Swipe down: Fechar
- Touch targets: Mínimo 44x44px

---

## 🎓 CENÁRIOS DE USO

### Cenário 1: Paciente Novo
```
Situação: Primeiro agendamento de um novo paciente

Passos:
1. Use template "Avaliação Inicial"
2. Cadastre paciente (se necessário)
3. Veja sugestões de IA
4. Escolha horário score 80+
5. Configure recorrência (se for tratamento contínuo)
6. Salve!

Resultado: Paciente agendado em <1 minuto
```

### Cenário 2: Tratamento Semanal
```
Situação: Paciente precisa de 10 sessões semanais

Passos:
1. Use template "Fisioterapia - Sessão Padrão"
2. Selecione paciente
3. Escolha horário
4. Ative recorrência "Semanal"
5. Defina: 10 sessões
6. Salve → 10 agendamentos criados!

Resultado: 10 sessões agendadas em 1 ação
```

### Cenário 3: Manhã Movimentada
```
Situação: Segunda-feira com muitos pacientes chegando

Solução:
1. Abra /checkin em um tablet na recepção
2. QR Codes já foram enviados no domingo
3. Pacientes chegam e escaneiam
4. Check-ins automáticos
5. Você apenas monitora a lista

Resultado: Recepção 80% mais eficiente
```

### Cenário 4: Planejamento Mensal
```
Situação: Início do mês, planejando a agenda

Passos:
1. Vá para /agenda-analytics
2. Revise mês anterior:
   - Quantas consultas?
   - Qual terapeuta mais produtivo?
   - Qual tipo de consulta mais comum?
3. Veja insights de otimização
4. Ajuste estratégia:
   - Crie templates para tipos frequentes
   - Balanceie carga entre terapeutas
   - Preencha gaps identificados

Resultado: Agenda otimizada baseada em dados
```

---

## ⚠️ ALERTAS E INDICADORES

### Conflitos
- **Cor**: Vermelho
- **Ícone**: ⚠️ AlertCircle
- **Ação**: Resolver imediatamente

### Próximas Chegadas (Check-in)
- **Cor**: Azul
- **Banner**: Destaque no topo
- **Limite**: Próximas 2 horas

### Atrasos
- **Cor**: Laranja
- **Badge**: "X min atraso"
- **Tab**: Separada para fácil identificação

### Sobrecarga (IA)
- **Severidade**: Alta
- **Sugestão**: Redistribuir consultas
- **Threshold**: >8 consultas/dia

### Gaps Grandes (IA)
- **Severidade**: Média
- **Sugestão**: Preencher com retornos
- **Threshold**: >90 minutos

---

## 🔧 CONFIGURAÇÕES E PERSONALIZAÇÃO

### Templates
- Crie templates personalizados
- Configure duração padrão
- Defina valores padrão
- Ative/desative recorrência
- Defina equipamentos necessários

### IA
- Score baseado em múltiplos fatores
- Ajustável por preferências
- Integração com Gemini para análises avançadas

### Check-in
- Atualização a cada 30 segundos
- Janela de próximas chegadas: 2 horas
- Definição de atraso: >0 minutos do horário

---

## 📞 SUPORTE

### Problemas Comuns

**P: QR Code não está gerando**
R: Verifique conexão com internet (usa API pública)

**P: Sugestões de IA não aparecem**
R: Certifique-se de ter selecionado um paciente

**P: Template não preenche formulário**
R: Recarregue a página e tente novamente

**P: FAB não aparece**
R: FAB é apenas para mobile (<640px de largura)

**P: Gráficos não carregam**
R: Precisa de pelo menos 1 consulta para gerar gráficos

---

## 🎉 CONCLUSÃO

Você agora tem acesso a um dos sistemas de agendamento mais completos e modernos para fisioterapia!

**Use para:**
- ⚡ Agendar em segundos (templates)
- 🤖 Otimizar automaticamente (IA)
- 🎫 Check-in sem fricção (QR Code)
- 📊 Tomar decisões baseadas em dados (analytics)
- 📱 Trabalhar em qualquer dispositivo (mobile-first)

**Próximos passos:**
1. Explore cada funcionalidade
2. Crie seus templates personalizados
3. Envie QR Codes para pacientes
4. Revise analytics semanalmente
5. Use sugestões de IA sempre

**Bom trabalho! 🚀**

