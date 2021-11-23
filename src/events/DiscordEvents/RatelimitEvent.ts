import type { RateLimitData } from "discord.js";
import BaseEvent from "../../base/BaseEvent.js";
import logger from "../../logger.js";
import { stripIndents } from "common-tags";

export default class extends BaseEvent {
    constructor() {
        super("rateLimit");
    }

    public override execute(ratelimit: RateLimitData) {
        logger.warn(stripIndents`Rate limited by discord:
            Global: ${ratelimit.global}
            Route: ${ratelimit.route}
            Path: ${ratelimit.path}
            HTTP Method: ${ratelimit.method}
            Limit: ${ratelimit.limit}
            Timeout: ${ratelimit.timeout}
        `);
    }
}
