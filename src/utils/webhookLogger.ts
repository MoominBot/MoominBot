import { inject, injectable, container } from "tsyringe";
import { WebhookClient, Client, MessagePayload, WebhookMessageOptions } from "discord.js";
import { kClient } from "./tokens.js";

@injectable()
class WebookLogger {
    private webhook = new WebhookClient({
        url: process.env.LOGS_WEBHOOK!
    });
    constructor(@inject(kClient) public readonly client: Client<true>) {}

    log(data: string | MessagePayload | WebhookMessageOptions) {
        return this.webhook.send(data).catch(() => null);
    }
}

export default container.resolve(WebookLogger);
