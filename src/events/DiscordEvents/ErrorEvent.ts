import BaseEvent from "#base/BaseEvent";
import logger from "#utils/logger";
import webhookLogger from "#utils/webhookLogger";
import { injectable, inject } from "tsyringe";
import { kClient } from "#utils/tokens";
import type { Client } from "discord.js";

@injectable()
export default class extends BaseEvent {
    constructor(@inject(kClient) public client: Client) {
        super("error");
    }

    public override async execute(errorMessage: Error) {
        logger.error(errorMessage.stack ?? errorMessage);

        await webhookLogger.log({
            embeds: [
                {
                    color: "RED",
                    title: "Error",
                    description: errorMessage.stack ?? `${errorMessage}`,
                    timestamp: Date.now(),
                    footer: {
                        text: this.client.user?.tag,
                        iconURL: this.client.user?.displayAvatarURL()
                    }
                }
            ]
        });
    }
}
