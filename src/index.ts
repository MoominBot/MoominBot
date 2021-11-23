import "reflect-metadata";
import { config } from "dotenv";
import "./events/ProcessEvents/handlers.js";
import { container } from "tsyringe";
import { kClient } from "./constants.js";
import Discord from "discord.js";
import readdirp from "readdirp";
import BaseEvent from "./base/BaseEvent.js";
import { fileURLToPath } from "url";
import { dirname } from "path";

config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const client = new Discord.Client<true>({
    intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES],
    ws: {
        properties: {
            $browser: "Discord Android"
        }
    },
    allowedMentions: {
        parse: []
    },
    shards: "auto",
    userAgentSuffix: ["MoominBot"],
    presence: {
        activities: [
            {
                name: "in Moomin Valley",
                type: "PLAYING"
            }
        ],
        status: "dnd"
    }
});

container.register(kClient, { useValue: client });

const events = readdirp(`${__dirname}/events/DiscordEvents`, {
    fileFilter: ["*.js"],
    directoryFilter: ["!typings"]
});

for await (const eventFile of events) {
    const event = container.resolve<BaseEvent>(await import(`file://${eventFile.fullPath}`).then((x) => x.default));
    client.on(event.name, event.execute.bind(event));
}

await client.login();
