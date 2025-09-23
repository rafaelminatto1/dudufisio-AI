import { defineConfig } from 'checkly';

const config = defineConfig({
  projectName: 'DuduFisio AI',
  logicalId: 'dudufisio-ai',
  repoUrl: 'https://github.com/your-username/dudufisio-ai',
  checks: {
    frequency: 5, // Check every 5 minutes
    locations: ['us-east-1', 'eu-west-1'],
    tags: ['website', 'api'],
    runtimeId: '2022.10',
    environmentVariables: [],
  },
  cli: {
    runLocation: 'eu-west-1',
  },
  alertChannels: [],
});

export default config;
