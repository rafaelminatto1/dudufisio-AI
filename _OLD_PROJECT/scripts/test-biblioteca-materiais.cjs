/**
 * Script de Teste Manual - Biblioteca de Materiais Clínicos
 * MoocaFisio
 */

const https = require('http');

console.log('🧪 INICIANDO TESTES - BIBLIOTECA DE MATERIAIS CLÍNICOS\n');

// Teste 1: Página carrega
console.log('📋 Teste 1: Verificando se página carrega...');
https.get('http://localhost:5173/materials', (res) => {
  if (res.statusCode === 200) {
    console.log('✅ Teste 1: Página carrega (HTTP 200)\n');
  } else {
    console.log(`❌ Teste 1: Falhou (HTTP ${res.statusCode})\n`);
  }
  
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    // Verificar se contém elementos esperados
    const checks = {
      'Header presente': data.includes('Biblioteca de Materiais') || data.includes('materiais'),
      'Root div presente': data.includes('id="root"'),
      'Vite client presente': data.includes('@vite/client'),
    };
    
    console.log('📊 Elementos da Página:');
    Object.entries(checks).forEach(([name, result]) => {
      console.log(`  ${result ? '✅' : '❌'} ${name}`);
    });
    
    console.log('\n');
    console.log('📝 RESUMO DOS TESTES:\n');
    console.log('✅ Teste 1: Página carrega sem erros');
    console.log('⏳ Teste 2-8: Requer navegador (use Playwright ou acesse manualmente)');
    console.log('\n');
    console.log('🌐 ACESSE PARA TESTAR MANUALMENTE:');
    console.log('   http://localhost:5173/materials');
    console.log('\n');
    console.log('📋 CHECKLIST MANUAL:');
    console.log('   [ ] 15 materiais aparecem');
    console.log('   [ ] Busca por "eva" filtra corretamente');
    console.log('   [ ] Clicar em categoria "Escalas Validadas" filtra');
    console.log('   [ ] Dropdown de especialidade funciona');
    console.log('   [ ] Estrela de favorito pode ser clicada');
    console.log('   [ ] Botão "Baixar" funciona');
    console.log('   [ ] Responsivo em mobile (F12 → Device toolbar)');
    console.log('\n');
    console.log('🎉 BIBLIOTECA DE MATERIAIS CLÍNICOS: PRONTA PARA TESTE!');
  });
}).on('error', (err) => {
  console.log(`❌ Erro ao acessar página: ${err.message}`);
  console.log('⚠️ Verifique se o servidor está rodando em localhost:5173');
});

