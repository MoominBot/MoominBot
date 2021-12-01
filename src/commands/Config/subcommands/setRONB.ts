import { PrismaClient } from "@prisma/client";
import { CommandInteraction } from "discord.js";

export default async function RONBConfig(interaction: CommandInteraction<"cached">, prisma: PrismaClient) {
    const channel = interaction.options.getChannel("channel", false);

    if (channel && !channel.isText())
        return await interaction.followUp({
            content: `❌ | Channel type must be text!`
        });

    if (!channel) {
        const lastData = await prisma.guild.findFirst({
            where: {
                id: interaction.guildId
            }
        });
        if (!lastData?.ronb) return await interaction.followUp({ content: "❌ | There is no feed setup for `Routine of Nepal banda`." });

        await prisma.guild.update({
            where: {
                id: interaction.guildId
            },
            data: {
                ronb: null
            }
        });

        await interaction.followUp({ content: "✅ | Successfully removed `Routine of Nepal banda` feed from this server!" });
    } else {
        await prisma.guild.upsert({
            where: {
                id: interaction.guildId
            },
            create: {
                id: interaction.guildId,
                ronb: channel.id
            },
            update: {
                ronb: channel.id
            }
        });

        return await interaction.followUp({
            content: `✅ | <#${channel.id}> was subscribed to **Routine of Nepal** banda feed.`
        });
    }
}
