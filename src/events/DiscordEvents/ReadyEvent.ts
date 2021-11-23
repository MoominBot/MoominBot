import type { Client } from "discord.js";
import BaseEvent from "../../base/BaseEvent.js";

export default class extends BaseEvent {
    constructor() {
        super("ready");
    }

    public override execute(client: Client<true>) {
        // TODO: use logger instead of console
        // eslint-disable-next-line no-console
        console.log(`Logged in as ${client.user.tag}!`);
    }
}
