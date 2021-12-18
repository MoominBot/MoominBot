import BaseCommand from "#base/BaseCommand";
import { inject, injectable } from "tsyringe";
import { kClient, kPrisma } from "#utils/tokens";
import { Client, CommandInteraction, GuildTextBasedChannel, Permissions } from "discord.js";
import { ModLogCase } from "#utils/ModLogCase";
import { ModLogCaseType } from "#utils/constants";
import type { PrismaClient } from "@prisma/client";

@injectable()
export default class extends BaseCommand {
    constructor(@inject(kClient) public readonly client: Client<true>, @inject(kPrisma) public prisma: PrismaClient) {
        super({
            name: "nick",
            category: "Moderation"
        });
    }

    async execute(interaction: CommandInteraction) {
        await interaction.deferReply();
        const nickname = (Math.random() + 1).toString(36).substring(5);
        const user = interaction.options.getUser("user");
        const member = await interaction.guild?.members.fetch(user!.id);

        if (!interaction.memberPermissions?.has(Permissions.FLAGS.MANAGE_NICKNAMES)) {
            return await interaction.followUp({ content: "You don't have the required permissions to run this command", ephemeral: true });
        }

        if (!member) return await interaction.followUp({ content: "Could not find that member", ephemeral: true });

        const server = await this.prisma.guild.findFirst({
            where: {
                id: interaction.guildId
            }
        });

        if (!server || !server.modlog || !interaction.guild?.channels.cache.has(server.modlog)) {
            return await interaction.followUp({ content: "No mod log channel found for this server" });
        }

        if (!(member.guild.me!.roles.highest.comparePositionTo(member.roles.highest) > 0)) {
            return await interaction.followUp({ content: "I don't have permissions to update that member." });
        }

        const modLogChannel = interaction.guild.channels.cache.get(server.modlog) as GuildTextBasedChannel;
        if (!modLogChannel?.permissionsFor(interaction.guild.me!)?.has([Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.EMBED_LINKS])) {
            return await interaction.followUp({ content: "I am not allowed to send messages to the mod log channel" });
        }

        await member!.setNickname(`Moderated Nickname ${nickname}`);

        const nickCase = new ModLogCase()
            .setGuild(interaction.guildId)
            .setModerator(interaction.user.id)
            .setReason("N/A")
            .setTimestamp()
            .setTarget(member.id)
            .setType(ModLogCaseType.MODERATED_NICK);

        const entry = await this.prisma.modLogCase.create({
            data: {
                ...nickCase.build()
            }
        });

        const logEmbed = await nickCase.toEmbed(entry);

        await interaction.followUp({ content: `Sucessfully Moderated ${user!.tag}'s nickname.`, ephemeral: true });

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
