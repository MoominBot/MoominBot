import BaseCommand from "#base/BaseCommand";
import { inject, injectable } from "tsyringe";
import { kClient, kPrisma } from "#utils/tokens";
import { Client, CommandInteraction, Permissions, MessageEmbed } from "discord.js";
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

        if (!server || !server.modlog || !interaction.guild?.channels.cache.has(server.modlog)) {
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

        const entryCase = new ModLogCase({
            guild: entry.guild,
            reason: entry.reason,
            moderator: entry.moderator,
            target: entry.target,
            timestamp: new Date(entry.timestamp).getTime(),
            type: entry.type
        });

        const logEmbed = new MessageEmbed()
            .setColor(entryCase.color)
            .setTimestamp(entryCase.timestamp)
            .setTitle(`${entryCase.type} | case #${entry.case_id}`)
            .addField("User", `${this.client.users.cache.get(entry.target)?.tag || "Unknown"} (\`${entry.target}\`)`, true)
            .addField("Moderator", `${this.client.users.cache.get(entry.moderator)?.tag || interaction.user.tag} (\`${entry.moderator || interaction.user.id}\`)`, true)
            .addField("Reason", entry.reason === "N/A" ? `Moderator do \`/reason ${entry.case_id} <reason>\`` : entry.reason, false)
            .setFooter(`Entry id: ${entry.id}`);

        return await interaction.followUp({
            embeds: [logEmbed],
            content: `[Jump to original message](https://discord.com/channels/${entry.guild}/${entry.channel}/${entry.message})`
        });
    }
}
