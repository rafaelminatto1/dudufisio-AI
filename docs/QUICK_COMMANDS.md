# 🚀 Comandos Rápidos - Migração de Cores

Comandos práticos para continuar a migração do sistema de cores em todo o projeto.

## 📋 Verificar o que falta migrar

### Buscar cores antigas no projeto

```powershell
# Buscar todos os bg-blue-*
grep -r "bg-blue-" --include="*.tsx" --include="*.ts"

# Buscar todos os text-blue-*
grep -r "text-blue-" --include="*.tsx" --include="*.ts"

# Buscar todos os border-blue-*
grep -r "border-blue-" --include="*.tsx" --include="*.ts"

# Buscar todos os bg-slate-*
grep -r "bg-slate-" --include="*.tsx" --include="*.ts"

# Buscar todos os text-slate-*
grep -r "text-slate-" --include="*.tsx" --include="*.ts"

# Buscar todas as cores fisio-*
grep -r "fisio-" --include="*.tsx" --include="*.ts" --include="*.css"

# Buscar cores sky-*
grep -r "text-sky-|bg-sky-" --include="*.tsx" --include="*.ts"
```

## 🔧 Substituição em Lote (PowerShell)

### Script Completo de Migração

```powershell
# Salve este script como migrate-colors.ps1

$files = Get-ChildItem -Path . -Include *.tsx,*.ts,*.css -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Cores primárias (azul)
    $content = $content -replace 'bg-blue-50\b', 'bg-primary/10'
    $content = $content -replace 'bg-blue-100\b', 'bg-primary-100'
    $content = $content -replace 'text-blue-700\b', 'text-primary'
    $content = $content -replace 'text-blue-600\b', 'text-primary'
    $content = $content -replace 'border-blue-200\b', 'border-primary/20'
    $content = $content -replace 'border-blue-300\b', 'border-primary'
    $content = $content -replace 'bg-sky-500\b', 'bg-primary'
    $content = $content -replace 'text-sky-500\b', 'text-primary'
    
    # Cinzas (slate para gray)
    $content = $content -replace 'bg-slate-', 'bg-gray-'
    $content = $content -replace 'text-slate-', 'text-gray-'
    $content = $content -replace 'border-slate-', 'border-gray-'
    
    # Cores antigas fisio
    $content = $content -replace 'bg-fisio-neutral-', 'bg-gray-'
    $content = $content -replace 'text-fisio-neutral-', 'text-gray-'
    $content = $content -replace 'border-fisio-neutral-', 'border-gray-'
    $content = $content -replace 'bg-fisio-primary-DEFAULT', 'bg-primary'
    $content = $content -replace 'text-fisio-primary-', 'text-primary-'
    $content = $content -replace 'bg-fisio-error', 'bg-error'
    $content = $content -replace 'text-fisio-success', 'text-success'
    
    # Status (verde para success, vermelho para error)
    $content = $content -replace 'text-green-600\b', 'text-success'
    $content = $content -replace 'bg-green-50\b', 'bg-success/10'
    $content = $content -replace 'text-red-600\b', 'text-error'
    $content = $content -replace 'bg-red-50\b', 'bg-error/10'
    $content = $content -replace 'text-yellow-600\b', 'text-warning'
    $content = $content -replace 'bg-yellow-50\b', 'bg-warning/10'
    
    Set-Content -Path $file.FullName -Value $content
}

Write-Host "Migração concluída!" -ForegroundColor Green
```

**Executar:**
```powershell
.\migrate-colors.ps1
```

## 🐧 Substituição em Lote (Bash/Linux/Mac)

```bash
#!/bin/bash
# Salve como migrate-colors.sh e execute: chmod +x migrate-colors.sh && ./migrate-colors.sh

# Cores primárias
find . -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.css" \) -exec sed -i '' \
    -e 's/\bbg-blue-50\b/bg-primary\/10/g' \
    -e 's/\bbg-blue-100\b/bg-primary-100/g' \
    -e 's/\btext-blue-700\b/text-primary/g' \
    -e 's/\btext-blue-600\b/text-primary/g' \
    -e 's/\bborder-blue-200\b/border-primary\/20/g' \
    -e 's/\bborder-blue-300\b/border-primary/g' \
    -e 's/\bbg-sky-500\b/bg-primary/g' \
    -e 's/\btext-sky-500\b/text-primary/g' \
    -e 's/bg-slate-/bg-gray-/g' \
    -e 's/text-slate-/text-gray-/g' \
    -e 's/border-slate-/border-gray-/g' \
    -e 's/bg-fisio-neutral-/bg-gray-/g' \
    -e 's/text-fisio-neutral-/text-gray-/g' \
    -e 's/border-fisio-neutral-/border-gray-/g' \
    -e 's/bg-fisio-primary-DEFAULT/bg-primary/g' \
    -e 's/\btext-green-600\b/text-success/g' \
    -e 's/\bbg-green-50\b/bg-success\/10/g' \
    -e 's/\btext-red-600\b/text-error/g' \
    -e 's/\bbg-red-50\b/bg-error\/10/g' \
    {} \;

echo "✅ Migração concluída!"
```

## 🔍 Verificar Progresso

### Contar quantas cores antigas restam

