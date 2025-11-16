# Design System – Acesso e Uso

Este documento resume como acessar e validar o Design System no projeto.

## Acesso no App Principal
- Rota: `/design-system`
- Menu: item "Design System" na Sidebar (seção Sistema)
- A página está envolvida por `ThemeProvider` (`src/contexts/ThemeContext`) para habilitar `useTheme`.

## App de Design System (Standalone)
- Dev server: `http://localhost:3001/`
- Comando: `npm run design-system:dev`
- Entrypoint: `design-system/main.tsx` (usa `design-system/contexts/ThemeContext` e `DesignSystemApp`).

## Comandos úteis
- `npm run dev` — inicia o app principal (`http://localhost:5174/`)
- `npm run design-system:dev` — inicia o app do design system (`http://localhost:3001/`)

## Observações
- O erro "useTheme must be used within a ThemeProvider" foi corrigido ao envolver a rota `/design-system` com `ThemeProvider` do app principal.
- Se cores/tipografia não refletirem, verifique `src/contexts/ThemeContext.tsx` e variáveis CSS aplicadas (pref. tema escuro claro via `document.documentElement`).