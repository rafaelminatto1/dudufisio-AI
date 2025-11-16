# Checklist de Acessibilidade – Dudufisio AI

Cobertura alinhada à WCAG 2.2 Nível AA, considerando fluxos de fisioterapeutas e pacientes, uso em tablets e PWA.

## 1. Perceptível
- Texto alternativo em imagens e mídia instrucional (vídeos de exercícios com legendas e transcrições).
- Estrutura semântica correta (`header`, `main`, `nav`, `footer`, `section`, `h1-h3`).
- Contraste mínimo 4.5:1 para texto padrão e 3:1 para tipografia grande; usar tokens `colors.highContrast` quando `prefers-contrast: more` ativo.
- Suporte a redimensionamento de texto até 200% sem perda de conteúdo ou funcionalidade.
- Indicadores visíveis para estados de foco, hover e validação de formulários.

## 2. Operável
- Navegação por teclado completa (Tab, Shift+Tab, Enter, Espaço, setas em componentes customizados).
- Ordem de foco lógica, consistente com leitura visual.
- Atalhos de teclado configuráveis para atividades de fisioterapeuta (ex.: salvar notas, avançar etapas).
- Gestos touch com alternativas equivalentes via UI (botões explícitos) e feedback háptico opcional.
- Timer de sessão com avisos acessíveis e possibilidade de extensão.

## 3. Compreensível
- Rotulagem clara em inputs, placeholders não substituem rótulos.
- Mensagens de erro específicas, com instruções de correção e referência a campos via `aria-describedby`.
- Formulários longos quebrados em etapas, com indicadores de progresso.
- Terminologia consistente, linguagem inclusiva, apoio a glossário para termos técnicos.
- Conteúdo adaptado para leitura fácil em português brasileiro; suporte a leitura em voz alta.

## 4. Robusto
- Compatibilidade com leitores de tela (NVDA, VoiceOver, TalkBack). Testar ARIA roles (ex.: `aria-live` para alertas de agenda).
- Uso de componentes interoperáveis (`button`, `input`, `select`) com atributos ARIA somente quando necessário.
- Validação semântica e Tree-sitter/axe-core integrados no pipeline de build/testes.
- Inputs compatíveis com `voice input` (`x-webkit-speech`, Web Speech API).

## 5. Testes e Monitoramento
- Revisão contínua com axe DevTools, Lighthouse, tests automáticos (Playwright + @axe-core/playwright).
- Testes manuais em navegadores desktop, mobile, leitores de tela e dispositivos assistivos.
- Checklist revisado a cada release; registrar pendências e planos de mitigação.


