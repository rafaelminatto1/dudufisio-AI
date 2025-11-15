/**
 * Shim que mantém a rota `/api/webhooks/whatsapp` compatível enquanto
 * a versão edge (whatsapp-edge.ts) assume 100% do tráfego.
 */
export { config } from './whatsapp-edge'
export { default } from './whatsapp-edge'
