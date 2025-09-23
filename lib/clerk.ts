import { ClerkProvider } from '@clerk/clerk-react';

export const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPublishableKey) {
  console.warn('Missing Clerk Publishable Key. Authentication features will be disabled.');
}

export { ClerkProvider };
