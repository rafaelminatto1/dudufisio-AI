# Wireframes e Guia Visual - Página de Atendimento

## Wireframe Completo - Vista Desktop

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  ◄ Voltar   │   👤 RAFAEL MINATTO • 28/10/2025 às 08:00                           │
│  ─────────────────────────────────────────────────────────────────────────────────  │
│  ⏱ 00:45:23  ▶  ⏸  ⏹   │   💾 Salvo há 12s   │   ✅ Finalizar Sessão             │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────┬───────────────────────────────────────────────────┬──────────────────┐
│             │                                                   │                  │
│ SIDEBAR     │   ÁREA DE TRABALHO                                │  PAINEL CONTEXTO │
│ (240px)     │   (Flex - cresce)                                 │  (280px)         │
│             │                                                   │                  │
│ ┌─────────┐ │ ┌───────────────────────────────────────────────┐ │ ┌──────────────┐ │
│ │ AÇÕES   │ │ │ TABS:                                         │ │ │ [◀ Ocultar]  │ │
│ │ RÁPIDAS │ │ │ [📝 SOAP] [📊 Métricas] [🧠 IA] [📎 Anexos]  │ │ │   CONTEXTO   │ │
│ ├─────────┤ │ └───────────────────────────────────────────────┘ │ ├──────────────┤ │
│ │🔄 Repet.│ │                                                   │ │              │ │
│ │🧠 IA    │ │ ┌─────────────────────────────────────────────┐   │ │ 📋 HISTÓRICO │ │
│ │📸 Foto  │ │ │ 📝 Registro SOAP da Sessão #1               │   │ │              │ │
│ │📎 Anexo │ │ │                                             │   │ │ ┌──────────┐ │ │
│ └─────────┘ │ │ Progresso: ████████░░░░ 60% | 4/5 completos │   │ │ │ #4-21/10 │ │ │
│             │ │                                             │   │ │ │ Dor: 6   │ │ │
│ ┌─────────┐ │ └─────────────────────────────────────────────┘   │ │ │ [Repetir]│ │ │
│ │ SESSÕES │ │                                                   │ │ └──────────┘ │ │
│ ├─────────┤ │ ┌─────────────────────────────────────────────┐   │ │              │ │
│ │▶#1-Hoje │ │ │ 🗣 S - SUBJETIVO *        [742/5000]        │   │ │ ┌──────────┐ │ │
│ │ #0-21/10│ │ │ ┌─────────────────────────────────────────┐ │   │ │ │ #3-18/10 │ │ │
│ └─────────┘ │ │ │ Paciente relata dor no joelho direito...│ │   │ │ │ Dor: 7   │ │ │
│             │ │ │                                         │ │   │ │ │ [Repetir]│ │ │
│ ┌─────────┐ │ │ │                                         │ │   │ │ └──────────┘ │ │
│ │ RESUMO  │ │ │ │                                         │ │   │ │              │ │
│ ├─────────┤ │ │ └─────────────────────────────────────────┘ │   │ ├──────────────┤ │
│ │📞 Tel   │ │ │                                             │   │ │ 🎯 PLANO     │ │
│ │🎂 Idade │ │ └─────────────────────────────────────────────┘   │ │              │ │
│ │💪 5 sess│ │                                                   │ │ Objetivo:    │ │
│ │📅 5 dias│ │ ┌─────────────────────────────────────────────┐   │ │ Reabilitação │ │
│ └─────────┘ │ │ 🔍 O - OBJETIVO *         [531/5000]        │   │ │ joelho LCA   │ │
│             │ │ ┌─────────────────────────────────────────┐ │   │ │              │ │
│             │ │ │ ROM joelho: 0-110°, edema leve...       │ │   │ │ ████░░ 60%   │ │
│             │ │ │                                         │ │   │ │ 12/20 sessões│ │
│             │ │ │                                         │ │   │ │              │ │
│             │ │ │                                         │ │   │ │ [Detalhes]   │ │
│             │ │ └─────────────────────────────────────────┘ │   │ ├──────────────┤ │
│             │ │                                             │   │ │ 💪 EXERCÍCIOS│ │
│             │ │ [🧠 Gerar Avaliação e Plano com IA]         │   │ │              │ │
│             │ │                                             │   │ │ • Leg Press  │ │
│             │ │                                             │   │ │ • Extensora  │ │
│             │ │ ┌─────────────────────────────────────────┐ │   │ │ • Prancha    │ │
│             │ │ │ 📋 A - AVALIAÇÃO *        [423/5000]    │ │   │ │              │ │
│             │ │ │ ┌─────────────────────────────────────┐ │ │   │ │ [Ver Todos]  │ │
│             │ │ │ │ Evolução positiva, redução dor...   │ │ │   │ └──────────────┘ │
│             │ │ │ │                                     │ │ │   │                  │
│             │ │ │ └─────────────────────────────────────┘ │ │   │                  │
│             │ │ │                                         │ │   │                  │
│             │ │ └─────────────────────────────────────────┘ │   │                  │
│             │ │                                             │   │                  │
│             │ │ ┌─────────────────────────────────────────┐ │   │                  │
│             │ │ │ 📝 P - PLANO *            [612/5000]    │ │   │                  │
│             │ │ │ ┌─────────────────────────────────────┐ │ │   │                  │
│             │ │ │ │ Mobilização patelar, fortalecimento │ │ │   │                  │
│             │ │ │ │                                     │ │ │   │                  │
│             │ │ │ └─────────────────────────────────────┘ │ │   │                  │
│             │ │ └─────────────────────────────────────────┘ │   │                  │
│             │ │                                             │   │                  │
└─────────────┴───────────────────────────────────────────────┴──────────────────────┘
```

---

## Wireframe - Tab Métricas & Dor

```
┌───────────────────────────────────────────────────────────────────────────┐
│ TABS: [ 📝 SOAP ] [📊 Métricas] [ 🧠 IA ] [ 📎 Anexos ]                  │
└───────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────────┐
│ 📊 Avaliações e Métricas                                                  │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│ 😣 ESCALA DE DOR (EVA)                                                    │
│ ┌─────────────────────────────────────────────────────────────────────┐   │
│ │                                                                     │   │
│ │   0    1    2    3    4    5    6    7    8    9    10            │   │
│ │   😊   🙂   😐   😕   😟   😣   😖   😫   😩   😭   💀           │   │
│ │                                                                     │   │
│ │   ┌──────────────────────────●────────────────────────────┐        │   │
│ │   │                          5/10                         │        │   │
│ │   └───────────────────────────────────────────────────────┘        │   │
│ │                                                                     │   │
│ │   👈 Clique ou arraste para selecionar                             │   │
│ │                                                                     │   │
│ └─────────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│ 🗺 MAPA CORPORAL DE DOR                                                   │
│ ┌─────────────────────────────────────────────────────────────────────┐   │
│ │                                                                     │   │
│ │                        🧍 Figura Humana                             │   │
│ │                       ┌────────┐                                    │   │
│ │                       │  Cabeça│                                    │   │
│ │                       └────────┘                                    │   │
│ │                    ┌───┴────┴───┐                                   │   │
│ │                    │   Tronco   │                                   │   │
│ │                    └─────────────┘                                  │   │
│ │                  ┌────┘       └────┐                                │   │
│ │               Braço E          Braço D                              │   │
│ │                                                                     │   │
│ │             ┌──────┘               └──────┐                         │   │
│ │          Perna E                       Perna D 🔴                   │   │
│ │                                                                     │   │
│ │  👈 Clique em uma região para adicionar observação de dor           │   │
│ │                                                                     │   │
│ └─────────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│ 📍 Regiões Marcadas:                                                      │
│ ┌───────────────────────────────────────────────────────────────┐         │
│ │ 🔴 Joelho Direito                                             │         │
│ │ "Dor ao subir escadas, piora no final do dia"                │         │
│ │ [✏️ Editar]  [🗑️ Remover]                                    │         │
│ └───────────────────────────────────────────────────────────────┘         │
│                                                                           │
│ ┌───────────────────────────────────────────────────────────────┐         │
│ │ 🟡 Lombar                                                      │         │
│ │ "Rigidez matinal, melhora após aquecimento"                   │         │
│ │ [✏️ Editar]  [🗑️ Remover]                                    │         │
│ └───────────────────────────────────────────────────────────────┘         │
│                                                                           │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│ 📏 MÉTRICAS DE ACOMPANHAMENTO                                             │
│                                                                           │
│ ┌─────────────────┬────────────┬───────────┬──────────────┐              │
│ │ Métrica         │ Anterior   │ Atual     │ Variação     │              │
│ ├─────────────────┼────────────┼───────────┼──────────────┤              │
│ │ ROM Joelho (°)  │ 100°       │ [110° ]   │ +10° ↗ 🟢   │              │
│ │ Força Quad.     │ 4/5        │ [4/5  ]   │ = → 🟡      │              │
│ │ Edema (cm)      │ 2.0 cm     │ [1.5  ]   │ -0.5 ↘ 🟢   │              │
│ │ Perimetria      │ 42 cm      │ [41   ]   │ -1.0 ↘ 🟢   │              │
│ └─────────────────┴────────────┴───────────┴──────────────┘              │
│                                                                           │
│ [ + Adicionar Nova Métrica ]                                              │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## Wireframe - Tab Assistente IA

