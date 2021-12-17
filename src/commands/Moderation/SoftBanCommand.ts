import BaseCommand from "#base/BaseCommand";
import { inject, injectable } from "tsyringe";
import { kClient, kPrisma } from "#utils/tokens";
import { Client, CommandInteraction, Permissions, MessageEmbed, GuildTextBasedChannel } from "discord.js";
import { ModLogCase } from "#utils/ModLogCase";
import { ModLogCaseType } from "#utils/constants";
import type { PrismaClient } from "@prisma/client";

@injectable()
export default class extends BaseCommand {
    constructor(@inject(kClient) public readonly client: Client<true>, @inject(kPrisma) public prisma: PrismaClient) {
        super({
            name: "softban",
            category: "Moderation"
        });
    }

    async execute(interaction: CommandInteraction) {
        await interaction.deferReply({ ephemeral: true });

        if (!interaction.memberPermissions?.has(Permissions.FLAGS.BAN_MEMBERS)) {
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

        const modLogChannel = interaction.guild.channels.cache.get(server.modlog) as GuildTextBasedChannel;
        if (!modLogChannel?.permissionsFor(interaction.guild.me!)?.has([Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.EMBED_LINKS])) {
            return await interaction.followUp({ content: "I am not allowed to send messages to the mod log channel" });
        }

        const user = interaction.options.getUser("user", true);
        const member = await interaction.guild?.members.fetch({
            force: false,
            user: user.id
        });

        if (!member) return await interaction.followUp({ content: "Could not find that member.", ephemeral: true });
        if (!member.bannable) return await interaction.followUp({ content: "Can't ban that member." });

        const reason = interaction.options.getString("reason");
        const purgeDays = interaction.options.getNumber("purge", false) ?? 0;
        await member
            .ban({
                reason: reason || `Soft ban by ${interaction.user.tag}`,
                days: purgeDays >= 0 && purgeDays <= 7 ? purgeDays : 0
            })
            .then((m) => {
                return m.guild.bans.remove(m.id, `Softban by ${interaction.user.tag}`);
            })
            .catch(() => null);

        const banCase = new ModLogCase()
            .setGuild(interaction.guildId)
            .setModerator(interaction.user.id)
            .setReason(reason || "N/A")
            .setTimestamp()
            .setTarget(member.id)
            .setType(ModLogCaseType.SOFTBAN);

        const entry = await this.prisma.modLogCase.create({
            data: {
                ...banCase.build()
            }
        });

        const logEmbed = new MessageEmbed()
            .setColor(banCase.color)
            .setTimestamp(banCase.timestamp)
            .setTitle(`${banCase.type} | case #${entry.case_id}`)
            .addField("User", `${this.client.users.cache.get(entry.target)?.tag || member.user.tag} (\`${entry.target || member.id}\`)`, true)
            .addField("Moderator", `${this.client.users.cache.get(entry.moderator)?.tag || interaction.user.tag} (\`${entry.moderator || interaction.user.id}\`)`, true)
            .addField("Reason", entry.reason === "N/A" ? `Moderator do \`/reason ${entry.case_id} <reason>\`` : entry.reason, false)
            .setFooter(`Entry id: ${entry.id}`);

        await interaction.followUp({ content: `${user?.tag} has been banned` });
        await modLogChannel
            .send({ embeds: [logEmbed] })
            .then(async (m) => {
                await this.prisma.modLogCase.update({
                    data: {
                        channel: m.channelId,
                        message: m.id
                    },
                    where: {
                        id: entry.id
                    }
                });
            })
            .catch(() => null);
    }
}
