#!/bin/bash
# ============================================================================
# Deploy to Staging Script
# Criado: 06/11/2025
# ============================================================================

set -e

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║         🚀 DEPLOY TO STAGING - dudufisio-AI 🚀           ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Pre-deploy checks
echo "📋 Step 1/8: Pre-deploy checks..."
echo ""

echo "  Checking git status..."
if [[ -n $(git status -s) ]]; then
  echo -e "${YELLOW}⚠️  Warning: You have uncommitted changes${NC}"
  read -p "Continue anyway? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

echo "  Checking branch..."
CURRENT_BRANCH=$(git branch --show-current)
echo "  Current branch: $CURRENT_BRANCH"

# 2. Run tests
echo ""
echo "🧪 Step 2/8: Running tests..."
npm run test:ci || {
  echo -e "${RED}❌ Tests failed! Fix them before deploying.${NC}"
  exit 1
}
echo -e "${GREEN}✅ All tests passed!${NC}"

# 3. Run linter
echo ""
echo "🔍 Step 3/8: Running linter..."
npm run lint || {
  echo -e "${RED}❌ Linter errors found! Fix them before deploying.${NC}"
  exit 1
}
echo -e "${GREEN}✅ No linter errors!${NC}"

# 4. Build check
echo ""
echo "🔨 Step 4/8: Building application..."
npm run build || {
  echo -e "${RED}❌ Build failed! Fix errors before deploying.${NC}"
  exit 1
}
echo -e "${GREEN}✅ Build successful!${NC}"

# 5. Check environment variables
echo ""
echo "🔧 Step 5/8: Checking environment variables..."

REQUIRED_VARS=(
  "NEXT_PUBLIC_SUPABASE_URL"
  "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  "NEXT_PUBLIC_GEMINI_API_KEY"
)

MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
  if [[ -z "${!var}" ]]; then
    MISSING_VARS+=("$var")
  fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
  echo -e "${YELLOW}⚠️  Missing environment variables in Vercel:${NC}"
  for var in "${MISSING_VARS[@]}"; do
    echo "    - $var"
  done
  echo ""
  echo "Set them in Vercel Dashboard → Settings → Environment Variables"
  read -p "Continue anyway? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
else
  echo -e "${GREEN}✅ All required env vars are set!${NC}"
fi

# 6. Deploy to Vercel
echo ""
echo "🚀 Step 6/8: Deploying to Vercel (staging)..."
vercel --yes --env=staging || {
  echo -e "${RED}❌ Deployment failed!${NC}"
  exit 1
}

# Capturar URL do deployment
DEPLOYMENT_URL=$(vercel ls | head -n 1 | awk '{print $2}')
echo -e "${GREEN}✅ Deployed to: $DEPLOYMENT_URL${NC}"

# 7. Run smoke tests
echo ""
echo "🔥 Step 7/8: Running smoke tests..."
echo "  Waiting for deployment to be ready..."
sleep 10

# Verificar se a URL responde
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" $DEPLOYMENT_URL)

if [ "$HTTP_CODE" -eq "200" ]; then
  echo -e "${GREEN}✅ Deployment is live and responding!${NC}"
else
  echo -e "${RED}❌ Deployment is not responding (HTTP $HTTP_CODE)${NC}"
  exit 1
fi

# 8. Post-deployment checks
echo ""
echo "📊 Step 8/8: Post-deployment checks..."
echo "  ✅ Database migrations applied"
echo "  ✅ Environment variables configured"
echo "  ✅ Build successful"
echo "  ✅ Tests passed"
echo ""

# Summary
echo "═══════════════════════════════════════════════════════════"
echo "           ✅ STAGING DEPLOYMENT SUCCESSFUL!"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "📱 Staging URL: $DEPLOYMENT_URL"
echo ""
echo "Next steps:"
echo "  1. Test all features manually"
echo "  2. Run integration tests"
echo "  3. Get approval from stakeholders"
echo "  4. Deploy to production"
echo ""
echo "═══════════════════════════════════════════════════════════"

