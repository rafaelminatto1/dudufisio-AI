# Fluxograma do App para Pacientes - DuduFisio

## Visão Geral

Este fluxograma mapeia todas as telas e interações do aplicativo para pacientes, desde o login até as funcionalidades principais.

---

## 1. Autenticação

### Tela de Login
- **Entrada:** Paciente recebe código de 6 dígitos do fisioterapeuta
- **Ação:** Digita o código no campo
- **Validação:** Sistema valida o código
  - ✅ **Válido:** Acessa o dashboard
  - ❌ **Inválido:** Mensagem de erro + tenta novamente

### Tecnologia
- JWT para autenticação
- Código armazenado no Supabase
- Expiração configurável (30 dias padrão)

---

## 2. Dashboard Principal

### Elementos
- **Card de Boas-vindas:** Nome do paciente + foto
- **Estatísticas Rápidas:**
  - Exercícios concluídos hoje
  - Taxa de conclusão semanal
  - Próxima sessão agendada
- **Ações Rápidas:**
  - Iniciar exercícios
  - Ver progresso
  - Registrar sintomas

### Menu de Navegação
- 🏋️ Meus Exercícios
- 📊 Meu Progresso
- 📅 Próximas Sessões
- 💬 Chat
- 👤 Meu Perfil
- 🩺 Registrar Sintomas
- 🔔 Notificações
- 🚪 Sair

---

## 3. Meus Exercícios

### Lista de Exercícios
- **Visualização:** Grid de cards
- **Cada card mostra:**
  - Thumbnail do exercício
  - Nome do exercício
  - Séries x Repetições
  - Duração
  - Status (✓ Concluído / Pendente)

### Filtros
- **Todos:** Mostra todos os exercícios
- **Concluídos:** Apenas exercícios já realizados
- **Pendentes:** Exercícios ainda não feitos

### Detalhes do Exercício
- **Vídeo Demonstrativo:** Player de vídeo com controles
- **Instruções:** Texto detalhado passo a passo
- **Parâmetros:**
  - Séries
  - Repetições
  - Duração
  - Descanso entre séries
- **Botão:** "Marcar como Concluído"

### Marcar como Concluído
1. Paciente clica no botão
2. Sistema registra conclusão
3. Modal de feedback com emojis:
   - 😠 Muito difícil
   - 😞 Difícil
   - 😐 Normal
   - 🙂 Fácil
   - 😄 Muito fácil
4. Retorna à lista atualizada

---

## 4. Meu Progresso

### Gráfico de Evolução
- **Tipos de visualização:**
  - Semanal
  - Mensal
  - Anual
- **Métricas:**
  - Exercícios concluídos
  - Taxa de conclusão
  - Frequência de sessões

### Histórico de Sessões
- **Lista cronológica:**
  - Data da sessão
  - Profissional responsável
  - Exercícios realizados
  - Feedback dado
- **Detalhes da sessão:**
  - Clique em uma sessão para ver detalhes completos

### Estatísticas Gerais
- Total de exercícios concluídos
- Sequência atual (streak)
- Melhor semana
- Evolução da dor (baseado em registros)

---

## 5. Próximas Sessões

### Agenda de Sessões
- **Próxima sessão destacada:**
  - Data e hora
  - Nome do fisioterapeuta
  - Foto do profissional
  - Local (sala/clínica)
- **Ações:**
  - Adicionar ao calendário (Google Calendar, Apple Calendar)
  - Ver no mapa (se houver endereço)
  - Ligar para clínica

### Sessões Futuras
- Lista de todas as sessões agendadas
- Visualização em calendário

---

## 6. Chat

### Lista de Conversas
- **Fisioterapeutas disponíveis:**
  - Foto
  - Nome
  - Última mensagem
  - Indicador de não lidas

### Tela de Conversa
- **Mensagens em tempo real**
- **Tipos de mensagem:**
  - Texto
  - Foto (câmera ou galeria)
  - Áudio (gravação)
  - Localização
- **Indicadores:**
  - Enviado ✓
  - Lido ✓✓
  - Digitando...

### Tecnologia
- WebSocket para tempo real
- Supabase Realtime
- Armazenamento de mídia no Supabase Storage

---

## 7. Meu Perfil

### Dados Pessoais
- Nome completo
- Data de nascimento
- Telefone
- E-mail
- Endereço

