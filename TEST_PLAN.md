# Microfrontends - Plano de Testes

## Testes Locais

### 1. Verificar Estrutura
- [x] Diretórios packages/ criados
- [x] Shared/ com tipos e componentes
- [x] Cada package tem package.json
- [x] Cada package tem tsconfig.json
- [x] Cada package tem vite.config.ts

### 2. Teste de Build Individual

```bash
# Testar build de cada package separadamente
cd packages/host
npm install
npm run build

cd ../agenda-pacientes
npm install
npm run build

cd ../tratamentos
npm install
npm run build

cd ../financeiro
npm install
npm run build
```

### 3. Teste de Desenvolvimento Local

Iniciar todos os servidores simultaneamente:

**Terminal 1:**
```bash
cd packages/host
npm run dev
```
Deve iniciar em http://localhost:5173

**Terminal 2:**
```bash
cd packages/agenda-pacientes
npm run dev
```
Deve iniciar em http://localhost:5174

**Terminal 3:**
```bash
cd packages/tratamentos
npm run dev
```
Deve iniciar em http://localhost:5175

**Terminal 4:**
```bash
cd packages/financeiro
npm run dev
```
Deve iniciar em http://localhost:5176

### 4. Verificações de Funcionamento

#### Host (5173)
- [ ] Carrega sem erros no console
- [ ] Mostra tela de login
- [ ] Não há erros de Module Federation

#### Remotes Individuais
- [ ] Agenda-Pacientes (5174) carrega standalone
- [ ] Tratamentos (5175) carrega standalone  
- [ ] Financeiro (5176) carrega standalone

#### Integração
- [ ] Host consegue carregar remotes via federation
- [ ] Navegação entre rotas funciona
- [ ] Não há erros de CORS
- [ ] Hot Module Replacement (HMR) funciona

## Testes de Deploy

### 1. Deploy de Cada Package

```bash
# Fazer deploy de cada microfrontend
vercel --cwd packages/host --prod
vercel --cwd packages/agenda-pacientes --prod
vercel --cwd packages/tratamentos --prod
vercel --cwd packages/financeiro --prod
```

### 2. Configurar Environment Variables

No Vercel Dashboard do HOST, adicionar:
- VITE_AGENDA_PACIENTES_URL
- VITE_TRATAMENTOS_URL
- VITE_FINANCEIRO_URL

### 3. Validações em Produção

- [ ] Cada remote tem URL válida
- [ ] Host consegue carregar remotes de produção
- [ ] CORS headers estão configurados
- [ ] Assets (JS/CSS) carregam corretamente
- [ ] Performance está adequada

## Métricas de Sucesso

### Build Times
- Build individual < 2 min cada
- Build paralelo total < 3 min
- vs. Build monolítico anterior > 8 min

### Bundle Sizes
- Host: < 200kb gzipped
- Cada remote: < 300kb gzipped
- Total first load: < 400kb

### Performance
- First Contentful Paint < 1.5s
- Time to Interactive < 3s
- Lighthouse Score > 90

## Problemas Comuns e Soluções

### Problema: Remote não carrega
**Solução:** Verificar se o remote está rodando na porta correta

### Problema: Erro de CORS
**Solução:** Adicionar headers no vercel.json do remote

### Problema: Build falha
**Solução:** npm install em cada package individualmente

### Problema: Types não encontrados
**Solução:** Adicionar declarations em vite-env.d.ts

