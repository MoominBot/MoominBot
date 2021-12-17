import { Client, CommandInteraction, MessageEmbed } from "discord.js";
import { inject, injectable } from "tsyringe";

import BaseCommand from "#base/BaseCommand";
import { kClient, kPrisma } from "#utils/tokens";
import { ConfigCommands } from "#interactions/slash/Config/ConfigCommand";
import type { PrismaClient } from "@prisma/client";
import RONBConfig from "./subcommands/setRONB.js";
import ModLogConfig from "./subcommands/modLogConfig.js";

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
            case ConfigCommands.MODLOG: {
                return await ModLogConfig(interaction, this.prisma);
            }
            case ConfigCommands.PANEL: {
                const guildData = await this.prisma.guild.findFirst({
                    where: {
                        id: interaction.guildId
                    }
                });

                const embed = new MessageEmbed()
                    .setAuthor(`${interaction.guild.name} - Config`, interaction.guild.iconURL()!)
                    .setColor("BLURPLE")
                    .setTimestamp()
                    .addField("Routine of Nepal Banda feed", !guildData?.ronb ? "❌ | Disabled" : `✅ | <#${guildData.ronb}>`)
                    .addField("Moderation Log", !guildData?.modlog ? "❌ | Disabled" : `✅ | <#${guildData.modlog}>`)
                    .setFooter("Server config panel");

                return await interaction.followUp({ embeds: [embed] });
            }
            default:
                return await interaction.followUp({ content: "Not implemented!" });
        }
    }
}
