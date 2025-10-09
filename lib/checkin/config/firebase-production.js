/**
 * 🔥 Firebase Production Configuration
 *
 * Configuração real do Firebase para produção usando os dados fornecidos
 */
import { FirebaseV1Adapter } from '../notifications/FirebaseV1Adapter';
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
export const createFirebaseAdapter = () => {
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
export const validateFirebaseConfig = () => {
    const config = getFCMConfig();
    const requiredFields = ['projectId', 'vapidKey', 'adminSdk'];
    const missingFields = requiredFields.filter(field => !config[field]);
    if (missingFields.length > 0) {
        console.error('Missing Firebase configuration fields:', missingFields);
        return false;
    }
    // Validar formato do Admin SDK JSON
    if (config.adminSdk) {
        try {
            const adminSdk = JSON.parse(config.adminSdk);
            if (!adminSdk.project_id || !adminSdk.private_key || !adminSdk.client_email) {
                console.error('Invalid Firebase Admin SDK format');
                return false;
            }
        }
        catch (error) {
            console.error('Invalid Firebase Admin SDK JSON:', error);
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
    console.log('✅ Firebase configurado com sucesso!');
  }
} else {
  console.error('❌ Configuração Firebase inválida');
}
*/ 
