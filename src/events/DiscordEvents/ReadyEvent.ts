import type { Client } from "discord.js";

import BaseEvent from "#base/BaseEvent";
import logger from "#utils/logger";

export default class extends BaseEvent {
    constructor() {
        super("ready");
    }

    public override execute(client: Client<true>) {
        logger.info(`Logged in as ${client.user.tag}!`);
    }
}