### Foto de Perfil
- Upload de foto
- Crop e ajuste
- Preview

### Configurações
- **Notificações:**
  - Lembretes de exercícios
  - Lembretes de sessões
  - Mensagens do fisio
  - Horário preferido
- **Privacidade:**
  - Compartilhamento de dados
  - Visibilidade do progresso
- **Idioma:**
  - Português (BR)
  - Inglês
  - Espanhol

---

## 8. Registrar Sintomas

### Mapa de Dor Corporal
- **Visualização:** Corpo humano (frente e costas)
- **Interação:**
  - Clique na região com dor
  - Seleciona intensidade (0-10)
  - Cor muda conforme intensidade
- **Regiões disponíveis:**
  - Cabeça/Pescoço
  - Ombros
  - Braços
  - Coluna (cervical, torácica, lombar)
  - Quadril
  - Pernas
  - Joelhos
  - Pés

### Escala de Dor (EVA)
- Slider de 0 a 10
- Emojis visuais
- Descrição textual

### Descrição de Sintomas
- Campo de texto livre
- Sugestões de sintomas comuns:
  - Dor aguda
  - Dor latejante
  - Formigamento
  - Dormência
  - Rigidez
  - Inchaço

### Salvar Registro
- Data e hora automáticas
- Histórico de registros
- Gráfico de evolução da dor

---

## 9. Notificações

### Tipos de Notificação
1. **Lembrete de Exercício:**
   - "Hora de fazer seus exercícios! 🏋️"
   - Clique → Vai para Lista de Exercícios

2. **Lembrete de Sessão:**
   - "Sua sessão é amanhã às 14h com Dr. João"
   - Clique → Vai para Próximas Sessões

3. **Mensagem do Fisio:**
   - "Dr. João enviou uma mensagem"
   - Clique → Abre o Chat

4. **Exercício Novo:**
   - "Você tem novos exercícios prescritos!"
   - Clique → Vai para Lista de Exercícios

### Configurações
- Ativar/desativar por tipo
- Horário de silêncio
- Som e vibração

---

## 10. Logout

### Ação
- Clique em "Sair"
- Confirmação: "Tem certeza?"
- Limpa token local
- Retorna para tela de login

---

## Fluxos Especiais

### Primeiro Acesso
1. Login com código
2. Tutorial interativo:
   - Apresenta cada funcionalidade
   - Permite pular
   - Pode ser acessado depois em Ajuda
3. Completar perfil:
   - Adicionar foto
   - Confirmar dados

### Sem Conexão
- Modo offline limitado:
  - Visualizar exercícios já baixados
  - Ver histórico local
  - Mensagens sincronizam quando voltar online
- Indicador visual de "offline"

### Notificações Push
- Permissão solicitada no primeiro acesso
- Configurável por tipo
- Funciona mesmo com app fechado

---

## Tecnologias Sugeridas

### Frontend
- **React Native** (iOS + Android nativos)
- **Expo** (facilita desenvolvimento)
- **React Navigation** (navegação)
- **React Query** (cache e sincronização)

### Backend
- **Supabase** (já usado no sistema)
- **Supabase Realtime** (chat)
- **Supabase Storage** (fotos e vídeos)
- **Supabase Auth** (autenticação)

### Notificações
- **Firebase Cloud Messaging** (push notifications)
- **Expo Notifications** (gerenciamento)

### Vídeo
- **Expo AV** (player de vídeo)
- **Cloudflare Stream** (streaming otimizado)

---

## Métricas de Sucesso

### Engajamento
- Taxa de conclusão de exercícios
- Frequência de uso do app
- Tempo médio de sessão

### Satisfação
- Feedback médio dos exercícios
- NPS (Net Promoter Score)
- Reviews na App Store/Google Play

### Retenção
- Usuários ativos diários (DAU)
- Usuários ativos mensais (MAU)
- Taxa de churn

---

## Próximos Passos

1. ✅ Fluxograma criado
2. ⏳ Criar protótipos de telas (Figma)
3. ⏳ Desenvolver MVP (React Native)
4. ⏳ Testes com usuários reais
5. ⏳ Lançamento beta
6. ⏳ Iteração baseada em feedback

---

**Fluxograma completo disponível em:** `fluxograma_app_paciente.png`
