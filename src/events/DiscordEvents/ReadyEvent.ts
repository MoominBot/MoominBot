import type { Client } from "discord.js";

import BaseEvent from "#base/BaseEvent";

export default class extends BaseEvent {
    constructor() {
        super("ready");
    }

    public override async execute(client: Client<true>) {
        if (!client.application?.commands) await client.application.fetch();

        // eslint-disable-next-line no-console
        console.log(`Logged in as ${client.user.tag}!`);
    }
}
