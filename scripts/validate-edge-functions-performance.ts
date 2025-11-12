#!/usr/bin/env tsx

/**
 * Edge Functions Performance Validation Script
 * 
 * This script validates the performance and functionality of all Edge Functions
 * in the DuduFisio-AI project, ensuring they meet the required performance benchmarks.
 */

import { performance } from 'perf_hooks';

interface EdgeFunctionTest {
  name: string;
  url: string;
  method: 'GET' | 'POST';
  headers?: Record<string, string>;
  body?: string;
  expectedStatus: number;
  maxResponseTime: number; // milliseconds
}

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL';
  responseTime: number;
  statusCode: number;
  error?: string;
  details: string;
}

const EDGE_FUNCTIONS: EdgeFunctionTest[] = [
  {
    name: 'WhatsApp Webhook Verification',
    url: 'http://localhost:5173/api/webhooks/whatsapp-edge?hub.mode=subscribe&hub.verify_token=dudufisio_webhook_verify_token_2025&hub.challenge=test123',
    method: 'GET',
    expectedStatus: 200,
    maxResponseTime: 100 // 100ms max
  },
  {
    name: 'Health Check',
    url: 'http://localhost:5173/api/supabase/functions/health-check',
    method: 'GET',
    expectedStatus: 200,
    maxResponseTime: 50 // 50ms max
  },
  {
    name: 'Send Email',
    url: 'http://localhost:5173/api/supabase/functions/send-email',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: 'test@example.com',
      subject: 'Test Email',
      content: 'This is a test email'
    }),
    expectedStatus: 200,
    maxResponseTime: 200 // 200ms max
  },
  {
    name: 'Send SMS',
    url: 'http://localhost:5173/api/supabase/functions/send-sms',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: '+5511999999999',
      message: 'Test SMS message'
    }),
    expectedStatus: 200,
    maxResponseTime: 300 // 300ms max
  },
  {
    name: 'Send WhatsApp',
    url: 'http://localhost:5173/api/supabase/functions/send-whatsapp',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: '+5511999999999',
      message: 'Test WhatsApp message'
    }),
    expectedStatus: 200,
    maxResponseTime: 300 // 300ms max
  }
];

async function testEdgeFunction(test: EdgeFunctionTest): Promise<TestResult> {
  const startTime = performance.now();
  
  try {
    const options: RequestInit = {
      method: test.method,
      headers: test.headers || {},
      body: test.body
    };

    const response = await fetch(test.url, options);
    const endTime = performance.now();
    const responseTime = endTime - startTime;
    
    const passed = response.status === test.expectedStatus && responseTime <= test.maxResponseTime;
    
    return {
      name: test.name,
      status: passed ? 'PASS' : 'FAIL',
      responseTime,
      statusCode: response.status,
      details: `Expected status ${test.expectedStatus}, got ${response.status}. Response time: ${responseTime.toFixed(2)}ms (max: ${test.maxResponseTime}ms)`
    };
    
  } catch (error) {
    const endTime = performance.now();
    const responseTime = endTime - startTime;
    
    return {
      name: test.name,
      status: 'FAIL',
      responseTime,
      statusCode: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: `Request failed after ${responseTime.toFixed(2)}ms: ${error}`
    };
  }
}

async function runPerformanceTests(): Promise<void> {
  console.log('🚀 Starting Edge Functions Performance Validation');
  console.log('=' .repeat(60));
  console.log('');

  const results: TestResult[] = [];
  
  for (const test of EDGE_FUNCTIONS) {
    console.log(`Testing: ${test.name}...`);
    const result = await testEdgeFunction(test);
    results.push(result);
    
    console.log(`  ${result.status === 'PASS' ? '✅' : '❌'} ${result.name}`);
    console.log(`     Response Time: ${result.responseTime.toFixed(2)}ms`);
    console.log(`     Status Code: ${result.statusCode}`);
    console.log(`     Details: ${result.details}`);
    
    if (result.error) {
      console.log(`     Error: ${result.error}`);
    }
    
    console.log('');
    
    // Small delay between tests to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Generate summary report
  generateReport(results);
}

function generateReport(results: TestResult[]): void {
  console.log('📊 EDGE FUNCTIONS PERFORMANCE REPORT');
  console.log('=' .repeat(60));
  
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const total = results.length;
  
  console.log(`Total Tests: ${total}`);
  console.log(`Passed: ${passed} (${((passed/total)*100).toFixed(1)}%)`);
  console.log(`Failed: ${failed} (${((failed/total)*100).toFixed(1)}%)`);
  console.log('');
  
  // Performance statistics
  const responseTimes = results.map(r => r.responseTime);
  const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
  const minResponseTime = Math.min(...responseTimes);
  const maxResponseTime = Math.max(...responseTimes);
  
  console.log('⚡ Performance Statistics:');
  console.log(`  Average Response Time: ${avgResponseTime.toFixed(2)}ms`);
  console.log(`  Minimum Response Time: ${minResponseTime.toFixed(2)}ms`);
  console.log(`  Maximum Response Time: ${maxResponseTime.toFixed(2)}ms`);
  console.log('');
  
  // Failed tests details
  if (failed > 0) {
    console.log('❌ Failed Tests:');
    results.filter(r => r.status === 'FAIL').forEach(result => {
      console.log(`  - ${result.name}: ${result.details}`);
    });
    console.log('');
  }
  
  // Recommendations
  console.log('💡 Recommendations:');
  if (avgResponseTime > 100) {
    console.log('  ⚠️  Average response time is above 100ms. Consider optimizing Edge Functions.');
  }
  if (failed > 0) {
    console.log('  ⚠️  Some Edge Functions are failing. Review error logs and fix issues.');
  }
  if (maxResponseTime > 500) {
    console.log('  ⚠️  Some functions are taking too long (>500ms). Consider implementing caching or optimization.');
  }
  
  console.log('');
  console.log('✅ Edge Functions Performance Validation Complete!');
  
  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

// Run the tests
runPerformanceTests().catch(error => {
  console.error('Error running performance tests:', error);
  process.exit(1);
});

export { testEdgeFunction, runPerformanceTests };