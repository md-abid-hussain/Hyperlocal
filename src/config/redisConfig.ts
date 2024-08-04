import IORedis from 'ioredis';

export const connection = new IORedis({
  port: 6379,
  host: 'localhost',
  maxRetriesPerRequest: null,
});
