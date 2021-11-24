import type { RateLimitData } from "discord.js";
import { stripIndents } from "common-tags";

import BaseEvent from "#base/BaseEvent";
import logger from "#utils/logger";

export default class extends BaseEvent {
    constructor() {
        super("rateLimit");
    }

    public override execute(ratelimit: RateLimitData) {
        logger.warn(stripIndents`Rate limited by Discord:
            Global: ${ratelimit.global}
            Route: ${ratelimit.route}
            Path: ${ratelimit.path}
            HTTP Method: ${ratelimit.method}
            Limit: ${ratelimit.limit}
            Timeout: ${ratelimit.timeout}
        `);
    }
}
