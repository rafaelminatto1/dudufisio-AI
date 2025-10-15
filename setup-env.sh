#!/bin/bash
# Script para configurar variáveis de ambiente do Supabase

echo "🔧 Configurando Supabase..."

# Criar .env.local
cat > .env.local << 'EOF'
# Supabase Configuration
VITE_SUPABASE_URL=https://urfxniitfbbvsaskicfo.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZnhuaWl0ZmJidnNhc2tpY2ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzMDU0NDcsImV4cCI6MjA3Mzg4MTQ0N30.1duUQHT_MjGOmMKP-b-R6A9VByGzHgj296A2UR-IXvA
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZnhuaWl0ZmJidnNhc2tpY2ZvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODMwNTQ0NywiZXhwIjoyMDczODgxNDQ3fQ.hCnWP5UjAywrkCX1hnHQviu9R3J56y2VZdLI1tKhgWg

# Project Info
# Project name: dudufisio-AI
# Project ID: urfxniitfbbvsaskicfo
EOF

# Criar .env.example
cat > .env.example << 'EOF'
# Supabase Configuration
# Get these values from https://supabase.com/dashboard/project/_/settings/api
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Gemini AI (Optional)
VITE_GEMINI_API_KEY=your_gemini_api_key

# Other configurations (add as needed)
# VITE_SENTRY_DSN=your_sentry_dsn
# VITE_ANALYTICS_ID=your_analytics_id
EOF

echo "✅ Arquivos .env.local e .env.example criados!"
echo ""
echo "⚠️  IMPORTANTE: .env.local está no .gitignore e não será commitado"

