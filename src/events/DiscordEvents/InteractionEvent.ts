import { Collection, Interaction } from "discord.js";
import { injectable, inject } from "tsyringe";

import BaseCommand from "#base/BaseCommand.js";
import BaseEvent from "#base/BaseEvent";

import { kCommands } from "#utils/tokens";
import logger from "#utils/logger";

@injectable()
export default class extends BaseEvent {
    constructor(@inject(kCommands) public readonly commands: Collection<string, BaseCommand>) {
        super("interactionCreate");
    }

    async execute(interaction: Interaction) {
        if (interaction.isCommand() || interaction.isContextMenu()) {
            const command = this.commands.get(interaction.commandName);
            if (!command) return;

            try {
                await command.execute(interaction);
            } catch (err) {
                const error = err as Error;
                logger.error(`[${interaction.commandName}] Command execution error:\n${error.stack || error}`);
            }
        }
    }
}
