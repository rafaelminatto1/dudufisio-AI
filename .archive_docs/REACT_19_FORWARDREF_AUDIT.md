# React 19 forwardRef Migration Audit

## Status Atual
- **Total de componentes usando forwardRef**: 63 ocorrências
- **Data da auditoria**: 2025-10-05

## Componentes UI com forwardRef

Todos os componentes abaixo estão localizados em `components/ui/` e usam `React.forwardRef`:

### Lista de Arquivos (19 componentes)
1. `alert.tsx`
2. `avatar.tsx`
3. `button.tsx`
4. `card.tsx`
5. `command.tsx`
6. `dialog.tsx`
7. `form.tsx`
8. `input.tsx`
9. `label.tsx`
10. `popover.tsx`
11. `scroll-area.tsx`
12. `select.tsx`
13. `separator.tsx`
14. `slider.tsx`
15. `switch.tsx`
16. `table.tsx`
17. `tabs.tsx`
18. `textarea.tsx`
19. `toast.tsx`
20. `tooltip.tsx`

## O que muda no React 19?

### Antes (React 18 e anteriores):
```tsx
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => {
    return <button ref={ref} className={className} {...props} />;
  }
);
```

### Depois (React 19):
```tsx
const Button = ({ className, ref, ...props }: ButtonProps & { ref?: Ref<HTMLButtonElement> }) => {
  return <button ref={ref} className={className} {...props} />;
};
```

## Padrão de Migração

### Passo 1: Adicionar ref aos props da interface
```tsx
// Antes
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline';
}

// Depois
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline';
  ref?: React.Ref<HTMLButtonElement>;
}
```

### Passo 2: Remover React.forwardRef
```tsx
// Antes
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return <button ref={ref} className={cn(buttonVariants({ variant }), className)} {...props} />;
  }
);

// Depois
const Button = ({ className, variant = 'default', ref, ...props }: ButtonProps) => {
  return <button ref={ref} className={cn(buttonVariants({ variant }), className)} {...props} />;
};
```

### Passo 3: Manter displayName (opcional, mas recomendado)
```tsx
Button.displayName = 'Button';
```

## Cronograma de Migração

### Fase 1: Preparação (Atual)
- ✅ Auditoria completa dos componentes com forwardRef
- ✅ Documentação do padrão de migração
- ⏳ Aguardar lançamento estável do React 19

### Fase 2: Migração (Após React 19 GA)
1. Atualizar `package.json` para React 19
2. Executar `npm install`
3. Migrar componentes UI base primeiro
4. Testar componentes migrados
5. Migrar componentes compostos

### Fase 3: Validação
1. Executar testes automatizados
2. Verificar lint
3. Executar type-check
4. Build de produção

## Notas Importantes

### Compatibilidade
- **React 18**: forwardRef é necessário ✅
- **React 19**: forwardRef é opcional (ref é prop nativa) ✅
- **Transição**: Manter forwardRef até migração completa

### Impacto nos Componentes
- **Baixo risco**: Componentes UI base (button, input, etc)
- **Médio risco**: Componentes compostos (dialog, popover, etc)
- **Alto risco**: Componentes com lógica complexa de ref

### Benefícios da Migração
1. ✅ Código mais simples e legível
2. ✅ Melhor inferência de tipos TypeScript
3. ✅ Redução de boilerplate
4. ✅ Performance levemente melhorada

## Checklist de Migração (Quando React 19 estiver disponível)

- [ ] Atualizar React para v19
- [ ] Atualizar @types/react para v19
- [ ] Migrar componentes base (button, input, etc)
- [ ] Migrar componentes de layout (card, separator, etc)
- [ ] Migrar componentes interativos (dialog, popover, etc)
- [ ] Migrar componentes de formulário (form, select, etc)
- [ ] Migrar componentes de feedback (toast, alert, etc)
- [ ] Executar testes
- [ ] Verificar build de produção
- [ ] Deploy em staging
- [ ] Monitorar por 48h
- [ ] Deploy em produção

## Referências

- [React 19 RFC - ref as prop](https://github.com/reactjs/rfcs/pull/107)
- [GUIA_MIGRACAO_REACT_19.md](./GUIA_MIGRACAO_REACT_19.md) - Guia completo de migração
