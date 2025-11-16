// lib/redis.ts
import Redis from 'redis';
const redisClientSingleton = () => {
    const client = Redis.createClient({
        url: process.env['REDIS_URL'] || 'redis://localhost:6379',
    });
    client.on('error', (err) => console.error('Redis Client Error', err));
    // Conecta ao Redis assim que a instância é criada.
    // O cliente gerencia a reconexão automaticamente.
    client.connect().catch(console.error);
    return client;
};
const redis = globalThis.redis ?? redisClientSingleton();
if (process.env['NODE_ENV'] !== 'production') {
    globalThis.redis = redis;
}
export default redis;
