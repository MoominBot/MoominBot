import { Client, CommandInteraction } from "discord.js";
import { inject, injectable } from "tsyringe";

import BaseCommand from "#base/BaseCommand";
import { kClient, kPrisma } from "#utils/tokens";
import { ConfigCommands } from "#interactions/slash/Config/ConfigCommand";
import type { PrismaClient } from "@prisma/client";
import RONBConfig from "./subcommands/setRONB.js";

@injectable()
export default class extends BaseCommand {
    constructor(@inject(kClient) public client: Client<true>, @inject(kPrisma) public prisma: PrismaClient) {
        super({
            name: "config",
            category: "Config"
        });
    }

    async execute(interaction: CommandInteraction<"cached">) {
        await interaction.deferReply({ ephemeral: true });
        // https://github.com/discord/discord-api-docs/issues/2315
        if (!interaction.member?.permissions.has?.("MANAGE_GUILD"))
            return await interaction.followUp({
                content: "❌ | You don't have `MANAGE_GUILD` permission to use this command."
            });
        const commandName = interaction.options.getSubcommand(false);

        switch (commandName) {
            case ConfigCommands.RONB: {
                return await RONBConfig(interaction, this.prisma);
            }
            default:
                return await interaction.followUp({ content: "Not implemented!" });
        }
    }
}
