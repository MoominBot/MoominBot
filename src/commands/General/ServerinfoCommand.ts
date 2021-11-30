import BaseCommand from "#base/BaseCommand";
import { inject, injectable } from "tsyringe";
import { kClient } from "#utils/tokens";
import { Client, CommandInteraction, MessageEmbed } from "discord.js";

@injectable()
export default class extends BaseCommand {
    constructor(@inject(kClient) public readonly client: Client<true>) {
        super({
            name: "serverinfo",
            category: "General"
        });
    }

    async execute(interaction: CommandInteraction) {
        const features = interaction.guild?.features
            .map((p) =>
                p
                    .split("_")
                    .map((m) => `${m.charAt(0).toUpperCase()}${m.slice(1).toLowerCase()}`)
                    .join(" ")
            )
            .join("\n");

        const embed = new MessageEmbed()
            .setColor("BLURPLE")
            .setAuthor(`Info of ${interaction.guild?.name} Server`)
            .setFooter(`Requested by ${interaction.user.tag}`)
            .setTimestamp()
            .setThumbnail(interaction.guild!.iconURL({ dynamic: true })!)
            .addFields(
                { name: "ID", value: `${interaction.guild?.id}`, inline: true },
                {
                    name: "Owner",
                    value: `<@${interaction.guild?.ownerId}>`,
                    inline: true
                },
                {
                    name: "Member Count",
                    value: `${interaction.guild?.memberCount}`,
                    inline: true
                },
                {
                    name: "Created at",
                    value: `<t:${Math.floor(interaction.guild!.createdTimestamp! / 1000)}>`,
                    inline: true
                },
                {
                    name: "Text Channels",
                    value: `${interaction.guild?.channels.cache.filter((ch) => ch.type === "GUILD_TEXT").size}`,
                    inline: true
                },
                {
                    name: "Voice Channels",
                    value: `${interaction.guild?.channels.cache.filter((ch) => ch.type === "GUILD_VOICE").size}`,
                    inline: true
                },
                {
                    name: "Premium Tier",
                    value: `${interaction.guild?.premiumTier.replace("_", " ") ?? "None"}`,
                    inline: true
                },
                {
                    name: "Roles",
                    value: `${interaction.guild?.roles.cache.size}`,
                    inline: true
                },
                {
                    name: "Vanity URL Code",
                    value: `${interaction.guild?.vanityURLCode ?? "None"}`,
                    inline: true
                },
                {
                    name: "Features",
                    value: features?.length ? features : "None",
                    inline: false
                }
            );

        await interaction.reply({ embeds: [embed] });
    }
}