```powershell
# Contar bg-blue-*
(Select-String -Path .\**\*.tsx,.\**\*.ts -Pattern "bg-blue-").Count

# Contar text-slate-*
(Select-String -Path .\**\*.tsx,.\**\*.ts -Pattern "text-slate-").Count

# Contar fisio-*
(Select-String -Path .\**\*.tsx,.\**\*.ts,.\**\*.css -Pattern "fisio-").Count
```

### Listar arquivos que ainda precisam ser migrados

```powershell
# Arquivos com bg-blue-*
Select-String -Path .\**\*.tsx,.\**\*.ts -Pattern "bg-blue-" | 
    Select-Object -ExpandProperty Path -Unique

# Arquivos com fisio-*
Select-String -Path .\**\*.tsx,.\**\*.ts,.\**\*.css -Pattern "fisio-" | 
    Select-Object -ExpandProperty Path -Unique
```

## 🎯 Migração Seletiva (Apenas diretório específico)

### Migrar apenas pages/

```powershell
Get-ChildItem -Path .\pages -Include *.tsx,*.ts -Recurse | ForEach-Object {
    # ... usar o script de substituição acima
}
```

### Migrar apenas components/

```powershell
Get-ChildItem -Path .\components -Include *.tsx,*.ts -Recurse | ForEach-Object {
    # ... usar o script de substituição acima
}
```

## ✅ Validação Após Migração

### 1. Verificar se não há erros de TypeScript

```bash
npm run type-check
# ou
npx tsc --noEmit
```

### 2. Verificar erros de linter

```bash
npm run lint
# ou
npx eslint . --ext .ts,.tsx
```

### 3. Testar build

```bash
npm run build
```

### 4. Rodar aplicação

```bash
npm run dev
```

## 📊 Estatísticas

### Ver quantas substituições foram feitas

```powershell
# Antes da migração, salve estatísticas
$before = @{
    "bg-blue" = (Select-String -Path .\**\*.tsx,.\**\*.ts -Pattern "bg-blue-").Count
    "text-slate" = (Select-String -Path .\**\*.tsx,.\**\*.ts -Pattern "text-slate-").Count
    "fisio" = (Select-String -Path .\**\*.tsx,.\**\*.ts,.\**\*.css -Pattern "fisio-").Count
}

# Depois da migração
$after = @{
    "bg-blue" = (Select-String -Path .\**\*.tsx,.\**\*.ts -Pattern "bg-blue-").Count
    "text-slate" = (Select-String -Path .\**\*.tsx,.\**\*.ts -Pattern "text-slate-").Count
    "fisio" = (Select-String -Path .\**\*.tsx,.\**\*.ts,.\**\*.css -Pattern "fisio-").Count
}

# Calcular diferença
$before.GetEnumerator() | ForEach-Object {
    $pattern = $_.Key
    $beforeCount = $_.Value
    $afterCount = $after[$pattern]
    $diff = $beforeCount - $afterCount
    Write-Host "$pattern: $beforeCount -> $afterCount (migrado: $diff)" -ForegroundColor Cyan
}
```

## 🔄 Reverter Mudanças (Git)

Se algo der errado:

```bash
# Ver arquivos modificados
git status

# Ver mudanças em arquivo específico
git diff pages/DashboardPage.tsx

# Reverter arquivo específico
git checkout -- pages/DashboardPage.tsx

# Reverter todos os arquivos
git reset --hard HEAD
```

## 📝 Criar Branch para Migração

```bash
# Criar branch
git checkout -b feature/color-system-migration

# Fazer mudanças
# ... executar scripts de migração ...

# Comitar mudanças
git add .
git commit -m "feat: migrate to new color system

- Replace bg-blue-* with bg-primary*
- Replace text-slate-* with text-gray-*
- Replace fisio-* colors with new system
- Update all components to use new palette

Refs: docs/COLOR_SYSTEM.md"

# Push para remote
git push origin feature/color-system-migration
```

## 🎨 Testar Visualmente

### Páginas para verificar após migração

1. **Dashboard** (`http://localhost:5173/dashboard`)
   - KPI cards devem ter ícones em `bg-primary/10`
   - Bordas em `border-gray-100`
   - Sem cores vibrantes aleatórias

2. **Lista de Pacientes** (`/patients`)
   - Background em `bg-secondary-50`
   - Cards com design limpo

3. **Menu Lateral**
   - Item ativo em `bg-primary/10 text-primary`
   - Items normais em cinza
   - Logo "MoocaFisio"

4. **Agenda** (`/agenda`)
   - Verificar se cores de status estão corretas

## 🚨 Casos Especiais

### Cores em JSON/Config

Se houver cores em arquivos JSON:

```powershell
Get-ChildItem -Path . -Include *.json -Recurse | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $content = $content -replace '"#007BFF"', '"#5B4FE8"'
    $content = $content -replace '"blue-500"', '"primary"'
    Set-Content -Path $_.FullName -Value $content
}
```

### Cores inline/hardcoded

Buscar hex codes hardcoded:

```powershell
Select-String -Path .\**\*.tsx,.\**\*.ts -Pattern "#[0-9A-Fa-f]{6}"
```

Substituir por classes Tailwind apropriadas.

## 📚 Referências Rápidas

- Sistema de Cores: `docs/COLOR_SYSTEM.md`
- Guia de Migração: `docs/MIGRATION_GUIDE.md`
- Acessibilidade: `docs/ACCESSIBILITY_REPORT.md`
- Resumo: `docs/REDESIGN_SUMMARY.md`

---

**Dica:** Execute os comandos em um branch separado primeiro para testar!











