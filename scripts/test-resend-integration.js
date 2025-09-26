#!/usr/bin/env node

/**
 * Test Resend Email Integration
 * 
 * This script tests the Resend email integration to ensure it's working correctly.
 * Run with: node scripts/test-resend-integration.js
 */

import { ResendService, createResendService } from '../lib/integrations/email/ResendService.ts';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testResendIntegration() {
  console.log('🧪 Testing Resend Email Integration...\n');

  try {
    // Check environment variables
    console.log('📋 Checking environment variables...');
    const requiredVars = ['RESEND_API_KEY', 'EMAIL_FROM', 'EMAIL_FROM_NAME'];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.error('❌ Missing required environment variables:', missingVars);
      console.log('\nPlease set the following variables in your .env.local file:');
      missingVars.forEach(varName => {
        console.log(`  ${varName}=your_value_here`);
      });
      return false;
    }
    
    console.log('✅ All required environment variables are set');
    console.log(`   RESEND_API_KEY: ${process.env.RESEND_API_KEY ? 'Set' : 'Not set'}`);
    console.log(`   EMAIL_FROM: ${process.env.EMAIL_FROM}`);
    console.log(`   EMAIL_FROM_NAME: ${process.env.EMAIL_FROM_NAME}`);
    console.log(`   EMAIL_ENABLED: ${process.env.EMAIL_ENABLED}\n`);

    // Create Resend service
    console.log('🔧 Creating Resend service...');
    const resendService = createResendService();
    console.log('✅ Resend service created successfully\n');

    // Test connection
    console.log('🔌 Testing connection...');
    const connectionTest = await resendService.testConnection();
    
    if (connectionTest) {
      console.log('✅ Connection test passed\n');
    } else {
      console.log('❌ Connection test failed\n');
      return false;
    }

    // Test welcome email
    console.log('📧 Testing welcome email...');
    const testEmail = process.env.TEST_EMAIL || 'test@example.com';
    const welcomeResult = await resendService.sendWelcomeEmail(testEmail, 'Test User');
    
    if (welcomeResult.success) {
      console.log('✅ Welcome email sent successfully');
      console.log(`   Message ID: ${welcomeResult.messageId}`);
      console.log(`   Duration: ${welcomeResult.duration}ms`);
      console.log(`   Cost: $${welcomeResult.cost}\n`);
    } else {
      console.log('❌ Welcome email failed');
      console.log(`   Error: ${welcomeResult.error}\n`);
    }

    // Test appointment reminder
    console.log('📅 Testing appointment reminder...');
    const appointmentDate = new Date();
    appointmentDate.setDate(appointmentDate.getDate() + 1);
    
    const reminderResult = await resendService.sendAppointmentReminder(
      testEmail,
      appointmentDate,
      'Test Patient',
      'Dr. Test Therapist'
    );
    
    if (reminderResult.success) {
      console.log('✅ Appointment reminder sent successfully');
      console.log(`   Message ID: ${reminderResult.messageId}`);
      console.log(`   Duration: ${reminderResult.duration}ms\n`);
    } else {
      console.log('❌ Appointment reminder failed');
      console.log(`   Error: ${reminderResult.error}\n`);
    }

    // Test custom email
    console.log('✉️ Testing custom email...');
    const customResult = await resendService.sendEmail({
      to: testEmail,
      subject: 'Teste de Integração Resend - DuduFisio',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Teste de Integração Resend</h1>
          <p>Este é um email de teste para verificar se a integração com o Resend está funcionando corretamente.</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Detalhes do Teste:</h3>
            <ul>
              <li><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</li>
              <li><strong>Domínio:</strong> ${process.env.EMAIL_FROM}</li>
              <li><strong>Serviço:</strong> Resend</li>
              <li><strong>Status:</strong> ✅ Funcionando</li>
            </ul>
          </div>
          <p>Se você recebeu este email, a integração está funcionando perfeitamente!</p>
          <p>Equipe DuduFisio</p>
        </div>
      `,
      text: 'Teste de integração Resend - DuduFisio. Se você recebeu este email, a integração está funcionando!'
    });
    
    if (customResult.success) {
      console.log('✅ Custom email sent successfully');
      console.log(`   Message ID: ${customResult.messageId}`);
      console.log(`   Duration: ${customResult.duration}ms`);
      console.log(`   Cost: $${customResult.cost}\n`);
    } else {
      console.log('❌ Custom email failed');
      console.log(`   Error: ${customResult.error}\n`);
    }

    // Summary
    console.log('📊 Test Summary:');
    console.log('================');
    console.log(`✅ Environment variables: OK`);
    console.log(`✅ Service creation: OK`);
    console.log(`✅ Connection test: ${connectionTest ? 'OK' : 'FAILED'}`);
    console.log(`✅ Welcome email: ${welcomeResult.success ? 'OK' : 'FAILED'}`);
    console.log(`✅ Appointment reminder: ${reminderResult.success ? 'OK' : 'FAILED'}`);
    console.log(`✅ Custom email: ${customResult.success ? 'OK' : 'FAILED'}`);
    
    const allTestsPassed = connectionTest && welcomeResult.success && reminderResult.success && customResult.success;
    
    if (allTestsPassed) {
      console.log('\n🎉 All tests passed! Resend integration is working correctly.');
      console.log('\n📧 Check your email inbox to verify the emails were received.');
    } else {
      console.log('\n⚠️ Some tests failed. Please check the errors above.');
    }

    return allTestsPassed;

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.error('Stack trace:', error.stack);
    return false;
  }
}

// Run the test
testResendIntegration()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Test script failed:', error);
    process.exit(1);
  });

export { testResendIntegration };
