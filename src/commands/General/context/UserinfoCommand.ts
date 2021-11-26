import { ContextMenuInteraction, MessageEmbed } from "discord.js";
import BaseCommand from "#base/BaseCommand.js";

export default class extends BaseCommand {
    constructor() {
        super({
            name: "Userinfo"
        });
    }

    async execute(interaction: ContextMenuInteraction) {
        const user = interaction.options.getUser("user")!;
        const flags = user.flags
            ?.toArray()
            .map((p) =>
                p
                    .split("_")
                    .map((m) => `${m.charAt(0).toUpperCase()}${m.slice(1).toLowerCase()}`)
                    .join(" ")
            )
            .join("\n");
        const member = await interaction.guild!.members.fetch(user.id)!;
        const roles = member.roles.cache
            .sort((a, b) => b.position - a.position)
            .map((r) => r)
            .slice(0, -1)
            .join(",");

        const permissions = member.permissions
            .toArray()
            .slice(0, 8)
            .map((p) =>
                p
                    .split("_")
                    .map((m) => `${m.charAt(0).toUpperCase()}${m.slice(1).toLowerCase()}`)
                    .join(" ")
            )
            .join(", ");

        const embed = new MessageEmbed()
            .setColor("BLURPLE")
            .setAuthor(`Userinfo of ${user.tag}`)
            .setFooter(`Requested by ${interaction.user.tag}`)
            .setTimestamp()
            .setThumbnail(member.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: "ID", value: user.id, inline: true },
                { name: "Nickname", value: `${member.nickname ?? user.username}`, inline: true },
                {
                    name: "Joined at",
                    value: `<t:${Math.floor(member.joinedTimestamp! / 1000)}:F> • <t:${Math.floor(member.joinedTimestamp! / 1000)}:R>`,
                    inline: false
                },
                {
                    name: "Created at",
                    value: `<t:${Math.floor(user.createdTimestamp! / 1000)}:F> • <t:${Math.floor(user.createdTimestamp! / 1000)}:R>`,
                    inline: false
                },
                { name: "Roles", value: roles.length ? roles : "None" },
                { name: "Permissions", value: permissions.length ? permissions : "None" },
                { name: "User Flags", value: flags || "None" }
            );

        await interaction.reply({ embeds: [embed] });
    }
}