```
┌───────────────────────────────────────────────────────────────────────────┐
│ TABS: [ 📝 SOAP ] [ 📊 Métricas ] [🧠 IA] [ 📎 Anexos ]                  │
└───────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────────┐
│ 🧠 Assistente IA - Suporte à Decisão Clínica                             │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│ ℹ️  A IA analisa os dados de S (Subjetivo) e O (Objetivo) para sugerir  │
│     uma Avaliação e Plano de tratamento. Você pode aceitar, editar ou    │
│     descartar as sugestões.                                              │
│                                                                           │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│ ✨ SUGESTÃO DE AVALIAÇÃO                                                  │
│ ┌─────────────────────────────────────────────────────────────────────┐   │
│ │ 💡 Gerado baseado em: S + O + Dor (5/10) + Histórico                │   │
│ │                                                                     │   │
│ │ O paciente apresenta evolução positiva no quadro clínico, com       │   │
│ │ redução significativa da dor (de 8/10 para 5/10 em 7 dias).         │   │
│ │ O ganho de 10° na amplitude articular do joelho indica boa          │   │
│ │ resposta ao protocolo de mobilização articular e fortalecimento     │   │
│ │ muscular aplicado. A redução do edema (de 2cm para 1.5cm)           │   │
│ │ demonstra melhora do processo inflamatório.                         │   │
│ │                                                                     │   │
│ │ Pontos de atenção:                                                  │   │
│ │ • Força do quadríceps mantém-se em 4/5 - sugere intensificação     │   │
│ │ • Dor ainda presente ao subir escadas - trabalhar descida          │   │
│ │                                                                     │   │
│ │ ┌──────────────┐  ┌────────────────────┐  ┌──────────────┐        │   │
│ │ │ ✓ Aplicar    │  │ ✏️ Editar e Aplicar│  │ ✗ Descartar  │        │   │
│ │ └──────────────┘  └────────────────────┘  └──────────────┘        │   │
│ └─────────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│ ✨ SUGESTÃO DE PLANO                                                      │
│ ┌─────────────────────────────────────────────────────────────────────┐   │
│ │ 💡 Gerado baseado em: Avaliação + Protocolos + Evidências          │   │
│ │                                                                     │   │
│ │ CONDUTA PROPOSTA:                                                   │   │
│ │                                                                     │   │
│ │ 1. Mobilização Articular do Joelho                                 │   │
│ │    • Graus I-III de Maitland                                       │   │
│ │    • Foco em deslizamento patelar                                  │   │
│ │    • 3 séries de 1 minuto                                          │   │
│ │                                                                     │   │
│ │ 2. Fortalecimento de Quadríceps                                    │   │
│ │    • Cadeira extensora: 3x15 repetições (60% 1RM)                  │   │
│ │    • Leg press 45°: 3x12 repetições                                │   │
│ │    • Agachamento isométrico na parede: 3x30s                       │   │
│ │                                                                     │   │
│ │ 3. Alongamento de Isquiotibiais                                    │   │
│ │    • 30 segundos cada lado, 3 repetições                           │   │
│ │                                                                     │   │
│ │ 4. Crioterapia                                                     │   │
│ │    • 15 minutos ao final da sessão                                 │   │
│ │                                                                     │   │
│ │ 5. Orientações para Casa                                           │   │
│ │    • Continuar exercícios de fortalecimento                        │   │
│ │    • Evitar atividades de alto impacto                             │   │
│ │    • Aplicar gelo se houver aumento da dor                         │   │
│ │                                                                     │   │
│ │ ┌──────────────┐  ┌────────────────────┐  ┌──────────────┐        │   │
│ │ │ ✓ Aplicar    │  │ ✏️ Editar e Aplicar│  │ ✗ Descartar  │        │   │
│ │ └──────────────┘  └────────────────────┘  └──────────────┘        │   │
│ └─────────────────────────────────────────────────────────────────────┘   │
│                                                                           │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│ 🔮 ANÁLISE DE RISCO E ALERTAS                                             │
│ ┌─────────────────────────────────────────────────────────────────────┐   │
│ │ ⚠️ ALERTAS DE PROTOCOLO                                             │   │
│ │                                                                     │   │
│ │ 🔴 CRÍTICO:                                                         │   │
│ │ • Teste de Lachman não realizado há 3 sessões                      │   │
│ │   Recomendação: Realizar na próxima sessão para avaliar estabilidade│   │
│ │                                                                     │   │
│ │ 🟡 IMPORTANTE:                                                      │   │
│ │ • Considerar avaliação de força com dinamômetro                    │   │
│ │ • Reavaliação de ROM prevista para próxima semana                  │   │
│ │                                                                     │   │
│ │ 🟢 BOAS PRÁTICAS:                                                   │   │
│ │ • Paciente aderente ao tratamento (presença 100%)                  │   │
│ │ • Evolução dentro do esperado para o quadro                        │   │
│ └─────────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│ ┌─────────────────────────────────────────────────────────────────────┐   │
│ │ 📚 EVIDÊNCIAS CIENTÍFICAS                                           │   │
│ │                                                                     │   │
│ │ As intervenções sugeridas são baseadas em:                         │   │
│ │ • Protocolo ACL Rehab (2023) - Level A Evidence                    │   │
│ │ • Systematic Review - Knee Strengthening (2022)                    │   │
│ │ • Clinical Guidelines - APTA (2024)                                │   │
│ │                                                                     │   │
│ │ [ Ver Referências Completas ]                                      │   │
│ └─────────────────────────────────────────────────────────────────────┘   │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## Wireframe - Tab Anexos

```
┌───────────────────────────────────────────────────────────────────────────┐
│ TABS: [ 📝 SOAP ] [ 📊 Métricas ] [ 🧠 IA ] [📎 Anexos]                  │
└───────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────────┐
│ 📎 Anexos e Documentação da Sessão                                        │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│ ┌─────────────────────────────────────────────────────────────────────┐   │
│ │ 📤 ADICIONAR ARQUIVOS                                               │   │
│ │                                                                     │   │
│ │  ┌──────────────────────────────────────────────────────────────┐  │   │
│ │  │                                                              │  │   │
│ │  │              📁 Arraste arquivos aqui                        │  │   │
│ │  │                      ou                                      │  │   │
│ │  │              [ 📂 Selecionar Arquivos ]                      │  │   │
│ │  │                                                              │  │   │
│ │  │  Formatos aceitos: JPG, PNG, PDF, MP3, MP4 (max 10MB)       │  │   │
│ │  └──────────────────────────────────────────────────────────────┘  │   │
│ │                                                                     │   │
│ │  [ 📸 Tirar Foto ]   [ 🎥 Gravar Vídeo ]   [ 🎙️ Gravar Áudio ]    │   │
│ └─────────────────────────────────────────────────────────────────────┘   │
│                                                                           │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│ 🖼️ FOTOS DA SESSÃO (3 arquivos)                                          │
│                                                                           │
│ ┌────────────────┐  ┌────────────────┐  ┌────────────────┐              │
│ │ ╔════════════╗ │  │ ╔════════════╗ │  │ ╔════════════╗ │              │
│ │ ║            ║ │  │ ║            ║ │  │ ║            ║ │              │
│ │ ║   [IMG]    ║ │  │ ║   [IMG]    ║ │  │ ║   [IMG]    ║ │              │
│ │ ║  ROM Test  ║ │  │ ║   Edema    ║ │  │ ║  Postura   ║ │              │
│ │ ║            ║ │  │ ║            ║ │  │ ║            ║ │              │
│ │ ╚════════════╝ │  │ ╚════════════╝ │  │ ╚════════════╝ │              │
│ │ ROM_Joelho.jpg │  │ Edema_Pat.jpg  │  │ Postura.jpg    │              │
│ │ 2.3 MB • 08:15 │  │ 1.8 MB • 08:22 │  │ 2.1 MB • 08:30 │              │
│ │                │  │                │  │                │              │
│ │ [👁️] [⬇️] [🗑️]│  │ [👁️] [⬇️] [🗑️]│  │ [👁️] [⬇️] [🗑️]│              │
│ └────────────────┘  └────────────────┘  └────────────────┘              │
│                                                                           │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│ 📄 DOCUMENTOS (2 arquivos)                                                │
│                                                                           │
│ ┌─────────────────────────────────────────────────────────────────────┐   │
│ │ 📑 Exame_Raio-X_Joelho_21-10-2025.pdf                               │   │
│ │ 1.2 MB • Adicionado em 21/10/2025 às 14:30                         │   │
│ │ [ 👁️ Visualizar ]  [ ⬇️ Download ]  [ 🗑️ Excluir ]                 │   │
│ └─────────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│ ┌─────────────────────────────────────────────────────────────────────┐   │
│ │ 📑 Laudo_Ressonancia_Magnetica.pdf                                  │   │
│ │ 3.5 MB • Adicionado em 18/10/2025 às 10:15                         │   │
│ │ [ 👁️ Visualizar ]  [ ⬇️ Download ]  [ 🗑️ Excluir ]                 │   │
│ └─────────────────────────────────────────────────────────────────────┘   │
│                                                                           │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│ 🎙️ ÁUDIOS E VÍDEOS (1 arquivo)                                           │
│                                                                           │
│ ┌─────────────────────────────────────────────────────────────────────┐   │
│ │ 🎵 Observacoes_paciente_21-10.mp3                                   │   │
│ │ ▶️ [━━━━━━━●══════════════] 02:34 / 05:12                           │   │
│ │ 850 KB • Gravado em 21/10/2025 às 08:45                            │   │
│ │ [ ⬇️ Download ]  [ 🗑️ Excluir ]                                     │   │
│ └─────────────────────────────────────────────────────────────────────┘   │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## Estados e Interações Visuais

