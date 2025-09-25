# 🚀 Guia de Deploy - Sistema de Prontuário Eletrônico Médico

## 📋 Visão Geral

Este guia fornece instruções completas para implantar o Sistema de Prontuário Eletrônico Médico em diferentes ambientes, incluindo desenvolvimento, homologação e produção.

## 🏗️ Arquitetura do Sistema

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React/TS)    │◄──►│   (Supabase)    │◄──►│   (PostgreSQL)  │
│   shadcn/ui     │    │   Auth + API    │    │   + RLS         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CDN/Static    │    │   Edge Functions│    │   File Storage  │
│   (Vercel)      │    │   (Supabase)    │    │   (Supabase)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 Pré-requisitos

### Software Necessário
- **Node.js**: v18.0.0 ou superior
- **npm**: v9.0.0 ou superior
- **Git**: v2.30.0 ou superior
- **Docker**: v20.0.0 ou superior (opcional)

### Contas de Serviço
- **Supabase**: Conta ativa com projeto criado
- **Vercel**: Conta para deploy do frontend
- **GitHub**: Repositório para versionamento

## 🚀 Deploy Passo a Passo

### 1. Configuração do Ambiente

#### 1.1 Clone do Repositório
```bash
git clone https://github.com/rafaelminatto1/dudufisio-AI.git
cd dudufisio-AI
```

#### 1.2 Instalação de Dependências
```bash
npm install
```

#### 1.3 Configuração de Variáveis de Ambiente
```bash
cp .env.example .env.local
```

Edite o arquivo `.env.local`:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="Sistema de Prontuário Eletrônico"

# Security
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Digital Signature (ICP-Brasil)
DIGITAL_CERTIFICATE_PATH=/path/to/certificate.p12
DIGITAL_CERTIFICATE_PASSWORD=your_certificate_password

# Compliance
CFM_API_KEY=your_cfm_api_key
COFFITO_API_KEY=your_coffito_api_key
```

### 2. Configuração do Supabase

#### 2.1 Criação do Projeto
1. Acesse [Supabase Dashboard](https://app.supabase.com)
2. Clique em "New Project"
3. Configure:
   - **Name**: `dudufisio-medical-records`
   - **Database Password**: Senha forte
   - **Region**: Escolha a região mais próxima

#### 2.2 Aplicação das Migrações
```bash
# Instalar Supabase CLI
npm install -g supabase

# Login no Supabase
supabase login

# Link do projeto
supabase link --project-ref your_project_ref

# Aplicar migrações
supabase db push
```

#### 2.3 Configuração de RLS (Row Level Security)
As políticas RLS já estão incluídas nas migrações. Verifique se estão ativas:

```sql
-- Verificar políticas ativas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public';
```

#### 2.4 Configuração de Storage
```sql
-- Criar bucket para documentos
INSERT INTO storage.buckets (id, name, public)
VALUES ('medical-documents', 'medical-documents', false);

-- Política de acesso para documentos
CREATE POLICY "Users can upload medical documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'medical-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### 3. Deploy do Frontend (Vercel)

#### 3.1 Configuração do Vercel
1. Acesse [Vercel Dashboard](https://vercel.com)
2. Clique em "Import Project"
3. Conecte com o repositório GitHub
4. Configure as variáveis de ambiente

#### 3.2 Variáveis de Ambiente no Vercel
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-domain.vercel.app
```

#### 3.3 Deploy Automático
O Vercel fará deploy automático a cada push para a branch `main`.

### 4. Configuração de Produção

#### 4.1 Configuração de Domínio Personalizado
1. No Vercel Dashboard, vá para Settings > Domains
2. Adicione seu domínio personalizado
3. Configure os registros DNS conforme instruções

#### 4.2 Configuração de SSL
O Vercel fornece SSL automático para todos os domínios.

#### 4.3 Configuração de CDN
O Vercel inclui CDN global automaticamente.

### 5. Configuração de Monitoramento

#### 5.1 Sentry (Opcional)
```bash
npm install @sentry/nextjs
```

Configure no `sentry.client.config.js`:
```javascript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "your_sentry_dsn",
  tracesSampleRate: 1.0,
});
```

#### 5.2 Logs do Supabase
Monitore logs no Supabase Dashboard > Logs.

### 6. Configuração de Backup

#### 6.1 Backup do Banco de Dados
```bash
# Backup automático via Supabase
# Configurar no Dashboard > Settings > Database > Backups
```

#### 6.2 Backup de Arquivos
```bash
# Backup do storage via Supabase CLI
supabase storage download medical-documents --local ./backups
```

## 🔒 Configuração de Segurança

### 1. Configuração de CORS
```sql
-- Configurar CORS no Supabase
UPDATE auth.config
SET site_url = 'https://your-domain.vercel.app',
    additional_redirect_urls = '["https://your-domain.vercel.app/**"]';
