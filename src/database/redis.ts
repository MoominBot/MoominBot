import Redis from "ioredis";

import logger from "#utils/logger";

const redis = new Redis(process.env.REDIS_HOST!, {
    password: process.env.REDIS_PASWORD,
    lazyConnect: true
});

// connect to Redis
await redis.connect().then(() => {
    logger.info("[Redis] Connection successful!");
});

export default redis;
