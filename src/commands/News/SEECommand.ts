import { Client, CommandInteraction, MessageEmbed } from "discord.js";
import { inject, injectable } from "tsyringe";

import BaseCommand from "#base/BaseCommand";
import { kClient } from "#utils/tokens";
import fetch from "node-fetch";
import { Emojis } from "#utils/constants";

interface Response {
    c: string;
}

@injectable()
export default class extends BaseCommand {
    constructor(@inject(kClient) public readonly client: Client<true>) {
        super({
            name: "see",
            category: "News"
        });
    }

    async execute(interaction: CommandInteraction) {
        const symbolNumber = interaction.options.getString("symbol")!;
        const response = (await fetch(`https://sapi.edusanjal.com/?s=${symbolNumber}`, {
            method: "POST"
        }).then((res) => res.json())) as Response;
        if (response.c === null) {
            return await interaction.reply({ content: `${Emojis.ERROR_DEFAULT} Invalid Symbol Number`, ephemeral: true });
        }

        const embed = new MessageEmbed()
            .setTitle("SEE Result 2079")
            .setColor("BLURPLE")
            .setDescription(`**Symbol No :** ${symbolNumber.toUpperCase()}\n**GPA :**  ${response.c.split("/")[0]}`)
            .setThumbnail("https://see.results.news/wp-content/uploads/2019/08/see-result-min.png");

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
}
