# Correção: Visibilidade do botão "Entrar"

## Sintoma
- Botão ficava invisível (texto branco sobre fundo branco) e só aparecia no `:hover`.

## Causa raiz
- Classes Tailwind incorretas usando sufixo `-DEFAULT` (ex.: `bg-fisio-primary-DEFAULT`).
- No Tailwind, quando um token possui `DEFAULT`, a classe gerada é sem sufixo (ex.: `bg-fisio-primary`).
- Resultado: sem a classe válida de fundo no estado normal, o botão ficava com fundo branco e texto branco.

## Correção aplicada
- Atualizadas as variantes do componente `Button` para remover `-DEFAULT`:
  - `bg-fisio-primary-DEFAULT` → `bg-fisio-primary`
  - `bg-fisio-secondary-DEFAULT` → `bg-fisio-secondary`
  - `bg-fisio-error-DEFAULT` → `bg-fisio-error`
  - `bg-fisio-warning-DEFAULT` → `bg-fisio-warning`
  - `text-fisio-primary-DEFAULT` → `text-fisio-primary`
  - `border-fisio-primary-DEFAULT` → `border-fisio-primary`

### Arquivos impactados
- `components/ui/button.tsx`
- `shared/components/ui/button.tsx`

## Verificações de estilização
- Estados: normal, `:hover`, `:active`, `:focus-visible` com `ring-fisio-primary-500` estão visíveis e com contraste.
- Opacidade: apenas em `disabled` (`disabled:opacity-70`).
- Transições: `transition-all duration-200` preservadas; sem animações que escondam conteúdo.

## Testes recomendados
- Navegadores: Chrome, Firefox, Edge, Safari mobile.
- Dispositivos: Desktop, iOS/Android.
- Cenários:
  - Estado normal e interações (`hover`, `active`, `focus`).
  - Tema claro/escuro, se aplicável.
  - Botão desabilitado e com `asChild` (slot).

## Observação
- Existem outras ocorrências de `*-DEFAULT` em páginas/ícones/badges. Para consistência, use sempre classes sem `-DEFAULT` quando o token define `DEFAULT` no `tailwind.config.ts`.