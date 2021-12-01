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
        if (interaction.isCommand() || interaction.isContextMenu() || interaction.isAutocomplete()) {
            if (!interaction.inGuild())
                return !interaction.isAutocomplete()
                    ? await interaction.reply({
                          content: "❌ | MoominBot commands are guild only!",
                          ephemeral: true
                      })
                    : null;

            const command = this.commands.get(interaction.commandName);
            if (!command) return;

            try {
                await command.execute(interaction);
            } catch (err) {
                const error = err as Error;
                logger.error(`[${interaction.commandName}] Command execution error:\n${error.stack || error}`);
                await this.replyError(interaction, `❌ | Command ${interaction.commandName} failed to execute!`).catch(() => null);
            }
        }
    }

    async replyError(interaction: Interaction, message: string) {
        if (interaction.isAutocomplete() && !interaction.responded) interaction.respond([]);
        if ((interaction.isCommand() || interaction.isContextMenu()) && (!interaction.replied || !interaction.deferred)) {
            if (interaction.deferred) return await interaction.followUp({ content: message, ephemeral: true });
            return await interaction.reply({ content: message, ephemeral: true });
        }
    }
}
