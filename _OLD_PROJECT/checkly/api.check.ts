import { ApiCheck } from 'checkly/constructs';

new ApiCheck('website-health-check', {
  name: 'Website Health Check',
  degradedResponseTime: 5000,
  maxResponseTime: 10000,
  request: {
    method: 'GET',
    url: '{{ENVIRONMENT_URL}}',
  },
  runParallel: true,
});
