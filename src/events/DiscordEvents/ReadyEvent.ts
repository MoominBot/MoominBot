import { ActivityOptions, Client } from "discord.js";

import BaseEvent from "#base/BaseEvent";
import webhookLogger from "#utils/webhookLogger";

export default class extends BaseEvent {
    constructor() {
        super("ready");
    }

    public override async execute(client: Client<true>) {
        if (!client.application?.commands) await client.application.fetch();

        // eslint-disable-next-line no-console
        console.log(`Logged in as ${client.user.tag}!`);

        await webhookLogger.log({
            embeds: [
                {
                    color: "GREEN",
                    title: "Bot is online!",
                    description: `Connected to discord at <t:${Math.floor(client.readyTimestamp / 1000)}:F>`
                }
            ]
        });

        this.createActivity(client);
    }

    createActivity(client: Client<true>) {
        const activities = [
            {
                name: `${client.guilds.cache.size.toLocaleString()} servers`,
                type: "COMPETING"
            },
            {
                name: `with ${client.users.cache.size.toLocaleString()} users`,
                type: "PLAYING"
            },
            {
                name: "with Moomins",
                type: "PLAYING"
            },
            {
                name: "Moomin Valley",
                type: "WATCHING"
            },
            {
                name: "Moomin Aama",
                type: "LISTENING"
            },
            {
                name: "Moomin",
                url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                type: "STREAMING"
            }
        ] as ActivityOptions[];

        setInterval(() => {
            client.user.setActivity(activities[Math.floor(Math.random() * activities.length)]);
        }, 60_000).unref();
    }
}
