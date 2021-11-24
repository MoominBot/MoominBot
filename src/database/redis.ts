import Redis from "ioredis";
import logger from "../logger.js";

const redis = new Redis(process.env.REDIS_HOST!, {
    lazyConnect: true
});

// connect to Redis
await redis.connect().then(() => {
    logger.info("[Redis] Connection successful!");
});

export default redis;
