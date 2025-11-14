# Script de Teste Automatizado - Análise de Console

Este diretório contém scripts e documentação para diagnóstico e correção de problemas no sistema MoocaFisio.

## 📋 Documentação

- **report.md**: Relatório inicial de análise dos problemas encontrados
- **IMPLEMENTATION_REPORT.md**: Relatório detalhado da implementação das correções
- **SOLUCAO_ERROS_LOCAIS.md**: ⭐ Guia completo para resolver erros ao rodar localmente

## 🧪 Script de Teste Automatizado

O script `automated-test.ts` realiza os seguintes testes:

1. ✅ Faz login automático no sistema
2. ✅ Navega por 7 páginas principais:
   - Dashboard
   - Agenda
   - Pacientes
   - Biblioteca de Exercícios
   - Protocolos
   - Configurações
3. ✅ Coleta logs do console de cada página
4. ✅ Identifica erros de:
   - Console (JavaScript errors)
   - Rede (Network errors)
   - CORS
   - Manifest.json
5. ✅ Gera relatório JSON detalhado

## 🚀 Como Executar

### Pré-requisitos

1. Certifique-se de que o servidor de desenvolvimento está rodando:
   ```bash
   npm run dev
   ```

2. O servidor deve estar acessível em `http://localhost:5173`

### Execução

**Windows (PowerShell):**
```powershell
.\minatto_gemini\run-test.ps1
```

**Linux/Mac:**
```bash
chmod +x minatto_gemini/run-test.sh
./minatto_gemini/run-test.sh
```

**Execução direta:**
```bash
npx tsx minatto_gemini/automated-test.ts
```

## 📊 Resultado

Após a execução, um arquivo JSON será gerado com o relatório completo:
```
minatto_gemini/test-report-[timestamp].json
```

O relatório contém:
- Logs do console de cada página
- Erros de JavaScript
- Erros de rede
- Estatísticas gerais
- Análise de CORS e manifest.json

## 🚀 Solução Rápida para Erros Locais

Se você está tendo problemas ao rodar o sistema localmente (erros 404, tela de login diferente, etc.):

### Diagnóstico Automático
```powershell
.\minatto_gemini\fix-local-errors.ps1
```

### Solução Manual
```bash
# Fechar todos os servidores (Ctrl + C)
# Então executar:
npm run dev
```

📖 **Guia completo**: [SOLUCAO_ERROS_LOCAIS.md](./SOLUCAO_ERROS_LOCAIS.md)

---

## 🔍 Problemas Identificados

Com base no relatório inicial (`report.md`), os seguintes problemas foram encontrados:

### 1. ❌ Erro no manifest.json (CORRIGIDO)
- **Problema**: Referências a arquivos inexistentes (`/screenshots/`, `/icons/`)
- **Solução**: Removidas referências aos diretórios e arquivos que não existem
- **Status**: ✅ Corrigido

### 2. ⚠️ Erro de CORS com adsbygoogle.js
- **Problema**: Script de publicidade bloqueado
- **Impacto**: Baixo (não afeta funcionalidade)
- **Causa**: Provável injeção por extensão do navegador
- **Ação**: Nenhuma ação necessária no código-fonte
- **Status**: ✅ Confirmado como externo

## 📈 Próximos Passos

1. ✅ Executar o script de teste após correções
2. ✅ Validar que o erro do manifest.json foi resolvido
3. ✅ Confirmar que não há novos erros de console
4. 📝 Documentar quaisquer novos problemas encontrados

## 🛠️ Melhorias Futuras

- [ ] Adicionar testes de performance (FCP, LCP, TTI)
- [ ] Incluir captura de screenshots de cada página
- [ ] Adicionar validação de acessibilidade
- [ ] Integrar com CI/CD para execução automática
- [ ] Adicionar relatório HTML visual
