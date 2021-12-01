import type { Client } from "discord.js";

import BaseEvent from "#base/BaseEvent";
import prisma from "#database/prisma";

export default class extends BaseEvent {
    constructor() {
        super("ready");
    }

    async setupDatabase(client: Client<true>) {
        for (const guild of client.guilds.cache.values()) {
            try {
                if (!guild.available) continue;
                prisma.guild.upsert({
                    where: { id: guild.id },
                    create: {
                        id: guild.id,
                        blocked: false
                    },
                    update: {}
                });
            } catch {
                continue;
            }
        }
    }

    public override async execute(client: Client<true>) {
        if (!client.application?.commands) await client.application.fetch();
        await this.setupDatabase(client);

        // eslint-disable-next-line no-console
        console.log(`Logged in as ${client.user.tag}!`);
    }
}
