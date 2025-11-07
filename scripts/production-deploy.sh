#!/bin/bash
# ============================================================================
# Production Deploy Script - ULTRA SEGURO
# Criado: 06/11/2025
# ============================================================================

set -e

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║      🔴 PRODUCTION DEPLOY - dudufisio-AI 🔴              ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Confirmation
echo -e "${RED}⚠️  WARNING: You are about to deploy to PRODUCTION!${NC}"
echo ""
read -p "Are you absolutely sure? Type 'YES' to continue: " CONFIRM

if [ "$CONFIRM" != "YES" ]; then
  echo "Deployment cancelled."
  exit 1
fi

# 1. Run full test suite
echo ""
echo "🧪 Step 1/10: Running full test suite..."
npm run test:ci || {
  echo -e "${RED}❌ Tests failed! Cannot deploy to production.${NC}"
  exit 1
}
echo -e "${GREEN}✅ All tests passed!${NC}"

# 2. Run linter
echo ""
echo "🔍 Step 2/10: Running linter..."
npm run lint || {
  echo -e "${RED}❌ Linter errors! Fix them before deploying.${NC}"
  exit 1
}
echo -e "${GREEN}✅ No linter errors!${NC}"

# 3. Type check
echo ""
echo "📝 Step 3/10: Type checking..."
npm run type-check || {
  echo -e "${RED}❌ Type errors! Fix them before deploying.${NC}"
  exit 1
}
echo -e "${GREEN}✅ No type errors!${NC}"

# 4. Build
echo ""
echo "🔨 Step 4/10: Building for production..."
npm run build || {
  echo -e "${RED}❌ Build failed!${NC}"
  exit 1
}
echo -e "${GREEN}✅ Build successful!${NC}"

# 5. Bundle size check
echo ""
echo "📦 Step 5/10: Checking bundle size..."
npm run build:check || {
  echo -e "${YELLOW}⚠️  Bundle size warning! Review before proceeding.${NC}"
  read -p "Continue? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
}
echo -e "${GREEN}✅ Bundle size OK!${NC}"

# 6. Database backup
echo ""
echo "💾 Step 6/10: Creating database backup..."
echo "  Please create a backup in Supabase Dashboard manually."
read -p "Backup created? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${RED}Please create backup before proceeding!${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Backup confirmed!${NC}"

# 7. Apply migrations
echo ""
echo "🗄️  Step 7/10: Applying database migrations..."
echo "  Check migrations in Supabase Dashboard"
read -p "Migrations applied successfully? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${RED}Apply migrations before deploying!${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Migrations applied!${NC}"

# 8. Deploy to production
echo ""
echo "🚀 Step 8/10: Deploying to Vercel production..."
vercel --prod --yes || {
  echo -e "${RED}❌ Deployment failed!${NC}"
  exit 1
}

DEPLOYMENT_URL=$(vercel ls --prod | head -n 1 | awk '{print $2}')
echo -e "${GREEN}✅ Deployed to: $DEPLOYMENT_URL${NC}"

# 9. Smoke tests
echo ""
echo "🔥 Step 9/10: Running production smoke tests..."
echo "  Waiting for DNS propagation..."
sleep 30

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" $DEPLOYMENT_URL)

if [ "$HTTP_CODE" -eq "200" ]; then
  echo -e "${GREEN}✅ Production is live!${NC}"
else
  echo -e "${RED}❌ Production not responding! (HTTP $HTTP_CODE)${NC}"
  echo -e "${YELLOW}Consider rolling back!${NC}"
  exit 1
fi

# 10. Final checks
echo ""
echo "✅ Step 10/10: Final verification..."
echo ""
echo "Please verify manually:"
echo "  1. Open: $DEPLOYMENT_URL"
echo "  2. Test login"
echo "  3. Test critical features"
echo "  4. Check Sentry for errors"
echo "  5. Monitor for 1 hour"
echo ""

read -p "Everything working correctly? (y/n) " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${YELLOW}⚠️  Consider rolling back if issues persist!${NC}"
  exit 1
fi

# Success!
echo ""
echo "══════════════════════════════════════════════════════════════"
echo "           🎉 PRODUCTION DEPLOYMENT SUCCESSFUL! 🎉"
echo "══════════════════════════════════════════════════════════════"
echo ""
echo "🌐 Production URL: $DEPLOYMENT_URL"
echo "📊 Dashboard: https://vercel.com/dashboard"
echo "🗄️  Database: https://supabase.com/dashboard"
echo ""
echo "Monitor closely for the next 24 hours!"
echo ""
echo "══════════════════════════════════════════════════════════════"

