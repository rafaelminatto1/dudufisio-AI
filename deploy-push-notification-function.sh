#!/bin/bash
# Deploy Push Notification Edge Function
# MoocaFisio - Script de deploy automático

set -e

echo "🚀 Deploy Push Notification Edge Function - MoocaFisio"
echo "=================================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar se o arquivo de service account existe
SERVICE_ACCOUNT_FILE="minatto/dudufisio-3831a-firebase-adminsdk-fbsvc-18616c7651.json"

if [ ! -f "$SERVICE_ACCOUNT_FILE" ]; then
    echo -e "${RED}❌ Erro: Arquivo de service account não encontrado!${NC}"
    echo "Procurando por: $SERVICE_ACCOUNT_FILE"
    exit 1
fi

echo -e "${GREEN}✅ Service Account encontrado${NC}"
echo ""

# Ler o JSON do service account (em uma linha, sem espaços)
SERVICE_ACCOUNT_JSON=$(cat "$SERVICE_ACCOUNT_FILE" | tr -d '\n' | tr -s ' ')

echo -e "${YELLOW}📦 Passo 1: Login no Supabase${NC}"
echo "Executar: npx supabase login"
echo "Pressione ENTER para continuar depois de fazer login..."
read

echo ""
echo -e "${YELLOW}📦 Passo 2: Linkar projeto Supabase${NC}"
npx supabase link --project-ref urfxniitfbbvsaskicfo

echo ""
echo -e "${YELLOW}🔐 Passo 3: Configurar Secret do Firebase Service Account${NC}"
echo "Configurando FIREBASE_SERVICE_ACCOUNT..."

# Criar arquivo temporário com o JSON
echo "$SERVICE_ACCOUNT_JSON" > /tmp/firebase-service-account.json

# Configurar secret
npx supabase secrets set FIREBASE_SERVICE_ACCOUNT="$SERVICE_ACCOUNT_JSON"

# Remover arquivo temporário
rm /tmp/firebase-service-account.json

echo -e "${GREEN}✅ Secret configurado${NC}"

echo ""
echo -e "${YELLOW}🚀 Passo 4: Deploy da Edge Function${NC}"
npx supabase functions deploy send-push-notification

echo ""
echo -e "${GREEN}✅ Deploy concluído com sucesso!${NC}"
echo ""
echo "=================================================="
echo "🎉 Edge Function está pronta para uso!"
echo ""
echo "📝 Para testar, use:"
echo "curl -i --location --request POST 'https://urfxniitfbbvsaskicfo.supabase.co/functions/v1/send-push-notification' \\"
echo "  --header 'Authorization: Bearer YOUR_ANON_KEY' \\"
echo "  --header 'Content-Type: application/json' \\"
echo "  --data '{\"userId\":\"user-id\",\"title\":\"Teste\",\"body\":\"Funcionou!\"}'"
echo ""
echo "=================================================="
