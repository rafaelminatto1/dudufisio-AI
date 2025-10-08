/**
 * 📱 WhatsApp Business API - Configuration Helper
 * 
 * Helper para inicializar o WhatsApp Business Integration com as variáveis de ambiente
 */

import { WhatsAppBusinessConfig, WhatsAppBusinessIntegration } from './WhatsAppBusinessIntegration';
import { BusinessIntelligenceSystem } from '../../analytics/BusinessIntelligenceSystem';

/**
 * Obter configuração do WhatsApp Business API das variáveis de ambiente
 */
export function getWhatsAppBusinessConfig(): WhatsAppBusinessConfig {
  // Verificar se está usando WhatsApp Business API (não Web Client)
  const useWebClient = import.meta.env.VITE_WHATSAPP_USE_WEB_CLIENT === 'true';
  
  if (useWebClient) {
    throw new Error('WhatsApp Web Client não é suportado para Business API. Configure WHATSAPP_USE_WEB_CLIENT=false');
  }

  const accessToken = import.meta.env.VITE_WHATSAPP_BUSINESS_API_TOKEN;
  const phoneNumberId = import.meta.env.VITE_WHATSAPP_PHONE_NUMBER_ID;
  const webhookVerifyToken = import.meta.env.VITE_WHATSAPP_WEBHOOK_VERIFY_TOKEN;

  if (!accessToken) {
    throw new Error('WHATSAPP_BUSINESS_API_TOKEN não configurado no .env.local');
  }

  if (!phoneNumberId) {
    throw new Error('WHATSAPP_PHONE_NUMBER_ID não configurado no .env.local');
  }

  if (!webhookVerifyToken) {
    console.warn('⚠️ WHATSAPP_WEBHOOK_VERIFY_TOKEN não configurado - webhooks não funcionarão');
  }

  // Configuração padrão
  const config: WhatsAppBusinessConfig = {
    businessAccountId: phoneNumberId, // Pode ser diferente do phoneNumberId em alguns casos
    phoneNumberId: phoneNumberId,
    accessToken: accessToken,
    webhookVerifyToken: webhookVerifyToken || 'dudufisio_webhook_verify_2024',
    apiVersion: 'v18.0',
    baseUrl: 'https://graph.facebook.com/v18.0'
  };

  return config;
}

/**
 * Criar instância do WhatsApp Business Integration
 */
export function createWhatsAppBusinessIntegration(
  biSystem: BusinessIntelligenceSystem
): WhatsAppBusinessIntegration {
  try {
    const config = getWhatsAppBusinessConfig();
    return new WhatsAppBusinessIntegration(config, biSystem);
  } catch (error) {
    console.error('❌ Erro ao criar WhatsApp Business Integration:', error);
    throw error;
  }
}

/**
 * Verificar se o WhatsApp Business API está configurado
 */
export function isWhatsAppBusinessConfigured(): boolean {
  try {
    const accessToken = import.meta.env.VITE_WHATSAPP_BUSINESS_API_TOKEN;
    const phoneNumberId = import.meta.env.VITE_WHATSAPP_PHONE_NUMBER_ID;
    const useWebClient = import.meta.env.VITE_WHATSAPP_USE_WEB_CLIENT === 'true';

    return !useWebClient && Boolean(accessToken) && Boolean(phoneNumberId);
  } catch {
    return false;
  }
}

/**
 * Obter informações de configuração (para debug/UI)
 */
export function getWhatsAppConfigInfo(): {
  configured: boolean;
  useWebClient: boolean;
  hasAccessToken: boolean;
  hasPhoneNumberId: boolean;
  hasWebhookToken: boolean;
} {
  const useWebClient = import.meta.env.VITE_WHATSAPP_USE_WEB_CLIENT === 'true';
  const accessToken = import.meta.env.VITE_WHATSAPP_BUSINESS_API_TOKEN;
  const phoneNumberId = import.meta.env.VITE_WHATSAPP_PHONE_NUMBER_ID;
  const webhookToken = import.meta.env.VITE_WHATSAPP_WEBHOOK_VERIFY_TOKEN;

  return {
    configured: !useWebClient && Boolean(accessToken) && Boolean(phoneNumberId),
    useWebClient,
    hasAccessToken: Boolean(accessToken),
    hasPhoneNumberId: Boolean(phoneNumberId),
    hasWebhookToken: Boolean(webhookToken)
  };
}

/**
 * Validar configuração do WhatsApp Business API
 * @returns Array de erros (vazio se tudo OK)
 */
export function validateWhatsAppConfig(): string[] {
  const errors: string[] = [];

  const useWebClient = import.meta.env.VITE_WHATSAPP_USE_WEB_CLIENT === 'true';
  if (useWebClient) {
    errors.push('WHATSAPP_USE_WEB_CLIENT deve ser "false" para usar Business API');
  }

  const accessToken = import.meta.env.VITE_WHATSAPP_BUSINESS_API_TOKEN;
  if (!accessToken) {
    errors.push('WHATSAPP_BUSINESS_API_TOKEN não configurado');
  } else {
    // Validar formato do token (deve começar com EAA)
    if (!accessToken.startsWith('EAA')) {
      errors.push('WHATSAPP_BUSINESS_API_TOKEN parece inválido (deve começar com EAA)');
    }
  }

  const phoneNumberId = import.meta.env.VITE_WHATSAPP_PHONE_NUMBER_ID;
  if (!phoneNumberId) {
    errors.push('WHATSAPP_PHONE_NUMBER_ID não configurado');
  } else {
    // Validar que é um número (não tem formato específico, mas geralmente é numérico)
    if (!/^\d+$/.test(phoneNumberId)) {
      errors.push('WHATSAPP_PHONE_NUMBER_ID parece inválido (deve ser numérico)');
    }
  }

  const webhookToken = import.meta.env.VITE_WHATSAPP_WEBHOOK_VERIFY_TOKEN;
  if (!webhookToken) {
    errors.push('WHATSAPP_WEBHOOK_VERIFY_TOKEN não configurado (webhooks não funcionarão)');
  }

  return errors;
}

/**
 * Teste de conexão com WhatsApp Business API
 */
export async function testWhatsAppConnection(): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  try {
    const config = getWhatsAppBusinessConfig();

    // Fazer uma chamada simples à API para verificar a conexão
    const response = await fetch(
      `${config.baseUrl}/${config.phoneNumberId}`,
      {
        headers: {
          'Authorization': `Bearer ${config.accessToken}`
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: `Erro ao conectar: ${response.status} - ${response.statusText}`,
        details: errorData
      };
    }

    const data = await response.json();

    return {
      success: true,
      message: 'Conexão com WhatsApp Business API estabelecida com sucesso! ✅',
      details: data
    };
  } catch (error) {
    return {
      success: false,
      message: `Erro ao testar conexão: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      details: error
    };
  }
}



