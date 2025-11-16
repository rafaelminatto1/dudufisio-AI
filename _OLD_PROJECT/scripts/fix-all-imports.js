#!/usr/bin/env node
/**
 * Script para criar TODOS os re-exports necessários, incluindo imports locais
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lista de services que não existem mas são imports locais comuns
const MISSING_SERVICES = [
  'pathologyService',
  'mandatoryTestAlertService',
  'medicalReportSuggestionsService'
];

function createMissingServices(packagePath) {
  const servicesPath = path.join(packagePath, 'src', 'services');
  
  MISSING_SERVICES.forEach(service => {
    const filePath = path.join(servicesPath, `${service}.ts`);
    if (!fs.existsSync(filePath)) {
      const content = `// Re-export from shared services\nexport * from '../../../../services/${service}';\n`;
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`✓ Created missing service: ${service}.ts`);
    }
  });
}

// Processar cada microserviço
const packages = [
  'packages/agenda-pacientes',
  'packages/tratamentos',
  'packages/financeiro'
];

packages.forEach(pkg => {
  console.log(`\n🔧 Fixing ${pkg}...`);
  createMissingServices(pkg);
});

console.log('\n✨ Done!');


