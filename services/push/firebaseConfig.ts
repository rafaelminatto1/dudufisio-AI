/**
 * Firebase Configuration for Push Notifications
 * MoocaFisio
 */

import { initializeApp, FirebaseApp } from 'firebase/app';
import { getMessaging, Messaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;

/**
 * Initialize Firebase App
 */
export const initializeFirebase = (): FirebaseApp => {
  if (!app) {
    app = initializeApp(firebaseConfig);
    console.log('[Firebase] App initialized');
  }
  return app;
};

/**
 * Get Firebase Messaging instance
 */
export const getMessagingInstance = (): Messaging | null => {
  if (typeof window === 'undefined') {
    console.warn('[Firebase] Window is undefined, cannot initialize messaging');
    return null;
  }

  if (!messaging) {
    try {
      const firebaseApp = initializeFirebase();
      messaging = getMessaging(firebaseApp);
      console.log('[Firebase] Messaging initialized');
    } catch (error) {
      console.error('[Firebase] Error initializing messaging:', error);
      return null;
    }
  }
  return messaging;
};

/**
 * Request notification permission and get FCM token
 */
export const requestNotificationPermission = async (): Promise<string | null> => {
  try {
    if (!('Notification' in window)) {
      console.warn('[Firebase] Notifications not supported in this browser');
      return null;
    }

    if (Notification.permission === 'granted') {
      console.log('[Firebase] Notification permission already granted');
      return await getFCMToken();
    }

    if (Notification.permission === 'denied') {
      console.warn('[Firebase] Notification permission denied');
      return null;
    }

    // Request permission
    console.log('[Firebase] Requesting notification permission...');
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('[Firebase] Notification permission granted');
      return await getFCMToken();
    }

    console.warn('[Firebase] Notification permission not granted:', permission);
    return null;
  } catch (error) {
    console.error('[Firebase] Error requesting permission:', error);
    return null;
  }
};

/**
 * Get FCM token
 */
export const getFCMToken = async (): Promise<string | null> => {
  try {
    const messagingInstance = getMessagingInstance();
    if (!messagingInstance) {
      console.error('[Firebase] Messaging instance not available');
      return null;
    }

    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
      console.error('[Firebase] VAPID key not configured');
      return null;
    }

    // Ensure service worker is registered and ready
    if ('serviceWorker' in navigator) {
      try {
        console.log('[Firebase] Checking service worker registration...');
        const registration = await navigator.serviceWorker.getRegistration('/');

        if (!registration) {
          console.log('[Firebase] No service worker registered, registering now...');
          await navigator.serviceWorker.register('/firebase-messaging-sw.js');
          // Wait for service worker to be ready
          await navigator.serviceWorker.ready;
          console.log('[Firebase] Service Worker registered and ready');
        } else {
          console.log('[Firebase] Service Worker already registered');
          // Make sure it's ready
          await navigator.serviceWorker.ready;
        }
      } catch (swError) {
        console.error('[Firebase] Service Worker registration error:', swError);
        return null;
      }
    } else {
      console.error('[Firebase] Service Worker not supported');
      return null;
    }

    console.log('[Firebase] Getting FCM token...');
    const token = await getToken(messagingInstance, { vapidKey });

    if (token) {
      console.log('[Firebase] FCM token obtained:', token.substring(0, 20) + '...');
      return token;
    } else {
      console.warn('[Firebase] No FCM token returned');
      return null;
    }
  } catch (error) {
    console.error('[Firebase] Error getting FCM token:', error);
    return null;
  }
};

/**
 * Listen for foreground messages
 */
export const onForegroundMessage = (callback: (payload: any) => void): (() => void) => {
  const messagingInstance = getMessagingInstance();
  if (!messagingInstance) {
    console.warn('[Firebase] Cannot listen for messages, messaging not initialized');
    return () => {};
  }

  console.log('[Firebase] Setting up foreground message listener');
  return onMessage(messagingInstance, (payload) => {
    console.log('[Firebase] Foreground message received:', payload);
    callback(payload);
  });
};

/**
 * Check if Firebase is configured
 */
export const isFirebaseConfigured = (): boolean => {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId
  );
};

/**
 * Get current notification permission status
 */
export const getNotificationPermission = (): NotificationPermission => {
  if (!('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
};

/**
 * Check if notifications are supported
 */
export const isNotificationSupported = (): boolean => {
  return 'Notification' in window && 'serviceWorker' in navigator;
};

