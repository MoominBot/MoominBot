import { Client, CommandInteraction, MessageEmbed } from "discord.js";
import { inject, injectable } from "tsyringe";

import Rashifal from "#utils/Rashifal";

import BaseCommand from "#base/BaseCommand";
import { kClient } from "#utils/tokens";

@injectable()
export default class extends BaseCommand {
    constructor(@inject(kClient) public readonly client: Client<true>) {
        super({
            name: "rashifal",
            category: "General"
        });
    }

    async execute(interaction: CommandInteraction) {
        await interaction.deferReply();
        const rashi = interaction.options.getString("rashi")!;
        const data = await Rashifal.get(rashi).catch(() => null);
        if (!data) return void interaction.followUp({ content: "❌ | Failed to fetch Rashifal!" });

        const embed = new MessageEmbed()
            .setTitle(`${data.name} (${data.alias})`)
            .setThumbnail(data.icon)
            .setDescription(data.description)
            .setColor("BLURPLE")
            .setFooter("Data provided by HamroPatro")
            .setTimestamp();

        interaction.followUp({ embeds: [embed] });
    }
}
