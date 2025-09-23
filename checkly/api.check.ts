import { ApiCheck, AssertionBuilder } from 'checkly/constructs';

new ApiCheck('api-health-check', {
  name: 'API Health Check',
  degradedResponseTime: 5000,
  maxResponseTime: 10000,
  request: {
    method: 'GET',
    url: '{{ENVIRONMENT_URL}}/api/health',
    assertions: [
      AssertionBuilder.statusCode().equals(200),
      AssertionBuilder.responseTime().lessThan(5000),
    ],
  },
  runParallel: true,
});

new ApiCheck('supabase-connection-check', {
  name: 'Supabase Connection Check',
  degradedResponseTime: 3000,
  maxResponseTime: 8000,
  request: {
    method: 'GET',
    url: '{{ENVIRONMENT_URL}}/api/patients',
    headers: {
      'Authorization': 'Bearer {{SUPABASE_ANON_KEY}}',
    },
    assertions: [
      AssertionBuilder.statusCode().between(200, 299),
      AssertionBuilder.responseTime().lessThan(3000),
    ],
  },
  runParallel: true,
});