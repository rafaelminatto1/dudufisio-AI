import { BrowserCheck, Frequency } from 'checkly/constructs';

new BrowserCheck('homepage-check', {
  name: 'Homepage Check',
  frequency: Frequency.EVERY_5M,
  locations: ['us-east-1', 'eu-west-1'],
  code: {
    entrypoint: './homepage.spec.ts',
  },
});

new BrowserCheck('login-flow-check', {
  name: 'Login Flow Check',
  frequency: Frequency.EVERY_10M,
  locations: ['us-east-1'],
  code: {
    entrypoint: './login.spec.ts',
  },
});