#!/bin/bash

# Script para ignorar builds desnecessários no Vercel
# Uso: ignore-build-step.sh <nome-do-package>

PACKAGE_NAME=$1

echo "🔍 Checking for changes in packages/$PACKAGE_NAME..."

# Verifica se houve mudanças no package específico comparando com o commit anterior
git diff HEAD^ HEAD --quiet packages/$PACKAGE_NAME/

# Exit code 0 = sem mudanças, Exit code 1 = há mudanças
if [ $? -eq 0 ]; then
  echo "🚫 No changes detected in packages/$PACKAGE_NAME"
  echo "⏭️  Skipping build to save time and resources"
  exit 0  # Exit 0 = Vercel IGNORA o build
else
  echo "✅ Changes detected in packages/$PACKAGE_NAME"
  echo "🏗️  Proceeding with build..."
  exit 1  # Exit 1 = Vercel PROCEDE com o build
fi

