import { Client, CommandInteraction, MessageEmbed, version, MessageActionRow, MessageButton } from "discord.js";
import { inject, injectable } from "tsyringe";

import BaseCommand from "#base/BaseCommand";
import { kClient } from "#utils/tokens";

@injectable()
export default class extends BaseCommand {
    constructor(@inject(kClient) public readonly client: Client<true>) {
        super({
            name: "info",
            category: "General"
        });
    }

    async execute(interaction: CommandInteraction) {
        const actionRow = new MessageActionRow().addComponents(
            [new MessageButton().setLabel("Learn More!").setURL("https://discord.gg/KryMr3Jy68").setStyle("LINK")],
            [new MessageButton().setLabel("Source").setURL("https://github.com/MoominBot/MoominBot").setStyle("LINK")],
            [
                new MessageButton()
                    .setLabel("Invite")
                    .setURL("https://discord.com/oauth2/authorize?client_id=914812146716651541&permissions=-1&scope=bot%20applications.commands")
                    .setStyle("LINK")
            ]
        );
        const uptime = Math.floor((Date.now() - this.client.uptime) / 1000);
        const embed = new MessageEmbed()
            .setThumbnail(this.client.user.displayAvatarURL())
            .setAuthor(`Information about ${this.client.user.username} Bot`, this.client.user.displayAvatarURL())
            .addFields(
                {
                    name: "ID",
                    value: this.client.user.id,
                    inline: false
                },
                {
                    name: "Created at",
                    value: `<t:${Math.floor(this.client.user.createdTimestamp / 1000)}:F> • <t:${Math.floor(this.client.user.createdTimestamp / 1000)}:R>`,
                    inline: false
                },
                {
                    name: "Online Since",
                    value: `<t:${uptime}:F> • <t:${uptime}:R> `,
                    inline: false
                },
                {
                    name: "Language",
                    value: "TypeScript",
                    inline: true
                },
                {
                    name: "Library",
                    value: `discord.js v${version}`,
                    inline: true
                },
                {
                    name: "Version",
                    value: "0.1.0a",
                    inline: true
                },
                {
                    name: "Bot Tag",
                    value: this.client.user.tag,
                    inline: true
                },
                {
                    name: "Server Count",
                    value: this.client.guilds.cache.size.toString(),
                    inline: true
                },
                {
                    name: "Users",
                    value: this.client.users.cache.size.toString(),
                    inline: true
                },
                {
                    name: "Channels",
                    value: this.client.channels.cache.size.toString(),
                    inline: true
                }
            )
            .setColor("BLURPLE")
            .setFooter(`Requested by ${interaction.user.tag}`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed], components: [actionRow] });
    }
}