```

### 2. Configuração de Rate Limiting
```javascript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Implementar rate limiting
  const rateLimit = new Map();
  const ip = request.ip ?? '127.0.0.1';
  const limit = 100; // requests per minute
  const windowMs = 60 * 1000; // 1 minute

  if (rateLimit.has(ip)) {
    const { count, resetTime } = rateLimit.get(ip);
    if (Date.now() < resetTime) {
      if (count >= limit) {
        return new NextResponse('Too Many Requests', { status: 429 });
      }
      rateLimit.set(ip, { count: count + 1, resetTime });
    } else {
      rateLimit.set(ip, { count: 1, resetTime: Date.now() + windowMs });
    }
  } else {
    rateLimit.set(ip, { count: 1, resetTime: Date.now() + windowMs });
  }

  return NextResponse.next();
}
```

### 3. Configuração de Headers de Segurança
```javascript
// next.config.js
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};
```

## 📊 Monitoramento e Métricas

### 1. Métricas de Performance
- **Core Web Vitals**: Monitorados automaticamente pelo Vercel
- **Lighthouse Score**: Disponível no Vercel Dashboard
- **Bundle Size**: Analisado a cada build

### 2. Métricas de Negócio
- **Documentos criados**: Via Supabase Analytics
- **Usuários ativos**: Via Supabase Auth
- **Tempo de resposta**: Via Vercel Analytics

### 3. Alertas
Configure alertas para:
- Uptime < 99.9%
- Tempo de resposta > 2s
- Erros > 1%
- Uso de memória > 80%

## 🧪 Testes em Produção

### 1. Testes de Smoke
```bash
# Testar endpoints críticos
curl -X GET https://your-domain.vercel.app/api/health
curl -X GET https://your-domain.vercel.app/api/medical-records/templates
```

### 2. Testes de Carga
```bash
# Usar ferramentas como Artillery ou k6
npm install -g artillery
artillery quick --count 100 --num 10 https://your-domain.vercel.app
```

### 3. Testes de Segurança
```bash
# Usar ferramentas como OWASP ZAP
npm install -g @zaproxy/zap-cli
zap-baseline.py -t https://your-domain.vercel.app
```

## 🔄 CI/CD Pipeline

### 1. GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run test
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

### 2. Deploy Automático
- **Desenvolvimento**: Deploy automático na branch `develop`
- **Homologação**: Deploy automático na branch `staging`
- **Produção**: Deploy automático na branch `main`

## 🚨 Troubleshooting

### 1. Problemas Comuns

#### Erro de Conexão com Supabase
```bash
# Verificar variáveis de ambiente
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Testar conexão
curl -X GET "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY"
```

#### Erro de RLS
```sql
-- Verificar políticas
SELECT * FROM pg_policies WHERE tablename = 'clinical_documents';

-- Testar acesso
SELECT * FROM clinical_documents LIMIT 1;
```

#### Erro de Build
```bash
# Limpar cache
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

### 2. Logs e Debugging
```bash
# Logs do Vercel
vercel logs

# Logs do Supabase
supabase logs

# Debug local
DEBUG=* npm run dev
```

## 📈 Otimização de Performance

### 1. Frontend
- **Code Splitting**: Implementado automaticamente pelo Next.js
- **Image Optimization**: Usar `next/image`
- **Bundle Analysis**: `npm run analyze`

### 2. Backend
- **Connection Pooling**: Configurado no Supabase
- **Query Optimization**: Usar índices apropriados
- **Caching**: Implementar Redis se necessário

### 3. Database
- **Índices**: Criados nas migrações
- **RLS**: Otimizado para performance
- **Backup**: Automático via Supabase

## 🔐 Compliance e Auditoria

### 1. LGPD
- **Consentimento**: Implementado nos formulários
- **Direito ao Esquecimento**: Implementado via RLS
- **Portabilidade**: Exportação FHIR

### 2. CFM/COFFITO
- **Validação**: Implementada nos validadores
- **Assinatura Digital**: ICP-Brasil
- **Auditoria**: Log completo de ações

### 3. Auditoria
```sql
-- Verificar logs de auditoria
SELECT * FROM audit_trail 
WHERE created_at >= NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

## 📞 Suporte

### 1. Documentação
- **API Docs**: `/api/docs`
- **Component Docs**: Storybook
- **Database Schema**: Supabase Dashboard

### 2. Contato
- **Email**: suporte@dudufisio.com
- **GitHub Issues**: Para bugs e features
- **Slack**: Canal #medical-records

### 3. SLA
- **Uptime**: 99.9%
- **Response Time**: < 2s
- **Support Response**: < 4h

---

## 🎉 Conclusão

O Sistema de Prontuário Eletrônico Médico está agora completamente implantado e configurado para produção. Siga este guia para manter o sistema atualizado e seguro.

**Próximos Passos:**
1. Configurar monitoramento contínuo
2. Implementar backups automáticos
3. Treinar equipe de suporte
4. Documentar procedimentos operacionais

**Recursos Adicionais:**
- [Documentação do Supabase](https://supabase.com/docs)
- [Documentação do Vercel](https://vercel.com/docs)
- [Documentação do Next.js](https://nextjs.org/docs)
- [Guia de Compliance LGPD](https://www.gov.br/cidadania/pt-br/acesso-a-informacao/lgpd)
