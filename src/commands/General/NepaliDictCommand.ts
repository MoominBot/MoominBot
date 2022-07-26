import { Client, CommandInteraction, MessageEmbed } from "discord.js";
import { inject, injectable } from "tsyringe";
import fetch from "node-fetch";

import BaseCommand from "#base/BaseCommand";
import { kClient } from "#utils/tokens";
import { Emojis } from "#utils/constants";

interface NepaliDict {
    word: string;
    meaning: string;
}

@injectable()
export default class extends BaseCommand {
    constructor(@inject(kClient) public readonly client: Client<true>) {
        super({
            name: "dictionary",
            category: "General"
        });
    }

    async execute(interaction: CommandInteraction) {
        const word = interaction.options.getString("word");
        const response = await fetch(`https://nepalidict.herokuapp.com/v1/${word}`);
        if (response.status !== 200) {
            return await interaction.reply({
                content: `${Emojis.ERROR_DEFAULT} No meaning of \`${word}\` found.\nPop some suggestions for words to be added in Moomin Valley server.`,
                ephemeral: true
            });
        }
        const data = (await response.json()) as NepaliDict;
        const embed = new MessageEmbed().setTitle("English to Nepali").setDescription(`${word} ${Emojis.RIGHT_ARROW} ${data.meaning}`).setColor("BLURPLE");

        await interaction.reply({ embeds: [embed] });
    }
}
