import BaseCommand from "../../base/BaseCommand.js";
import { inject, injectable } from "tsyringe";
import { kClient } from "../../constants.js";
import { Client, CommandInteraction, MessageEmbed } from "discord.js";
import Rashifal from "./utils/Rashifal.js";

@injectable()
export default class extends BaseCommand {
    constructor(@inject(kClient) public readonly client: Client<true>) {
        super({
            name: "rashifal"
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
