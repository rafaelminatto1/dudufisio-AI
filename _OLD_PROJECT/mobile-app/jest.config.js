module.exports = {
  preset: 'jest-expo/ios',
  setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|expo(nent)?|@expo|@unimodules|sentry-expo|native-base|rn-fetch-blob)',
  ],
};

