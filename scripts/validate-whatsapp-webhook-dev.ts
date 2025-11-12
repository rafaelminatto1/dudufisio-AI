#!/usr/bin/env tsx

/**
 * WhatsApp Webhook Edge Function - Development Performance Validation
 * 
 * Focused validation for development environment testing
 * Measures actual performance metrics for the WhatsApp webhook
 */

import { performance } from 'perf_hooks';

interface TestResult {
  testName: string;
  status: 'PASS' | 'FAIL' | 'PARTIAL';
  responseTime: number;
  statusCode: number;
  details: string;
  recommendations?: string[];
}

interface PerformanceMetrics {
  avgResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  successRate: number;
  totalRequests: number;
}

const BASE_URL = 'http://localhost:5174';
const VERIFY_TOKEN = 'dudufisio_webhook_verify_token_2025';

/**
 * Test WhatsApp webhook verification performance
 */
async function testWebhookVerification(): Promise<TestResult> {
  console.log('🔍 Testing WhatsApp Webhook Verification Performance...');
  
  const iterations = 10;
  const responseTimes: number[] = [];
  let successCount = 0;
  
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
      responseTimes.push(responseTime);
      
      const challenge = await response.text();
      
      if (response.status === 200 && challenge === `test_challenge_${i}`) {
        successCount++;
      }
      
    } catch (error) {
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      responseTimes.push(responseTime);
      console.log(`  ❌ Request ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  
  const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
  const minResponseTime = Math.min(...responseTimes);
  const maxResponseTime = Math.max(...responseTimes);
  const successRate = (successCount / iterations) * 100;
  
  const status = successRate === 100 ? 'PASS' : successRate >= 80 ? 'PARTIAL' : 'FAIL';
  
  return {
    testName: 'Webhook Verification',
    status,
    responseTime: avgResponseTime,
    statusCode: successCount > 0 ? 200 : 500,
    details: `Success Rate: ${successRate.toFixed(1)}%, Avg: ${avgResponseTime.toFixed(2)}ms, Min: ${minResponseTime.toFixed(2)}ms, Max: ${maxResponseTime.toFixed(2)}ms`,
    recommendations: successRate < 100 ? ['Review verification logic and token handling'] : undefined
  };
}

/**
 * Test cold start performance
 */
async function testColdStartPerformance(): Promise<{
  firstRequestTime: number;
  warmRequestTime: number;
  coldStartPenalty: number;
}> {
  console.log('🧊 Testing Cold Start Performance...');
  
  // First request (potential cold start)
  const firstStart = performance.now();
  const firstResponse = await fetch(`${BASE_URL}/api/webhooks/whatsapp-edge?hub.mode=subscribe&hub.verify_token=${VERIFY_TOKEN}&hub.challenge=cold_start_test`, {
    method: 'GET'
  });
  const firstEnd = performance.now();
  const firstRequestTime = firstEnd - firstStart;
  
  console.log(`  First request: ${firstRequestTime.toFixed(2)}ms (Status: ${firstResponse.status})`);
  
  // Wait a moment to ensure function is warm
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Subsequent request (warm)
  const warmStart = performance.now();
  const warmResponse = await fetch(`${BASE_URL}/api/webhooks/whatsapp-edge?hub.mode=subscribe&hub.verify_token=${VERIFY_TOKEN}&hub.challenge=warm_test`, {
    method: 'GET'
  });
  const warmEnd = performance.now();
  const warmRequestTime = warmEnd - warmStart;
  
  console.log(`  Warm request: ${warmRequestTime.toFixed(2)}ms (Status: ${warmResponse.status})`);
  
  return {
    firstRequestTime,
    warmRequestTime,
    coldStartPenalty: firstRequestTime - warmRequestTime
  };
}

/**
 * Test error handling scenarios
 */
async function testErrorHandling(): Promise<TestResult> {
  console.log('🧪 Testing Error Handling...');
  
  const testCases = [
    {
      name: 'Invalid Token',
      url: `${BASE_URL}/api/webhooks/whatsapp-edge?hub.mode=subscribe&hub.verify_token=wrong_token&hub.challenge=test`,
      expectedStatus: 403,
      description: 'Invalid verification token'
    },
    {
      name: 'Missing Parameters',
      url: `${BASE_URL}/api/webhooks/whatsapp-edge`,
      expectedStatus: 403,
      description: 'Missing required parameters'
    },
    {
      name: 'Invalid Mode',
      url: `${BASE_URL}/api/webhooks/whatsapp-edge?hub.mode=invalid&hub.verify_token=${VERIFY_TOKEN}&hub.challenge=test`,
      expectedStatus: 403,
      description: 'Invalid hub mode'
    }
  ];
  
  const results: { name: string; responseTime: number; statusCode: number; passed: boolean }[] = [];
  
  for (const testCase of testCases) {
    const startTime = performance.now();
    
    try {
      const response = await fetch(testCase.url, {
        method: 'GET'
      });
      
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      const passed = response.status === testCase.expectedStatus;
      
      results.push({
        name: testCase.name,
        responseTime,
        statusCode: response.status,
        passed
      });
      
      console.log(`  ${passed ? '✅' : '❌'} ${testCase.name}: Status ${response.status} (${responseTime.toFixed(2)}ms)`);
      
    } catch (error) {
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      results.push({
        name: testCase.name,
        responseTime,
        statusCode: 0,
        passed: false
      });
      
      console.log(`  ❌ ${testCase.name}: Error - ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
  const passedCount = results.filter(r => r.passed).length;
  const successRate = (passedCount / results.length) * 100;
  
  const status = successRate === 100 ? 'PASS' : successRate >= 66 ? 'PARTIAL' : 'FAIL';
  
  return {
    testName: 'Error Handling',
    status,
    responseTime: avgResponseTime,
    statusCode: successRate === 100 ? 200 : 400,
    details: `Success Rate: ${successRate.toFixed(1)}%, Avg Response: ${avgResponseTime.toFixed(2)}ms`,
    recommendations: successRate < 100 ? ['Review error handling logic for edge cases'] : undefined
  };
}

/**
 * Test CORS and headers
 */
async function testCorsAndHeaders(): Promise<TestResult> {
  console.log('🔒 Testing CORS and Security Headers...');
  
  const startTime = performance.now();
  
  try {
    const response = await fetch(`${BASE_URL}/api/webhooks/whatsapp-edge?hub.mode=subscribe&hub.verify_token=${VERIFY_TOKEN}&hub.challenge=cors_test`, {
      method: 'GET',
      headers: {
        'Origin': 'https://test-domain.com'
      }
    });
    
    const endTime = performance.now();
    const responseTime = endTime - startTime;
    
    const corsHeader = response.headers.get('Access-Control-Allow-Origin');
    const contentType = response.headers.get('Content-Type');
    
    const hasCors = corsHeader !== null;
    const hasContentType = contentType !== null;
    
    console.log(`  CORS Header: ${hasCors ? '✅ Present' : '❌ Missing'}`);
    console.log(`  Content-Type: ${hasContentType ? '✅ Present' : '❌ Missing'}`);
    console.log(`  Response Time: ${responseTime.toFixed(2)}ms`);
    
    const passed = hasCors && hasContentType && response.status === 200;
    
    return {
      testName: 'CORS & Headers',
      status: passed ? 'PASS' : 'FAIL',
      responseTime,
      statusCode: response.status,
      details: `CORS: ${hasCors ? 'Present' : 'Missing'}, Content-Type: ${hasContentType ? 'Present' : 'Missing'}`,
      recommendations: !hasCors ? ['Add CORS headers for cross-origin requests'] : undefined
    };
    
  } catch (error) {
    const endTime = performance.now();
    const responseTime = endTime - startTime;
    
    return {
      testName: 'CORS & Headers',
      status: 'FAIL',
      responseTime,
      statusCode: 500,
      details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      recommendations: ['Check network connectivity and server configuration']
    };
  }
}

/**
 * Generate comprehensive performance report
 */
function generateReport(results: TestResult[], coldStartMetrics: {
  firstRequestTime: number;
  warmRequestTime: number;
  coldStartPenalty: number;
}): void {
  console.log('\n' + '='.repeat(70));
  console.log('📊 WHATSAPP WEBHOOK EDGE FUNCTION - DEVELOPMENT VALIDATION REPORT');
  console.log('='.repeat(70));
  
  // Overall results
  const passedTests = results.filter(r => r.status === 'PASS').length;
  const partialTests = results.filter(r => r.status === 'PARTIAL').length;
  const failedTests = results.filter(r => r.status === 'FAIL').length;
  const totalTests = results.length;
  
  console.log(`\n🎯 Overall Results:`);
  console.log(`   Total Tests: ${totalTests}`);
  console.log(`   Passed: ${passedTests} (${((passedTests/totalTests)*100).toFixed(1)}%)`);
  console.log(`   Partial: ${partialTests} (${((partialTests/totalTests)*100).toFixed(1)}%)`);
  console.log(`   Failed: ${failedTests} (${((failedTests/totalTests)*100).toFixed(1)}%)`);
  
  // Cold start performance
  console.log(`\n🧊 Cold Start Analysis:`);
  console.log(`   First Request: ${coldStartMetrics.firstRequestTime.toFixed(2)}ms`);
  console.log(`   Warm Request: ${coldStartMetrics.warmRequestTime.toFixed(2)}ms`);
  console.log(`   Cold Start Impact: ${coldStartMetrics.coldStartPenalty >= 0 ? '+' : ''}${coldStartMetrics.coldStartPenalty.toFixed(2)}ms`);
  
  if (coldStartMetrics.coldStartPenalty < 20) {
    console.log('   ✅ Excellent - Minimal cold start impact');
  } else if (coldStartMetrics.coldStartPenalty < 50) {
    console.log('   ⚠️  Good - Acceptable cold start impact');
  } else {
    console.log('   ❌ Poor - Significant cold start impact');
  }
  
  // Individual test results
  console.log(`\n📋 Detailed Test Results:`);
  results.forEach(result => {
    const statusIcon = result.status === 'PASS' ? '✅' : result.status === 'PARTIAL' ? '⚠️' : '❌';
    console.log(`\n   ${statusIcon} ${result.testName}`);
    console.log(`      Status: ${result.status}`);
    console.log(`      Response Time: ${result.responseTime.toFixed(2)}ms`);
    console.log(`      HTTP Status: ${result.statusCode}`);
    console.log(`      Details: ${result.details}`);
    
    if (result.recommendations && result.recommendations.length > 0) {
      console.log(`      Recommendations:`);
      result.recommendations.forEach(rec => console.log(`        - ${rec}`));
    }
  });
  
  // Performance benchmarks
  const allResponseTimes = results.map(r => r.responseTime);
  const overallAvg = allResponseTimes.reduce((a, b) => a + b, 0) / allResponseTimes.length;
  const overallMin = Math.min(...allResponseTimes);
  const overallMax = Math.max(...allResponseTimes);
  
  console.log(`\n⚡ Performance Benchmarks:`);
  console.log(`   Overall Avg Response Time: ${overallAvg.toFixed(2)}ms`);
  console.log(`   Overall Min Response Time: ${overallMin.toFixed(2)}ms`);
  console.log(`   Overall Max Response Time: ${overallMax.toFixed(2)}ms`);
  
  // Performance assessment
  console.log(`\n🎯 Performance Assessment:`);
  if (overallAvg < 50) {
    console.log('   ✅ Excellent - Average response time under 50ms');
  } else if (overallAvg < 100) {
    console.log('   ✅ Very Good - Average response time under 100ms');
  } else if (overallAvg < 200) {
    console.log('   ⚠️  Good - Average response time under 200ms');
  } else {
    console.log('   ❌ Poor - Average response time over 200ms');
  }
  
  if (overallMax > 500) {
    console.log('   ⚠️  Some requests are taking too long (>500ms). Investigate outliers.');
  }
  
  // Production readiness
  console.log(`\n🚀 Production Readiness:`);
  const readinessScore = (passedTests / totalTests) * 100;
  
  if (readinessScore >= 90 && overallAvg < 100) {
    console.log('   ✅ Ready for Production - Excellent performance and reliability');
  } else if (readinessScore >= 75 && overallAvg < 200) {
    console.log('   ⚠️  Conditionally Ready - Address recommendations before production');
  } else {
    console.log('   ❌ Not Ready - Significant issues need to be addressed');
  }
  
  // Recommendations
  console.log(`\n💡 General Recommendations:`);
  const recommendations = new Set<string>();
  
  results.forEach(result => {
    if (result.recommendations) {
      result.recommendations.forEach(rec => recommendations.add(rec));
    }
  });
  
  if (recommendations.size > 0) {
    Array.from(recommendations).forEach(rec => console.log(`   - ${rec}`));
  } else {
    console.log('   ✅ No critical recommendations - function is performing well');
  }
  
  console.log(`\n✅ WhatsApp Webhook Edge Function Development Validation Complete!`);
  console.log('='.repeat(70));
}

/**
 * Main validation function
 */
async function runValidation(): Promise<void> {
  console.log('🚀 Starting WhatsApp Webhook Edge Function Development Validation');
  console.log('📝 Testing performance, reliability, and edge cases in development environment');
  console.log('');
  
  try {
    // Run all validation tests
    const verificationResult = await testWebhookVerification();
    const coldStartMetrics = await testColdStartPerformance();
    const errorHandlingResult = await testErrorHandling();
    const corsResult = await testCorsAndHeaders();
    
    // Generate comprehensive report
    generateReport([
      verificationResult,
      errorHandlingResult,
      corsResult
    ], coldStartMetrics);
    
    // Exit with appropriate code
    const hasFailures = [verificationResult, errorHandlingResult, corsResult]
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