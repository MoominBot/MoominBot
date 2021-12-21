import BaseCommand from "#base/BaseCommand";
import { inject, injectable } from "tsyringe";
import { kClient, kPrisma } from "#utils/tokens";
import { Client, CommandInteraction, Permissions } from "discord.js";
import { ModLogCase } from "#utils/ModLogCase";
import type { PrismaClient } from "@prisma/client";

@injectable()
export default class extends BaseCommand {
    constructor(@inject(kClient) public readonly client: Client<true>, @inject(kPrisma) public prisma: PrismaClient) {
        super({
            name: "case",
            category: "Moderation"
        });
    }

    async execute(interaction: CommandInteraction) {
        await interaction.deferReply();

        if (!interaction.memberPermissions?.has(Permissions.FLAGS.MANAGE_MESSAGES)) {
            return await interaction.followUp({ content: "You don't have the required permissions to run this command", ephemeral: true });
        }

        const server = await this.prisma.guild.findFirst({
            where: {
                id: interaction.guildId
            }
        });

        if (!server || !server.modlog) {
            return await interaction.followUp({ content: "No mod log channel found for this server" });
        }

        const caseId = interaction.options.getNumber("case", true);

        const entry = await this.prisma.modLogCase.findFirst({
            where: {
                case_id: caseId,
                guild: interaction.guildId
            }
        });

        if (!entry) return await interaction.followUp({ content: "❌ | No infraction found with that case id" });

        const logEmbed = await ModLogCase.createEmbed(entry);

        return await interaction.followUp({
            embeds: [logEmbed],
            content: `[Jump to original message](https://discord.com/channels/${entry.guild}/${entry.channel}/${entry.message})`
        });
    }
}