### Estado: Formulário Vazio (Início da Sessão)

```
┌─────────────────────────────────────────────────────────────────────┐
│ 📝 Registro SOAP da Sessão #1                                       │
│ ┌───────────────────────────────────────────────────────────────┐   │
│ │ Progresso: ░░░░░░░░░░░░░░ 0%  | 0/4 campos completos          │   │
│ │ ⚠️ Preencha ao menos os campos obrigatórios (S, O, A, P)       │   │
│ └───────────────────────────────────────────────────────────────┘   │
│                                                                     │
│ 🗣 S - SUBJETIVO *                                      [0/5000]   │
│ ┌───────────────────────────────────────────────────────────────┐   │
│ │ ⚠️ Campo obrigatório                                          │   │
│ │ Queixas e sintomas relatados pelo paciente...                 │   │
│ │                                                               │   │
│ └───────────────────────────────────────────────────────────────┘   │
```

### Estado: Validação de Campo (Erro)

```
│ 🗣 S - SUBJETIVO *                                      [8/5000]   │
│ ┌───────────────────────────────────────────────────────────────┐   │
│ │ Muito curto                                                   │   │ ← Borda vermelha
│ └───────────────────────────────────────────────────────────────┘   │
│ ❌ Campo muito curto. Mínimo de 10 caracteres.                     │ ← Mensagem de erro
```

