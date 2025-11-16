#!/usr/bin/env node

/**
 * Check DNS Configuration for Resend
 * 
 * This script checks if the DNS records for Resend are properly configured.
 * Run with: node scripts/check-dns-config.js
 */

import { promisify } from 'util';
import dns from 'dns';

const resolveTxt = promisify(dns.resolveTxt);
const resolveCname = promisify(dns.resolveCname);

async function checkDNSConfiguration() {
  console.log('🔍 Verificando configuração DNS para Resend...\n');

  const domain = 'moocafisio.com.br';
  let allChecksPassed = true;

  try {
    // Check TXT record for DKIM verification
    console.log('📋 Verificando registro TXT (DKIM)...');
    try {
      const txtRecords = await resolveTxt(domain);
      const dkimRecord = txtRecords.find(record => 
        record.some(r => r.includes('resend._domainkey'))
      );
      
      if (dkimRecord) {
        console.log('✅ Registro TXT encontrado:', dkimRecord[0]);
      } else {
        console.log('❌ Registro TXT não encontrado');
        console.log('   Registros encontrados:', txtRecords);
        allChecksPassed = false;
      }
    } catch (error) {
      console.log('❌ Erro ao verificar registro TXT:', error.message);
      allChecksPassed = false;
    }

    // Check CNAME record for sending
    console.log('\n📋 Verificando registro CNAME (Envio)...');
    try {
      const cnameRecords = await resolveCname(`resend.${domain}`);
      const resendRecord = cnameRecords.find(record => 
        record.includes('resend.com')
      );
      
      if (resendRecord) {
        console.log('✅ Registro CNAME encontrado:', resendRecord);
      } else {
        console.log('❌ Registro CNAME não encontrado');
        console.log('   Registros encontrados:', cnameRecords);
        allChecksPassed = false;
      }
    } catch (error) {
      console.log('❌ Erro ao verificar registro CNAME:', error.message);
      allChecksPassed = false;
    }

    // Summary
    console.log('\n📊 Resumo da Verificação:');
    console.log('========================');
    
    if (allChecksPassed) {
      console.log('🎉 Todos os registros DNS estão configurados corretamente!');
      console.log('✅ O domínio está pronto para usar com o Resend');
    } else {
      console.log('⚠️ Alguns registros DNS precisam ser configurados');
      console.log('\n📝 Registros necessários:');
      console.log('Tipo: TXT');
      console.log('Nome: @');
      console.log('Valor: resend._domainkey.moocafisio.com.br');
      console.log('\nTipo: CNAME');
      console.log('Nome: resend.moocafisio.com.br');
      console.log('Valor: resend.com');
      console.log('\n🌐 Configure estes registros no seu provedor de domínio');
    }

    return allChecksPassed;

  } catch (error) {
    console.error('❌ Erro geral na verificação DNS:', error.message);
    return false;
  }
}

// Run the check
checkDNSConfiguration()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Script falhou:', error);
    process.exit(1);
  });

export { checkDNSConfiguration };
