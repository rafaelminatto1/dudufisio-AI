#!/usr/bin/env tsx

/**
 * WhatsApp Webhook Edge Function Performance Validation
 * 
 * Comprehensive validation script for the WhatsApp webhook Edge Function
 * Tests performance, reliability, and edge cases
 */

import { performance } from 'perf_hooks';

interface PerformanceMetrics {
  responseTime: number;
  statusCode: number;
  success: boolean;
  error?: string;
  timestamp: number;
}

interface ValidationResult {
  testName: string;
  status: 'PASS' | 'FAIL';
  metrics: PerformanceMetrics[];
  avgResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  successRate: number;
  error?: string;
}

interface ColdStartMetrics {
  firstRequestTime: number;
  subsequentRequestTime: number;
  coldStartPenalty: number;
}

const BASE_URL = 'http://localhost:5174';
const VERIFY_TOKEN = 'dudufisio_webhook_verify_token_2025';

/**
 * Test WhatsApp webhook verification (GET request)
 */
async function testWebhookVerification(iterations: number = 10): Promise<ValidationResult> {
  console.log('🔍 Testing WhatsApp Webhook Verification...');
  
  const metrics: PerformanceMetrics[] = [];
  
  for (let i = 0; i < iterations; i++) {
    const startTime = performance.now();
    
    try {
      const url = new URL(`${BASE_URL}/api/webhooks/whatsapp-edge`);
      url.searchParams.set('hub.mode', 'subscribe');
      url.searchParams.set('hub.verify_token', VERIFY_TOKEN);
      url.searchParams.set('hub.challenge', `test_challenge_${i}`);
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      const success = response.status === 200;
      const challenge = await response.text();
      
      metrics.push({
        responseTime,
        statusCode: response.status,
        success: success && challenge === `test_challenge_${i}`,
        timestamp: Date.now()
      });
      
      if (!success) {
        console.log(`  ❌ Request ${i + 1}: Status ${response.status}, Response: ${challenge}`);
      }
      
    } catch (error) {
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      metrics.push({
        responseTime,
        statusCode: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      });
      
      console.log(`  ❌ Request ${i + 1}: Error - ${error}`);
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  return calculateResult('Webhook Verification', metrics);
}

/**
 * Test WhatsApp webhook event processing (POST request)
 */
async function testWebhookEventProcessing(iterations: number = 10): Promise<ValidationResult> {
  console.log('🔍 Testing WhatsApp Webhook Event Processing...');
  
  const metrics: PerformanceMetrics[] = [];
  
  const samplePayload = {
    object: 'whatsapp_business_account',
    entry: [{
      id: '123456789',
      changes: [{
        value: {
          messaging_product: 'whatsapp',
          metadata: {
            display_phone_number: '5511999999999',
            phone_number_id: '123456789'
          },
          contacts: [{
            profile: { name: 'Test User' },
            wa_id: '5511999999999'
          }],
          messages: [{
            from: '5511999999999',
            id: 'msg_123456',
            timestamp: Math.floor(Date.now() / 1000).toString(),
            type: 'text',
            text: { body: 'Test message for performance validation' }
          }]
        },
        field: 'messages'
      }]
    }]
  };
  
  for (let i = 0; i < iterations; i++) {
    const startTime = performance.now();
    
    try {
      const response = await fetch(`${BASE_URL}/api/webhooks/whatsapp-edge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(samplePayload)
      });
      
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      const responseData = await response.json();
      
      metrics.push({
        responseTime,
        statusCode: response.status,
        success: response.status === 200 && responseData.success === true,
        timestamp: Date.now()
      });
      
      if (response.status !== 200 || responseData.success !== true) {
        console.log(`  ❌ Request ${i + 1}: Status ${response.status}, Response: ${JSON.stringify(responseData)}`);
      }
      
    } catch (error) {
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      metrics.push({
        responseTime,
        statusCode: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      });
      
      console.log(`  ❌ Request ${i + 1}: Error - ${error}`);
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  return calculateResult('Webhook Event Processing', metrics);
}

/**
 * Test cold start performance
 */
async function testColdStartPerformance(): Promise<ColdStartMetrics> {
  console.log('🧊 Testing Cold Start Performance...');
  
  // First request (cold start)
  const firstStart = performance.now();
  const firstResponse = await fetch(`${BASE_URL}/api/webhooks/whatsapp-edge?hub.mode=subscribe&hub.verify_token=${VERIFY_TOKEN}&hub.challenge=cold_start_test`, {
    method: 'GET'
  });
  const firstEnd = performance.now();
  const firstRequestTime = firstEnd - firstStart;
  
  console.log(`  First request (cold start): ${firstRequestTime.toFixed(2)}ms`);
  
  // Wait a moment
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Subsequent request (warm)
  const secondStart = performance.now();
  const secondResponse = await fetch(`${BASE_URL}/api/webhooks/whatsapp-edge?hub.mode=subscribe&hub.verify_token=${VERIFY_TOKEN}&hub.challenge=warm_test`, {
    method: 'GET'
  });
  const secondEnd = performance.now();
  const subsequentRequestTime = secondEnd - secondStart;
  
  console.log(`  Subsequent request (warm): ${subsequentRequestTime.toFixed(2)}ms`);
  
  return {
    firstRequestTime,
    subsequentRequestTime,
    coldStartPenalty: firstRequestTime - subsequentRequestTime
  };
}

/**
 * Test error handling and edge cases
 */
async function testErrorHandling(): Promise<ValidationResult> {
  console.log('🧪 Testing Error Handling and Edge Cases...');
  
  const testCases = [
    {
      name: 'Invalid Verification Token',
      url: `${BASE_URL}/api/webhooks/whatsapp-edge?hub.mode=subscribe&hub.verify_token=wrong_token&hub.challenge=test`,
      method: 'GET',
      expectedStatus: 403
    },
    {
      name: 'Missing Verification Parameters',
      url: `${BASE_URL}/api/webhooks/whatsapp-edge`,
      method: 'GET',
      expectedStatus: 403
    },
    {
      name: 'Invalid JSON Payload',
      url: `${BASE_URL}/api/webhooks/whatsapp-edge`,
      method: 'POST',
      body: 'invalid json',
      headers: { 'Content-Type': 'application/json' },
      expectedStatus: 200 // Should handle gracefully
    },
    {
      name: 'Empty Payload',
      url: `${BASE_URL}/api/webhooks/whatsapp-edge`,
      method: 'POST',
      body: '{}',
      headers: { 'Content-Type': 'application/json' },
      expectedStatus: 200 // Should handle gracefully
    },
    {
      name: 'Unsupported Method',
      url: `${BASE_URL}/api/webhooks/whatsapp-edge`,
      method: 'PUT',
      expectedStatus: 405
    }
  ];
  
  const metrics: PerformanceMetrics[] = [];
  
  for (const testCase of testCases) {
    const startTime = performance.now();
    
    try {
      const response = await fetch(testCase.url, {
        method: testCase.method as any,
        headers: testCase.headers || {},
        body: testCase.body
      });
      
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      const success = response.status === testCase.expectedStatus;
      
      metrics.push({
        responseTime,
        statusCode: response.status,
        success,
        timestamp: Date.now()
      });
      
      console.log(`  ${success ? '✅' : '❌'} ${testCase.name}: Status ${response.status} (expected ${testCase.expectedStatus})`);
      
    } catch (error) {
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      metrics.push({
        responseTime,
        statusCode: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      });
      
      console.log(`  ❌ ${testCase.name}: Error - ${error}`);
    }
  }
  
  return calculateResult('Error Handling', metrics);
}

/**
 * Calculate validation result from metrics
 */
function calculateResult(testName: string, metrics: PerformanceMetrics[]): ValidationResult {
  const successfulRequests = metrics.filter(m => m.success).length;
  const successRate = (successfulRequests / metrics.length) * 100;
  
  const responseTimes = metrics.map(m => m.responseTime);
  const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
  const minResponseTime = Math.min(...responseTimes);
  const maxResponseTime = Math.max(...responseTimes);
  
  return {
    testName,
    status: successRate >= 90 ? 'PASS' : 'FAIL', // 90% success rate threshold
    metrics,
    avgResponseTime,
    minResponseTime,
    maxResponseTime,
    successRate
  };
}

/**
 * Generate comprehensive performance report
 */
function generateReport(results: ValidationResult[], coldStartMetrics: ColdStartMetrics): void {
  console.log('\n' + '='.repeat(70));
  console.log('📊 WHATSAPP WEBHOOK EDGE FUNCTION - PERFORMANCE VALIDATION REPORT');
  console.log('='.repeat(70));
  
  // Overall results
  const passedTests = results.filter(r => r.status === 'PASS').length;
  const failedTests = results.filter(r => r.status === 'FAIL').length;
  const totalTests = results.length;
  
  console.log(`\n🎯 Overall Results:`);
  console.log(`   Total Tests: ${totalTests}`);
  console.log(`   Passed: ${passedTests} (${((passedTests/totalTests)*100).toFixed(1)}%)`);
  console.log(`   Failed: ${failedTests} (${((failedTests/totalTests)*100).toFixed(1)}%)`);
  
  // Cold start performance
  console.log(`\n🧊 Cold Start Performance:`);
  console.log(`   First Request: ${coldStartMetrics.firstRequestTime.toFixed(2)}ms`);
  console.log(`   Subsequent Request: ${coldStartMetrics.subsequentRequestTime.toFixed(2)}ms`);
  console.log(`   Cold Start Penalty: ${coldStartMetrics.coldStartPenalty.toFixed(2)}ms`);
  
  // Individual test results
  console.log(`\n📋 Detailed Test Results:`);
  results.forEach(result => {
    console.log(`\n   ${result.status === 'PASS' ? '✅' : '❌'} ${result.testName}`);
    console.log(`      Success Rate: ${result.successRate.toFixed(1)}%`);
    console.log(`      Avg Response Time: ${result.avgResponseTime.toFixed(2)}ms`);
    console.log(`      Min Response Time: ${result.minResponseTime.toFixed(2)}ms`);
    console.log(`      Max Response Time: ${result.maxResponseTime.toFixed(2)}ms`);
    
    if (result.status === 'FAIL' && result.metrics.some(m => !m.success)) {
      const failedRequests = result.metrics.filter(m => !m.success);
      console.log(`      Failed Requests: ${failedRequests.length}`);
      failedRequests.slice(0, 3).forEach(m => {
        console.log(`        - ${m.error || `Status ${m.statusCode}`} (${m.responseTime.toFixed(2)}ms)`);
      });
    }
  });
  
  // Performance benchmarks
  console.log(`\n⚡ Performance Benchmarks:`);
  const allResponseTimes = results.flatMap(r => r.metrics.map(m => m.responseTime));
  const overallAvg = allResponseTimes.reduce((a, b) => a + b, 0) / allResponseTimes.length;
  const overallMin = Math.min(...allResponseTimes);
  const overallMax = Math.max(...allResponseTimes);
  
  console.log(`   Overall Avg Response Time: ${overallAvg.toFixed(2)}ms`);
  console.log(`   Overall Min Response Time: ${overallMin.toFixed(2)}ms`);
  console.log(`   Overall Max Response Time: ${overallMax.toFixed(2)}ms`);
  
  // Performance assessment
  console.log(`\n🎯 Performance Assessment:`);
  if (overallAvg < 100) {
    console.log('   ✅ Excellent performance - Average response time under 100ms');
  } else if (overallAvg < 200) {
    console.log('   ⚠️  Good performance - Average response time under 200ms');
  } else {
    console.log('   ❌ Poor performance - Average response time over 200ms');
  }
  
  if (coldStartMetrics.coldStartPenalty < 50) {
    console.log('   ✅ Excellent cold start performance - Penalty under 50ms');
  } else if (coldStartMetrics.coldStartPenalty < 100) {
    console.log('   ⚠️  Good cold start performance - Penalty under 100ms');
  } else {
    console.log('   ❌ Poor cold start performance - Penalty over 100ms');
  }
  
  // Recommendations
  console.log(`\n💡 Recommendations:`);
  if (overallAvg > 100) {
    console.log('   ⚠️  Consider optimizing function code to reduce response time');
  }
  if (coldStartMetrics.coldStartPenalty > 50) {
    console.log('   ⚠️  Consider implementing warming strategies to reduce cold start impact');
  }
  if (results.some(r => r.status === 'FAIL')) {
    console.log('   ⚠️  Address failing tests to improve reliability');
  }
  if (overallMax > 500) {
    console.log('   ⚠️  Some requests are taking too long (>500ms). Investigate outliers.');
  }
  
  console.log(`\n✅ WhatsApp Webhook Edge Function Validation Complete!`);
  console.log('='.repeat(70));
}

/**
 * Main validation function
 */
async function runValidation(): Promise<void> {
  console.log('🚀 Starting WhatsApp Webhook Edge Function Performance Validation');
  console.log('📝 This will test performance, reliability, and edge cases');
  console.log('');
  
  try {
    // Run all validation tests
    const verificationResult = await testWebhookVerification(15);
    const eventProcessingResult = await testWebhookEventProcessing(15);
    const errorHandlingResult = await testErrorHandling();
    const coldStartMetrics = await testColdStartPerformance();
    
    // Generate comprehensive report
    generateReport([
      verificationResult,
      eventProcessingResult,
      errorHandlingResult
    ], coldStartMetrics);
    
    // Exit with appropriate code
    const hasFailures = [verificationResult, eventProcessingResult, errorHandlingResult]
      .some(r => r.status === 'FAIL');
    
    process.exit(hasFailures ? 1 : 0);
    
  } catch (error) {
    console.error('❌ Validation failed with error:', error);
    process.exit(1);
  }
}

// Run validation
runValidation().catch(error => {
  console.error('❌ Validation script failed:', error);
  process.exit(1);
});