### Estado: Campo Válido

```
│ 🗣 S - SUBJETIVO *                                    [142/5000]  │
│ ┌───────────────────────────────────────────────────────────────┐   │
│ │ Paciente relata dor no joelho direito, intensidade 6/10,      │   │ ← Borda verde
│ │ que piora ao subir escadas. Iniciou há 2 semanas...           │   │
│ └───────────────────────────────────────────────────────────────┘   │
│ ✓ Campo válido                                                      │ ← Ícone de check
```

### Estado: Salvamento Automático

```
┌─────────────────────────────────────────────────────────────────────┐
│ Header:  💾 Salvando...  [spinner animado]                          │
│          ↓                                                          │
│          💾 Salvo há 3s  [check verde]                              │
└─────────────────────────────────────────────────────────────────────┘
```

### Estado: Progresso de Preenchimento

```
Progresso: ████████░░░░░░ 60%  | 3/4 campos completos

✓ S - Subjetivo (142 caracteres)
✓ O - Objetivo (98 caracteres)
✓ A - Avaliação (85 caracteres)
⚠️ P - Plano (pendente)
```

### Estado: IA Processando

```
┌─────────────────────────────────────────────────────────────────────┐
│ [🧠 Gerando sugestões com IA...]  [spinner]                        │
│                                                                     │
│ ⏳ Analisando dados clínicos...                                     │
│ ⏳ Consultando protocolos baseados em evidência...                  │
│ ⏳ Gerando sugestões personalizadas...                              │
└─────────────────────────────────────────────────────────────────────┘
```

