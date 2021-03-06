import "reflect-metadata";
import { config } from "dotenv";

import "./tsxLoader.js";

import "./events/ProcessEvents/handlers.js";

import { container } from "tsyringe";
import Discord from "discord.js";
import readdirp from "readdirp";

import { kClient, kCommands, kRedis, kPrisma } from "#utils/tokens";
import { __dirname } from "#utils/dirname";
import logger from "#utils/logger";

import BaseEvent from "#base/BaseEvent";
import BaseCommand from "#base/BaseCommand";

import DeployCommand from "./deployCommands.js";
import redis from "./database/redis.js";
import prisma from "./database/prisma.js";

config();

const client = new Discord.Client<true>({
    intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES, Discord.Intents.FLAGS.GUILD_MEMBERS, Discord.Intents.FLAGS.GUILD_PRESENCES],
    allowedMentions: {
        parse: []
    },
    shards: "auto",
    userAgentSuffix: ["MoominBot"],
    presence: {
        status: "idle",
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
container.register(kPrisma, { useValue: prisma });

const events = readdirp(`${__dirname(import.meta.url)}/events/DiscordEvents`, {
    fileFilter: ["*.js"],
    directoryFilter: ["!typings", "!utils", "!subcommands"]
});

const commands = readdirp(`${__dirname(import.meta.url)}/commands`, {
    fileFilter: ["*.js"],
    directoryFilter: ["!typings", "!utils", "!subcommands"]
});

for await (const eventFile of events) {
    const event = container.resolve<BaseEvent>(await import(`file://${eventFile.fullPath}`).then((x) => x.default));
    client.on(event.name, event.execute.bind(event));
    logger.info(`Loaded event ${event.name}!`);
}

for await (const commandFile of commands) {
    const command = container.resolve<BaseCommand>(await import(`file://${commandFile.fullPath}`).then((x) => x.default));
    command.setPath(commandFile.fullPath);
    commandsStore.set(command.config.name, command);
    logger.info(`Loaded command ${command.config.name}!`);
}

await DeployCommand();
await client.login();
await import("./jobsLoader.js");
