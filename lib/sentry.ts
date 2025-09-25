// Sentry stub implementation for deployment
export const initSentry = () => {
  // Sentry integration disabled for deployment
  console.log('Sentry integration disabled');
};

// Mock Sentry export
export const Sentry = {
  captureException: (error: any) => console.error('Error:', error),
  captureMessage: (message: string) => console.log('Message:', message),
  addBreadcrumb: (breadcrumb: any) => console.log('Breadcrumb:', breadcrumb),
};