### Estado: Painel Contexto Colapsado

```
┌──┐
│◀ │  ← Botão fino para expandir
│C │
│O │
│N │
│T │
│E │
│X │
│T │
│O │
└──┘
```

---

## Componentes Reutilizáveis

### 1. Card de Sessão Anterior (Histórico)

```
┌────────────────────────────────────┐
│ Sessão #4 - 21/10/2025             │
├────────────────────────────────────┤
│ ⏱ Duração: 45 min                 │
│ 😣 Dor: 6/10                       │
│ 📍 ROM: 100°                       │
│                                    │
│ Conduta:                           │
│ "Mobilização patelar..."           │
│                                    │
│ [👁️ Ver Completo]  [🔄 Repetir]   │
└────────────────────────────────────┘
```

### 2. Badge de Status

```
╔════════════╗
║ 💾 Salvo   ║  ← Verde: #10B981
╚════════════╝

╔════════════╗
║ ⏳ Salvando║  ← Amarelo: #F59E0B
╚════════════╝

╔════════════╗
║ ❌ Erro    ║  ← Vermelho: #EF4444
╚════════════╝

╔════════════╗
║ ⚠️ Não Salvo║  ← Laranja: #F97316
╚════════════╝
```

### 3. Botão com Estado de Loading

```
Normal:     [✅ Finalizar Sessão]
Hover:      [✅ Finalizar Sessão] ← Fundo mais escuro
Loading:    [⏳ Finalizando...] ← Spinner
Disabled:   [✅ Finalizar Sessão] ← Opacidade 50%, cursor not-allowed
```

