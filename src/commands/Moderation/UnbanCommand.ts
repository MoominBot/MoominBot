import BaseCommand from "#base/BaseCommand";
import { inject, injectable } from "tsyringe";
import { kClient, kPrisma } from "#utils/tokens";
import { Client, CommandInteraction, Permissions, GuildTextBasedChannel } from "discord.js";
import { ModLogCase } from "#utils/ModLogCase";
import { ModLogCaseType } from "#utils/constants";
import type { PrismaClient } from "@prisma/client";

@injectable()
export default class extends BaseCommand {
    constructor(@inject(kClient) public readonly client: Client<true>, @inject(kPrisma) public prisma: PrismaClient) {
        super({
            name: "unban",
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

        const user = interaction.options.getString("user", true);
        const reason = interaction.options.getString("reason");

        if (
            !(await interaction.guild.bans
                .fetch(user)
                .then((x) => x?.user)
                .catch(() => null))
        )
            return await interaction.followUp({ content: "Could not find that user in ban list" });

        const unbanned = await interaction.guild.bans
            .remove(user, reason || `unbanned by ${interaction.user.tag}`)
            .then(() => true)
            .catch(() => false);

        if (!unbanned) return await interaction.followUp({ content: "Could not unban that user." });

        const unbanCase = new ModLogCase()
            .setGuild(interaction.guildId)
            .setModerator(interaction.user.id)
            .setReason(reason || "N/A")
            .setTimestamp()
            .setTarget(user)
            .setType(ModLogCaseType.UNBAN);

        const entry = await this.prisma.modLogCase.create({
            data: {
                ...unbanCase.build()
            }
        });

        const logEmbed = await unbanCase.toEmbed(entry);

        await interaction.followUp({ content: `**${(await this.client.users.fetch(user))?.tag || `<@${user}>`}** was unbanned` });
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
