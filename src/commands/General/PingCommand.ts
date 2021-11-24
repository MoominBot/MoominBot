import { Client, CommandInteraction, MessageEmbed } from "discord.js";
import { inject, injectable } from "tsyringe";

import BaseCommand from "#base/BaseCommand";
import { kClient } from "#utils/constants";

@injectable()
export default class extends BaseCommand {
    constructor(@inject(kClient) public readonly client: Client<true>) {
        super({
            name: "ping"
        });
    }

    async execute(interaction: CommandInteraction) {
        const timeout = Date.now() - interaction.createdTimestamp;
        const embed = new MessageEmbed()
            .setTimestamp()
            .setTitle("Bot Latency")
            .setColor("BLURPLE")
            .setThumbnail(this.client.user.displayAvatarURL())
            .setDescription(`⏱️ | Pong! Took \`${timeout}ms\``);

        await interaction.reply({ embeds: [embed] });
    }
}