### 4. Textarea Auto-expansível

```
Vazio (3 linhas):
┌─────────────────────────────────────┐
│ Placeholder text...                 │
│                                     │
│                                     │
└─────────────────────────────────────┘

Com conteúdo (expande):
┌─────────────────────────────────────┐
│ Paciente relata dor no joelho       │
│ direito, que piora ao subir         │
│ escadas. Iniciou há 2 semanas       │
│ após corrida. Sem trauma agudo.     │
│ Dor aumenta no final do dia.        │
│                                     │ ← Cresce automaticamente
└─────────────────────────────────────┘
```

### 5. Modal de Confirmação

```
┌─────────────────────────────────────────────┐
│                                             │
│  ⚠️  Repetir Conduta da Sessão Anterior     │
│                                             │
│  Isso irá substituir o conteúdo atual dos   │
│  campos S, O, A e P. Deseja continuar?      │
│                                             │
│  [❌ Cancelar]         [✓ Confirmar]        │
│                                             │
└─────────────────────────────────────────────┘
```

---

## Responsividade

### Mobile (< 768px)

```
┌──────────────────────────────┐
│ ☰  RAFAEL MINATTO            │
│ ⏱ 00:45:23  [▶][⏸]          │
│ 💾 Salvo  [✅ Finalizar]     │
└──────────────────────────────┘

┌──────────────────────────────┐
│ [📝][📊][🧠][📎]             │ ← Tabs com scroll horizontal
└──────────────────────────────┘

┌──────────────────────────────┐
│                              │
│  Formulário SOAP             │
│  (ocupa 100% largura)        │
│                              │
│  🗣 S - SUBJETIVO *          │
│  ┌────────────────────────┐  │
│  │                        │  │
│  └────────────────────────┘  │
│                              │
│  🔍 O - OBJETIVO *           │
│  ┌────────────────────────┐  │
│  │                        │  │
│  └────────────────────────┘  │
│                              │
└──────────────────────────────┘

┌──────────────────────────────┐
│ [▲] Histórico e Contexto     │ ← Bottom sheet colapsável
└──────────────────────────────┘
```

