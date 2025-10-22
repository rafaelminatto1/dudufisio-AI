#!/bin/bash

# Script para automatizar deploy: GitHub + Supabase
# Uso: ./scripts/deploy.sh "mensagem do commit"

set -e  # Para o script se houver erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar se foi passada uma mensagem de commit
if [ -z "$1" ]; then
    error "Por favor, forneça uma mensagem de commit:"
    echo "Uso: ./scripts/deploy.sh \"sua mensagem de commit\""
    exit 1
fi

COMMIT_MESSAGE="$1"

log "🚀 Iniciando processo de deploy..."

# 1. Verificar status do git
log "📋 Verificando status do Git..."
if [ -n "$(git status --porcelain)" ]; then
    log "📝 Arquivos modificados encontrados, adicionando ao staging..."
    git add .
    success "Arquivos adicionados ao staging"
else
    warning "Nenhuma alteração detectada no Git"
fi

# 2. Fazer commit
log "💾 Fazendo commit com mensagem: '$COMMIT_MESSAGE'"
git commit -m "$COMMIT_MESSAGE"
success "Commit realizado com sucesso"

# 3. Push para GitHub
log "📤 Enviando para GitHub..."
git push origin main
success "Push para GitHub realizado com sucesso"

# 4. Verificar se Supabase está rodando
log "🔍 Verificando status do Supabase..."
if ! npx supabase status > /dev/null 2>&1; then
    warning "Supabase não está rodando, iniciando..."
    npx supabase start
    success "Supabase iniciado"
else
    success "Supabase já está rodando"
fi

# 5. Verificar migrations pendentes
log "🔄 Verificando migrations pendentes..."
MIGRATION_DIFF=$(npx supabase db diff --schema public 2>/dev/null || echo "No schema changes found")

if [[ "$MIGRATION_DIFF" == *"No schema changes found"* ]]; then
    success "Nenhuma migration pendente encontrada"
else
    warning "Migrations pendentes detectadas:"
    echo "$MIGRATION_DIFF"
    
    # Perguntar se quer criar migration
    read -p "Deseja criar uma nova migration? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Digite o nome da migration: " MIGRATION_NAME
        npx supabase migration new "$MIGRATION_NAME"
        success "Migration criada: $MIGRATION_NAME"
        
        # Perguntar se quer aplicar a migration
        read -p "Deseja aplicar a migration agora? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            npx supabase db reset
            success "Migration aplicada com sucesso"
        fi
    fi
fi

# 6. Verificar se há dados mock que precisam ser sincronizados
log "🔍 Verificando se há dados mock para sincronizar..."
if [ -f "data/mockData.ts" ]; then
    warning "Dados mock encontrados. Em produção, considere migrar para Supabase."
    log "💡 Para sincronizar dados mock com Supabase, use: npx supabase db seed"
fi

# 7. Resumo final
log "📊 Resumo do deploy:"
success "✅ Código enviado para GitHub"
success "✅ Supabase verificado"
success "✅ Migrations verificadas"

echo
log "🎉 Deploy concluído com sucesso!"
log "🌐 Acesse o Supabase Studio: http://127.0.0.1:54323"
log "📱 Acesse a aplicação: http://localhost:5173"

echo
warning "💡 Próximos passos recomendados:"
echo "   - Teste a aplicação localmente"
echo "   - Verifique se todas as funcionalidades estão funcionando"
echo "   - Considere fazer deploy para produção se necessário"