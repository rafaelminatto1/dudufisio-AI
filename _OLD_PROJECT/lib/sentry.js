// Sentry stub implementation for deployment
export const initSentry = () => {
    // Sentry integration disabled for deployment
    console.log('Sentry integration disabled');
};
// Mock Sentry export
export const Sentry = {
    captureException: (error) => console.error('Error:', error),
    captureMessage: (message) => console.log('Message:', message),
    addBreadcrumb: (breadcrumb) => console.log('Breadcrumb:', breadcrumb),
};
