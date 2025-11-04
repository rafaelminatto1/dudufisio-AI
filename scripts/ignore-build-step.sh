#!/bin/bash

# 🚀 INTELLIGENT BUILD SKIP SCRIPT
# Determina se o build deve ser pulado baseado em mudanças

echo "🔍 Verificando se o build deve ser executado..."

# Verificar se é um deploy de produção forçado
if [[ "$VERCEL_ENV" == "production" && "$FORCE_BUILD" == "true" ]]; then
  echo "🚀 Build forçado para produção"
  exit 1
fi

# Verificar mudanças apenas em documentação
CHANGED_FILES=$(git diff --name-only HEAD^ HEAD)

# Arquivos que não requerem rebuild
DOCS_ONLY_PATTERN="^(README\.md|\.md|docs/|\.github/|LICENSE|\.gitignore)$"

# Verificar se todas as mudanças são apenas documentação
NEEDS_BUILD=false

while IFS= read -r file; do
  if [[ ! "$file" =~ $DOCS_ONLY_PATTERN ]]; then
    NEEDS_BUILD=true
    break
  fi
done <<< "$CHANGED_FILES"

if [[ "$NEEDS_BUILD" == "false" && -n "$CHANGED_FILES" ]]; then
  echo "📚 Apenas documentação alterada - pulando build"
  exit 0
else
  echo "🔨 Mudanças de código detectadas - executando build"
  exit 1
fi