### Tablet (768px - 1280px)

```
┌────────────────────────────────────────────────────────┐
│ ◄ Voltar  │  👤 RAFAEL MINATTO                        │
│ ⏱ 00:45:23 [▶][⏸]  │  💾 Salvo  │  [✅ Finalizar]    │
└────────────────────────────────────────────────────────┘

┌───────────┬────────────────────────────┬───────────────┐
│ [◀ Menu]  │  Área de Trabalho          │  [◀ Contexto] │
│ Colapsado │  (maior espaço)            │   Colapsado   │
└───────────┴────────────────────────────┴───────────────┘
```

---

## Guia de Cores por Contexto

### SOAP Fields

```
S - Subjetivo:  #3B82F6 (Azul)     🗣
O - Objetivo:   #10B981 (Verde)    🔍
A - Avaliação:  #8B5CF6 (Roxo)     📋
P - Plano:      #F97316 (Laranja)  📝
```

### Status

```
Sucesso:   #10B981 (Verde)    ✓
Aviso:     #F59E0B (Amarelo)  ⚠️
Erro:      #EF4444 (Vermelho) ❌
Info:      #06B6D4 (Ciano)    ℹ️
```

### Elementos de UI

```
Background primário:    #FFFFFF
Background secundário:  #F8FAFC
Borda:                  #E2E8F0
Texto primário:         #0F172A
Texto secundário:       #475569
Hover:                  #F1F5F9
Focus ring:             #3B82F6
```

---

## Conclusão dos Wireframes

Estes wireframes demonstram:

✅ **Hierarquia Visual Clara**: Elementos importantes em destaque
✅ **Fluxo Progressivo**: Guia natural de cima para baixo, esquerda para direita
✅ **Feedback Constante**: Estados visuais claros para cada ação
✅ **Organização Lógica**: Informação agrupada por contexto
✅ **Acessibilidade**: Indicações visuais e textuais para todas as ações

Próximos passos: Implementar os componentes base e testar com usuários reais.
