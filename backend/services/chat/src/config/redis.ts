import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config({ path: '../../../../.env' });

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const pubClient = createClient({ url: redisUrl });
export const subClient = pubClient.duplicate();

pubClient.on('error', (err) => console.error('Redis Pub Client Error:', err));
subClient.on('error', (err) => console.error('Redis Sub Client Error:', err));
