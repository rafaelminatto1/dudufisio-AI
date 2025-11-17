# Guia de Depreciação do Sistema Vite

Este documento descreve o processo de depreciação segura do sistema antigo baseado em Vite após a migração completa para Next.js.

## ⚠️ Importante

**NÃO remova o sistema antigo até que:**
1. O novo sistema Next.js esteja 100% funcional em produção
2. Todos os usuários estejam usando o novo sistema
3. Período mínimo de 30 dias de transição tenha passado
4. Backup completo do sistema antigo tenha sido realizado

## 📋 Checklist Pré-Depreciação

### Verificações Técnicas

- [ ] Novo sistema em produção há pelo menos 30 dias
- [ ] Zero issues críticos reportados
- [ ] Performance igual ou superior ao sistema antigo
- [ ] Todos os módulos migrados e testados
- [ ] Usuários satisfeitos com o novo sistema

### Verificações de Dados

- [ ] Todos os dados migrados corretamente
- [ ] Script de validação executado com sucesso
- [ ] Backup completo do banco de dados
- [ ] Auditoria de integridade referencial concluída

### Verificações de Infraestrutura

- [ ] Domínio apontando para novo sistema
- [ ] SSL/TLS configurado
- [ ] Monitoramento ativo
- [ ] Logs sendo coletados

## 🔄 Processo de Transição

### Fase 1: Soft Launch (Semana 1-2)

1. **Manter sistema Vite ativo**
   - Usuários podem alternar entre sistemas
   - Botão "Testar novo sistema" visível

2. **Coletar feedback**
   - Formulário de feedback
   - Monitorar comportamento dos usuários
   - Identificar issues rapidamente

3. **Comunicação**
   - Email para todos os usuários
   - Banner no sistema antigo
   - Tutorial do novo sistema

### Fase 2: Transição Gradual (Semana 3-4)

1. **Redirecionamento soft**
   - Redirecionar novos usuários para Next.js
   - Usuários ativos podem voltar ao antigo se necessário
   - Tracking de uso de ambos sistemas

2. **Suporte intensivo**
   - Equipe de suporte disponível
   - Chat de suporte ativo
   - FAQ atualizado

### Fase 3: Migração Completa (Semana 5-8)

1. **Redirecionamento permanente**
   - Todos acessos ao sistema antigo redirecionam para Next.js
   - Banner informando sobre nova versão

2. **Monitoramento intenso**
   - Verificar logs diariamente
   - Responder issues em < 2h
   - Métricas de uso em tempo real

### Fase 4: Depreciação Final (Após 30 dias)

1. **Backup final**
   - Código completo do sistema Vite
   - Banco de dados (se houver instância separada)
   - Configurações e documentação

2. **Arquivamento**
   - Mover código para `_archived/fisioflow-vite/`
   - Documentar motivos e processo de migração
   - Manter por 6 meses antes de deletar

## 📁 Estrutura de Arquivamento

```
_archived/
└── fisioflow-vite/
    ├── README_ARCHIVE.md          # Documentação do arquivamento
    ├── code/                       # Código completo
    ├── docs/                       # Documentação original
    ├── backups/                    # Backups do banco
    └── migration-reports/          # Relatórios da migração
```

## 🗑️ Arquivos e Diretórios para Remover

### Sistema Vite (após período de transição)

```bash
# Micro-frontends
packages/host/
packages/agenda-pacientes/
packages/tratamentos/
packages/financeiro/
packages/patient-portal/

# Configurações Vite
vite.config.ts
vite.config.*.ts

# Scripts específicos
scripts/*vite*
scripts/*federation*
scripts/measure-build.cjs
scripts/post-build-optimize.cjs

# Arquivos de build
dist/
.vercel/ (do projeto antigo)
```

### Limpeza de Dependências

```bash
# Remover dependências Vite do package.json
npm uninstall vite
npm uninstall @vitejs/plugin-react
npm uninstall @originjs/vite-plugin-federation
npm uninstall rollup-plugin-visualizer
```

## 📝 Script de Arquivamento

```bash
#!/bin/bash
# archive-old-system.sh

# Criar diretório de arquivamento
mkdir -p _archived/fisioflow-vite

# Mover código antigo
mv packages _archived/fisioflow-vite/code/
mv vite.config.ts _archived/fisioflow-vite/code/

# Criar README de arquivamento
cat > _archived/fisioflow-vite/README_ARCHIVE.md << EOF
# FisioFlow Vite - Sistema Arquivado

**Data de arquivamento:** $(date)
**Motivo:** Migração completa para Next.js
**Última versão em produção:** $(git describe --tags --abbrev=0)

## Informações

Este é o código do sistema FisioFlow baseado em Vite que foi
substituído pelo novo sistema Next.js em $(date +%Y).

### Por que foi migrado?

1. Simplificação da arquitetura
2. Melhor performance
3. Manutenibilidade aprimorada
4. Stack moderna (Next.js 14+)

### Para restaurar (apenas emergência)

\`\`\`bash
git checkout tags/last-vite-version
npm install
npm run dev
\`\`\`

### Contato

Para informações sobre este arquivamento, consulte MIGRATION_GUIDE.md
EOF

# Commit do arquivamento
git add _archived/
git commit -m "Archive: Move old Vite system to _archived/"

echo "✅ Sistema antigo arquivado com sucesso"
```

## ⚡ Plano de Rollback (Emergência)

Se houver necessidade de voltar ao sistema antigo:

### Passo 1: Identificar o Problema

- Documentar issue crítico
- Avaliar impacto
- Decidir se realmente necessita rollback

### Passo 2: Comunicação

- Notificar equipe imediatamente
- Preparar comunicado para usuários
- Atualizar status page

### Passo 3: Rollback Técnico

```bash
# 1. Restaurar código antigo
git checkout tags/last-vite-version

# 2. Reinstalar dependências
npm install

# 3. Atualizar variáveis de ambiente
cp .env.vite.backup .env.local

# 4. Build e deploy
npm run build
vercel --prod

# 5. Atualizar DNS (se necessário)
```

### Passo 4: Pós-Rollback

- Investigar causa raiz
- Corrigir issue no Next.js
- Planejar nova tentativa de migração

## 📊 Métricas de Sucesso

Para considerar a depreciação bem-sucedida:

- ✅ 0 rollbacks necessários
- ✅ < 5% de reclamações de usuários
- ✅ Performance igual ou melhor
- ✅ 100% das funcionalidades migradas
- ✅ Equipe confiante no novo sistema

## 🎯 Timeline Recomendado

| Semana | Ação | Status |
|--------|------|--------|
| 1-2 | Soft launch + feedback | Planejado |
| 3-4 | Transição gradual | Planejado |
| 5-8 | Migração completa | Planejado |
| 9+ | Monitoramento estendido | Planejado |
| 12 | Arquivamento final | Planejado |

## ✅ Finalização

Após 6 meses de arquivamento sem incidentes:

```bash
# Remover completamente (após aprovação)
rm -rf _archived/fisioflow-vite/

git add -A
git commit -m "chore: Remove archived Vite system after 6 months"
git push
```

**Importante:** Manter documentação da migração permanentemente para referência futura.

