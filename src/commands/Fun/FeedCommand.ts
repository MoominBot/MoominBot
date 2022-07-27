import { Client, MessageEmbed, CommandInteraction } from "discord.js";
import { inject, injectable } from "tsyringe";
import BaseCommand from "#base/BaseCommand";
import { kClient } from "#utils/tokens";
import fetch from "node-fetch";

interface FeedResponse {
    image: string;
}

@injectable()
export default class extends BaseCommand {
    constructor(@inject(kClient) public readonly client: Client<true>) {
        super({
            name: "feed",
            category: "Fun"
        });
    }

    async execute(interaction: CommandInteraction) {
        const user = interaction.options.getUser("user") || interaction.user!;
        const { image } = (await fetch("http://api.nekos.fun:8080/api/feed").then((res) => res.json())) as FeedResponse;

        const embed = new MessageEmbed()
            .setAuthor(`${interaction.user.tag} ${user === interaction.user ? "is asking to be fed." : `is feeding ${user.tag}`}`)
            .setImage(image)
            .setColor("BLURPLE")
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
}
