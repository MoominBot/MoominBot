import { Client, CommandInteraction, MessageEmbed } from "discord.js";
import { inject, injectable } from "tsyringe";

import BaseCommand from "#base/BaseCommand";
import { kClient } from "#utils/tokens";

@injectable()
export default class extends BaseCommand {
    constructor(@inject(kClient) public readonly client: Client<true>) {
        super({
            name: "ping",
            category: "General"
        });
    }

    async execute(interaction: CommandInteraction) {
        const timeout = Date.now() - interaction.createdTimestamp;
        const embed = new MessageEmbed()
            .setTimestamp()
            .setTitle("⏱️ | Pong!")
            .setColor("BLURPLE")
            .setThumbnail(this.client.user.displayAvatarURL())
            .setDescription(`HTTP: \`${timeout}ms\`\nWebSocket: \`${Math.floor(this.client.ws.ping)}ms\``);

        await interaction.reply({ embeds: [embed] });
    }
}
