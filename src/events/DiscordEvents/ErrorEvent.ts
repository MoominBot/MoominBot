import BaseEvent from "#base/BaseEvent";
import logger from "#utils/logger";
import webhookLogger from "#utils/webhookLogger";

export default class extends BaseEvent {
    constructor() {
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
                    timestamp: Date.now()
                }
            ]
        });
    }
}
