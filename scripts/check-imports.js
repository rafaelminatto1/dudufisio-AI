#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Verificando imports problemáticos...');

// Padrões de imports problemáticos conhecidos
const problematicPatterns = [
  {
    pattern: 'from.*\\.\\./contexts/AppContext.*patient-portal',
    description: 'Import incorreto de AppContext em patient-portal (deve ser ../../contexts)',
    fix: 'Use ../../contexts/AppContext em vez de ../contexts/AppContext'
  },
  {
    pattern: 'from.*\\.\\./contexts/AppContext.*acompanhamento',
    description: 'Import incorreto de AppContext em components/acompanhamento (deve ser ../../contexts)',
    fix: 'Use ../../contexts/AppContext em vez de ../contexts/AppContext'
  }
];

let hasErrors = false;

// Função para verificar um padrão específico
function checkPattern(pattern, description, fix) {
  try {
    const result = execSync(`grep -r "${pattern}" --include="*.tsx" --include="*.ts" .`, { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    if (result.trim()) {
      console.log(`❌ ${description}`);
      console.log(`💡 Correção: ${fix}`);
      console.log(`Arquivos afetados:`);
      console.log(result);
      hasErrors = true;
    }
  } catch (error) {
    // grep retorna código de saída 1 quando não encontra nada, isso é normal
    if (error.status !== 1) {
      console.log(`⚠️ Erro ao verificar padrão: ${error.message}`);
    }
  }
}

// Verificar padrões específicos conhecidos
problematicPatterns.forEach(({ pattern, description, fix }) => {
  checkPattern(pattern, description, fix);
});

// Verificação mais geral para imports relativos suspeitos
console.log('\n🔍 Verificando outros imports relativos suspeitos...');

try {
  // Procurar por imports que podem estar incorretos baseados na estrutura do projeto
  const suspiciousImports = [
    {
      cmd: `find pages/patient-portal -name "*.tsx" -exec grep -l "from.*\\.\\./contexts" {} \\;`,
      check: (file) => {
        const content = fs.readFileSync(file, 'utf8');
        return content.includes('from "../contexts') && !content.includes('from "../../contexts');
      },
      message: 'Possível import incorreto em patient-portal (deveria ser ../../contexts)'
    },
    {
      cmd: `find components -name "*.tsx" -path "*/*/components/*" -exec grep -l "from.*\\.\\./contexts" {} \\;`,
      check: (file) => {
        const relativePath = path.relative('.', file);
        const depth = relativePath.split('/').length;
        const content = fs.readFileSync(file, 'utf8');
        return depth > 2 && content.includes('from "../contexts') && !content.includes('from "../../contexts');
      },
      message: 'Possível import incorreto em subcomponente (verifique o número de ../)'
    }
  ];

  suspiciousImports.forEach(({ cmd, check, message }) => {
    try {
      const files = execSync(cmd, { encoding: 'utf8', stdio: 'pipe' }).trim().split('\n').filter(f => f);
      
      files.forEach(file => {
        if (fs.existsSync(file) && check(file)) {
          console.log(`⚠️ ${message}: ${file}`);
          hasErrors = true;
        }
      });
    } catch (error) {
      // Comando pode falhar se não encontrar arquivos, isso é normal
    }
  });

} catch (error) {
  console.log(`⚠️ Erro na verificação geral: ${error.message}`);
}

// Verificar se existem imports usando alias que não estão configurados
console.log('\n🔍 Verificando imports com alias não configurados...');
try {
  const aliasImports = execSync(`grep -r "from.*@/" --include="*.tsx" --include="*.ts" .`, { 
    encoding: 'utf8',
    stdio: 'pipe'
  });
  
  if (aliasImports.trim()) {
    // Verificar se os aliases estão configurados no vite.config.ts
    const viteConfig = fs.readFileSync('./vite.config.ts', 'utf8');
    if (!viteConfig.includes('@\':') && !viteConfig.includes('"@"')) {
      console.log(`⚠️ Encontrados imports com alias @/ mas alias não configurado no vite.config.ts`);
      console.log(`💡 Configure os aliases ou use imports relativos`);
      hasErrors = true;
    }
  }
} catch (error) {
  // Normal se não houver imports com alias
}

if (hasErrors) {
  console.log('\n❌ Imports problemáticos encontrados! Corrija antes de fazer commit.');
  process.exit(1);
} else {
  console.log('\n✅ Todos os imports estão corretos!');
  process.exit(0);
}
