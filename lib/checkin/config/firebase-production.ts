/**
 * 🔥 Firebase Production Configuration
 *
 * Configuração real do Firebase para produção usando os dados fornecidos
 */

import { FirebaseV1Adapter } from '../notifications/FirebaseV1Adapter';
import { logger } from '../../logger';

// Configuração do Firebase para produção
export const FIREBASE_PRODUCTION_CONFIG = {
  projectId: 'dudufisio-3831a',
  vapidKey: 'BEl79InKBILei-QaF0alLUiU63A38ZLoQpq-sb9rXaJcOvV-KQuBoSGjVnr4Vxz7A09DeUAKZoI1l6_qCPBywtc',
  // Admin SDK será carregado das variáveis de ambiente
  adminSdkFromEnv: true
};

// Configuração do FCM para o sistema de check-in
export const getFCMConfig = () => {
  return {
    projectId: process.env.FCM_PROJECT_ID || FIREBASE_PRODUCTION_CONFIG.projectId,
    vapidKey: process.env.VAPID_KEY || FIREBASE_PRODUCTION_CONFIG.vapidKey,
    adminSdk: process.env.FIREBASE_ADMIN_SDK
  };
};

// Factory para criar instância do Firebase adapter
export const createFirebaseAdapter = (): FirebaseV1Adapter | null => {
  return FirebaseV1Adapter.fromEnvironment();
};

// Configuração do Web App Firebase (para cliente)
export const FIREBASE_WEB_CONFIG = {
  apiKey: "sua-api-key", // Obtido do Firebase Console se necessário
  authDomain: "dudufisio-3831a.firebaseapp.com",
  projectId: "dudufisio-3831a",
  storageBucket: "dudufisio-3831a.appspot.com",
  messagingSenderId: "823218682207",
  appId: "sua-app-id", // Obtido do Firebase Console se necessário
  vapidKey: FIREBASE_PRODUCTION_CONFIG.vapidKey
};

// Validação da configuração
export const validateFirebaseConfig = (): boolean => {
  const config = getFCMConfig();

  const requiredFields = ['projectId', 'vapidKey', 'adminSdk'];
  const missingFields = requiredFields.filter(field => !config[field as keyof typeof config]);

  if (missingFields.length > 0) {
    logger.error('Missing Firebase configuration fields.', { context: 'checkin.firebase.config', data: { missingFields } });
    return false;
  }

  // Validar formato do Admin SDK JSON
  if (config.adminSdk) {
    try {
      const adminSdk = JSON.parse(config.adminSdk);
      if (!adminSdk.project_id || !adminSdk.private_key || !adminSdk.client_email) {
        logger.error('Invalid Firebase Admin SDK format.', { context: 'checkin.firebase.config' });
        return false;
      }
    } catch (error) {
      logger.error('Invalid Firebase Admin SDK JSON.', { context: 'checkin.firebase.config', data: { error } });
      return false;
    }
  }

  return true;
};

// Status da configuração para debugging
export const getFirebaseConfigStatus = () => {
  const config = getFCMConfig();

  return {
    projectId: config.projectId ? '✅ Configured' : '❌ Missing',
    vapidKey: config.vapidKey ? '✅ Configured' : '❌ Missing',
    adminSdk: config.adminSdk ? '✅ Configured' : '❌ Missing',
    isValid: validateFirebaseConfig()
  };
};

// Exemplo de uso:
/*
import { createFirebaseAdapter, validateFirebaseConfig } from './firebase-production';

if (validateFirebaseConfig()) {
  const firebase = createFirebaseAdapter();
  if (firebase) {
    logger.info('Firebase configurado com sucesso.');
  }
} else {
  logger.error('Configuração Firebase inválida.');
}
*/