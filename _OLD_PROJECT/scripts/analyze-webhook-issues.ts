#!/usr/bin/env tsx

/**
 * WhatsApp Webhook Edge Function - Quick Fix Script
 * 
 * Addresses the critical issues identified in validation:
 * 1. Webhook verification logic
 * 2. Error handling status codes
 * 3. Challenge response format
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const WEBHOOK_FILE = join(process.cwd(), 'api', 'webhooks', 'whatsapp-edge.ts');

function fixWebhookVerification() {
  console.log('🔧 Fixing WhatsApp Webhook Edge Function...');
  
  try {
    // Read current file
    const content = readFileSync(WEBHOOK_FILE, 'utf8');
    
    // Identify and fix verification logic
    if (content.includes('hub.verify_token') && content.includes('hub.challenge')) {
      console.log('✅ Webhook verification logic found in file');
      
      // Check for potential issues
      const issues = [];
      
      // Issue 1: Check if verification returns correct status
      if (!content.includes('return new Response(hubChallenge, { status: 200 })')) {
        issues.push('Verification may not return proper 200 status');
      }
      
      // Issue 2: Check if error handling returns 403
      if (!content.includes('status: 403')) {
        issues.push('Error handling may not return 403 for invalid tokens');
      }
      
      // Issue 3: Check if challenge is returned correctly
      if (!content.includes('hub.challenge')) {
        issues.push('Challenge parameter may not be handled correctly');
      }
      
      if (issues.length > 0) {
        console.log('⚠️  Issues identified:');
        issues.forEach(issue => console.log(`   - ${issue}`));
        
        console.log('\n🔍 Current verification logic analysis:');
        
        // Extract verification section
        const lines = content.split('\n');
        const verificationStart = lines.findIndex(line => 
          line.includes('hub.mode') || line.includes('hub.verify_token')
        );
        
        if (verificationStart !== -1) {
          const verificationEnd = lines.findIndex((line, index) => 
            index > verificationStart && line.includes('return')
          );
          
          if (verificationEnd !== -1) {
            const verificationSection = lines.slice(verificationStart, verificationEnd + 3).join('\n');
            console.log('Current verification logic:');
            console.log('```typescript');
            console.log(verificationSection);
            console.log('```');
          }
        }
        
        console.log('\n💡 Recommended fixes:');
        console.log('1. Ensure verification returns 200 status with challenge');
        console.log('2. Return 403 for invalid tokens');
        console.log('3. Return challenge parameter exactly as received');
        
        return {
          needsFix: true,
          issues,
          currentContent: content
        };
        
      } else {
        console.log('✅ No obvious issues detected in current implementation');
        return { needsFix: false, issues: [] };
      }
      
    } else {
      console.log('❌ Webhook verification logic not found in file');
      return { needsFix: true, issues: ['Missing webhook verification logic'] };
    }
    
  } catch (error) {
    console.error('❌ Error reading webhook file:', error);
    return { needsFix: true, issues: ['File read error'] };
  }
}

function generateFixedCode(currentContent: string): string {
  console.log('📝 Generating fixed webhook verification logic...');
  
  // Find the main handler function
  const handlerMatch = currentContent.match(/export default async function\s+\w*\s*\([^)]*\)\s*{/);
  if (!handlerMatch) {
    console.log('❌ Could not find main handler function');
    return currentContent;
  }
  
  // Generate improved verification logic
  const improvedVerification = `
  // Webhook verification (GET request)
  if (request.method === 'GET') {
    const url = new URL(request.url);
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');

    // Verify the webhook
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('✅ Webhook verified successfully');
      return new Response(challenge, { 
        status: 200,
        headers: {
          'Content-Type': 'text/plain',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    console.log('❌ Webhook verification failed');
    return new Response('Forbidden', { 
      status: 403,
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }`;
  
  console.log('✅ Generated improved verification logic');
  console.log('Key improvements:');
  console.log('- Explicit 200 status for successful verification');
  console.log('- Explicit 403 status for failed verification');
  console.log('- Proper challenge parameter handling');
  console.log('- Added CORS headers');
  
  return improvedVerification;
}

function createTestCases() {
  console.log('\n🧪 Creating test cases for validation...');
  
  const testCases = [
    {
      name: 'Valid Verification',
      url: `/api/webhooks/whatsapp-edge?hub.mode=subscribe&hub.verify_token=dudufisio_webhook_verify_token_2025&hub.challenge=test_challenge_123`,
      expectedStatus: 200,
      expectedBody: 'test_challenge_123',
      description: 'Should return challenge with 200 status'
    },
    {
      name: 'Invalid Token',
      url: `/api/webhooks/whatsapp-edge?hub.mode=subscribe&hub.verify_token=wrong_token&hub.challenge=test_challenge_123`,
      expectedStatus: 403,
      expectedBody: 'Forbidden',
      description: 'Should return 403 for invalid token'
    },
    {
      name: 'Missing Parameters',
      url: `/api/webhooks/whatsapp-edge`,
      expectedStatus: 403,
      expectedBody: 'Forbidden',
      description: 'Should return 403 for missing parameters'
    },
    {
      name: 'Invalid Mode',
      url: `/api/webhooks/whatsapp-edge?hub.mode=invalid&hub.verify_token=dudufisio_webhook_verify_token_2025&hub.challenge=test_challenge_123`,
      expectedStatus: 403,
      expectedBody: 'Forbidden',
      description: 'Should return 403 for invalid mode'
    }
  ];
  
  console.log('Test cases created:');
  testCases.forEach(test => {
    console.log(`  - ${test.name}: ${test.description}`);
  });
  
  return testCases;
}

function main() {
  console.log('🚀 WhatsApp Webhook Edge Function - Quick Fix Analysis');
  console.log('='.repeat(60));
  
  const analysis = fixWebhookVerification();
  
  if (analysis.needsFix) {
    console.log('\n🔧 Issues detected that need fixing');
    
    if (analysis.currentContent) {
      const fixedCode = generateFixedCode(analysis.currentContent);
      const testCases = createTestCases();
      
      console.log('\n📋 Next Steps:');
      console.log('1. Review the current webhook verification logic');
      console.log('2. Apply the recommended fixes manually');
      console.log('3. Run validation tests again');
      console.log('4. Test with Facebook webhook verification');
      
      console.log('\n✨ Manual Fix Required:');
      console.log('The webhook verification logic needs to be updated to:');
      console.log('- Return 200 status with challenge parameter for valid verification');
      console.log('- Return 403 status for invalid tokens or missing parameters');
      console.log('- Handle all edge cases properly');
    }
  } else {
    console.log('\n✅ No critical issues detected');
    console.log('The webhook verification logic appears to be properly implemented.');
  }
  
  console.log('\n🔍 For detailed analysis, run:');
  console.log('npx tsx scripts/validate-whatsapp-webhook-dev.ts');
}

// Run analysis
main().catch(error => {
  console.error('❌ Analysis failed:', error);
  process.exit(1);
});