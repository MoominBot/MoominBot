import "reflect-metadata";
import { config } from "dotenv";
import "./events/ProcessEvents/handlers.js";
import { container } from "tsyringe";
import { kClient, kCommands, kRedis } from "./constants.js";
import Discord from "discord.js";
import readdirp from "readdirp";
import BaseEvent from "./base/BaseEvent.js";
import BaseCommand from "./base/BaseCommand.js";
import DeployCommand from "./deployCommands.js";
import { __dirname } from "./utils/dirname.js";
import logger from "./logger.js";
import redis from "./database/redis.js";

config();

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
        ]
    }
});

const commandsStore = new Discord.Collection<string, BaseCommand>();

container.register(kClient, { useValue: client });
container.register(kCommands, { useValue: commandsStore });
container.register(kRedis, { useValue: redis });

const events = readdirp(`${__dirname(import.meta.url)}/events/DiscordEvents`, {
    fileFilter: ["*.js"],
    directoryFilter: ["!typings", "!utils"]
});

const commands = readdirp(`${__dirname(import.meta.url)}/commands`, {
    fileFilter: ["*.js"],
    directoryFilter: ["!typings", "!utils"]
});

for await (const eventFile of events) {
    const event = container.resolve<BaseEvent>(await import(`file://${eventFile.fullPath}`).then((x) => x.default));
    client.on(event.name, event.execute.bind(event));
    logger.info(`Loaded event ${event.name}!`);
}

for await (const commandFile of commands) {
    const command = container.resolve<BaseCommand>(await import(`file://${commandFile.fullPath}`).then((x) => x.default));
    commandsStore.set(command.config.name, command);
    logger.info(`Loaded command ${command.config.name}!`);
}

await DeployCommand();
await client.login();
