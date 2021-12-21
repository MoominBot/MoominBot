import { PrismaClient } from "@prisma/client";
import { CommandInteraction } from "discord.js";

export default async function ModLogConfig(interaction: CommandInteraction<"cached">, prisma: PrismaClient) {
    const channel = interaction.options.getChannel("channel", false);

    if (channel && !channel.isText())
        return await interaction.followUp({
            content: "❌ | Channel type must be text!"
        });

    if (!channel) {
        const lastData = await prisma.guild.findFirst({
            where: {
                id: interaction.guildId
            }
        });
        if (!lastData?.modlog) return await interaction.followUp({ content: "❌ | There is no moderation log channel setup for this server." });

        await prisma.guild.update({
            where: {
                id: interaction.guildId
            },
            data: {
                modlog: null
            }
        });

        await interaction.followUp({ content: "✅ | Successfully removed moderation log channel for this server!" });
    } else {
        await prisma.guild.upsert({
            where: {
                id: interaction.guildId
            },
            create: {
                id: interaction.guildId,
                modlog: channel.id
            },
            update: {
                modlog: channel.id
            }
        });

        return await interaction.followUp({
            content: `✅ | <#${channel.id}> was set to moderation log channel.`
        });
    }
}
