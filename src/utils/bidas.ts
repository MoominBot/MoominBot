import fetch from "node-fetch";
import { container, inject, injectable } from "tsyringe";
import type { Redis } from "ioredis";

import { kRedis } from "#utils/tokens";
import logger from "#utils/logger";
import { APIResponse } from "src/typings/bidas";



@injectable()
class Bidas {
    public BASE_URL = "https://api.nepalipatro.com.np/goverment-holidays/2079";
    constructor(@inject(kRedis) public readonly redis: Redis) {
        this.fetch();
    }

    public async fetch() {
        const response = await fetch(this.BASE_URL).then((res) => {
            if (!res.ok) return null;
            return res.json();
        }).catch(() => null);

        await this.redis.set("bidas", JSON.stringify(response));
        logger.info("[Redis - Bidas] Bidas cached successfully!")
        return response;
    }

    public async get() {
        const cache = await this.redis.get("bidas");
        if (!cache) return null;
        return JSON.parse(cache) as APIResponse;
    }
}

export default container.resolve(Bidas)