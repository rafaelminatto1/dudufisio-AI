# Configuração do Supabase para DuduFisio-AI

## 1. Criação do Projeto no Supabase

1. Acesse [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Crie um novo projeto ou use o existente: `ahshxtmoxnkjzlblbunk`
3. Anote as seguintes informações:
   - **Project URL**: `https://ahshxtmoxnkjzlblbunk.supabase.co`
   - **Anon Key**: (encontrada em Settings > API)

## 2. Configuração do Banco de Dados

### 2.1 Executar Migrations

Execute os seguintes arquivos SQL no editor SQL do Supabase (SQL Editor):

1. **Criar tabelas principais**:
   ```sql
   -- Execute o conteúdo de: database/migrations/001_create_tables.sql
   ```

2. **Configurar Row Level Security (RLS)**:
   ```sql
   -- Execute o conteúdo de: database/migrations/002_enable_rls.sql
   ```

### 2.2 Criar Buckets de Storage

No painel Storage do Supabase, crie os seguintes buckets:

1. **avatars** - Para fotos de perfil
   - Público: Sim
   - Tamanho máximo: 5MB
   - Extensões permitidas: jpg, jpeg, png, webp

2. **documents** - Para documentos médicos
   - Público: Não
   - Tamanho máximo: 10MB
   - Extensões permitidas: pdf, doc, docx

3. **exercises** - Para vídeos e imagens de exercícios
   - Público: Sim
   - Tamanho máximo: 50MB
   - Extensões permitidas: jpg, jpeg, png, mp4, webm

## 3. Configuração da Autenticação

### 3.1 Providers

No painel Authentication > Providers:

1. **Email**: Habilitado por padrão
2. **Configurações de Email**:
   - Confirmar email: Desabilitado (para desenvolvimento)
   - Auto-confirmar usuários: Habilitado (para desenvolvimento)

### 3.2 Templates de Email

Personalize os templates em Authentication > Email Templates:

1. **Confirm signup**: Template de confirmação de cadastro
2. **Reset password**: Template de recuperação de senha
3. **Magic Link**: Template de login sem senha

## 4. Configuração do Ambiente Local

### 4.1 Arquivo .env.local

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://ahshxtmoxnkjzlblbunk.supabase.co
VITE_SUPABASE_ANON_KEY=seu_anon_key_aqui

# Gemini API (para recursos de IA)
VITE_GEMINI_API_KEY=sua_gemini_api_key_aqui

# Environment
VITE_APP_ENV=development
VITE_APP_URL=http://localhost:5173
```

### 4.2 Instalação de Dependências

```bash
npm install @supabase/supabase-js @supabase/auth-helpers-react
```

## 5. Dados de Teste (Seeds)

Execute o arquivo de seeds para popular o banco com dados de teste:

```sql
-- Execute o conteúdo de: database/seeds/development_data.sql
```

**Usuários de teste criados**:
- Admin: admin@dudufisio.com / senha123
- Fisioterapeuta: eduardo@dudufisio.com / senha123
- Recepcionista: recepcao@dudufisio.com / senha123
- Paciente: joao@email.com / senha123

## 6. Configuração de Políticas RLS

### Verificar Políticas

Para verificar se as políticas RLS estão funcionando:

1. Vá para o SQL Editor
2. Execute:
```sql
-- Verificar políticas de uma tabela
SELECT * FROM pg_policies WHERE tablename = 'patients';

-- Testar acesso como um usuário específico
SET LOCAL "request.jwt.claims" TO '{"sub":"user-id-here"}';
SELECT * FROM patients;
```

## 7. Configuração de Real-time

### Habilitar Real-time

1. Vá para Database > Replication
2. Habilite a replicação para as seguintes tabelas:
   - patients
   - appointments
   - sessions
   - notifications
   - messages

### Configurar Canais

Os canais real-time já estão configurados nos serviços:
- `patients_changes` - Mudanças em pacientes
- `appointments_changes` - Mudanças em agendamentos
- `sessions_changes` - Mudanças em sessões
- `notifications_changes` - Novas notificações

## 8. Monitoramento e Logs

### Dashboard do Supabase

1. **Database**: Monitor de queries e performance
2. **Auth**: Usuários ativos e logs de autenticação
3. **Storage**: Uso de armazenamento
4. **Logs**: Logs de aplicação e erros

### Alertas

Configure alertas em Settings > Monitoring:
- Uso de banco > 80%
- Erros de autenticação
- Queries lentas > 1s

## 9. Backup e Recuperação

### Backup Automático

O Supabase faz backup automático diário. Para backup manual:

1. Vá para Settings > Database
2. Clique em "Download backup"

### Restauração

Para restaurar um backup:
1. Settings > Database > Backups
2. Selecione o ponto de restauração
3. Clique em "Restore"

## 10. Segurança

### Checklist de Segurança

- [ ] RLS habilitado em todas as tabelas
- [ ] Políticas configuradas corretamente
- [ ] Senhas fortes para usuários admin
- [ ] API Keys não expostas no código
- [ ] CORS configurado adequadamente
- [ ] Rate limiting habilitado
- [ ] Logs de auditoria ativos

### Boas Práticas

1. **Nunca** commitar o arquivo `.env.local`
2. Use variáveis de ambiente diferentes para produção
3. Rotacione as API keys regularmente
4. Monitore logs de acesso suspeitos
5. Mantenha o Supabase atualizado

## 11. Troubleshooting

### Problemas Comuns

**Erro de autenticação**:
- Verifique se o anon key está correto
- Confirme que o usuário está ativo

**Erro de permissão (RLS)**:
- Verifique as políticas da tabela
- Confirme o role do usuário

**Real-time não funciona**:
- Verifique se a replicação está habilitada
- Confirme a conexão WebSocket

**Storage não funciona**:
- Verifique as políticas do bucket
- Confirme o tamanho e tipo do arquivo

## 12. Deploy para Produção

### Checklist de Deploy

1. [ ] Variáveis de ambiente de produção configuradas
2. [ ] RLS testado e funcionando
3. [ ] Backup configurado
4. [ ] Monitoramento ativo
5. [ ] SSL/TLS configurado
6. [ ] Domínio customizado (opcional)

### Configuração de Produção

```env
# .env.production
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_producao_anon_key
VITE_APP_ENV=production
VITE_APP_URL=https://seu-dominio.com
```

## Suporte

- Documentação: [https://supabase.com/docs](https://supabase.com/docs)
- Discord: [https://discord.supabase.com](https://discord.supabase.com)
- GitHub: [https://github.com/supabase/supabase](https://github.com/supabase/supabase)
