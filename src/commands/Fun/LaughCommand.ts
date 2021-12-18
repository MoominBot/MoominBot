import { Client, MessageEmbed, CommandInteraction } from "discord.js";
import { inject, injectable } from "tsyringe";
import fetch from "node-fetch";
import i18next from "i18next";

import BaseCommand from "#base/BaseCommand";
import { kClient } from "#utils/tokens";

@injectable()
export default class extends BaseCommand {
    constructor(@inject(kClient) public readonly client: Client<true>) {
        super({
            name: "laugh",
            category: "Fun"
        });
    }

    async execute(interaction: CommandInteraction) {
        const user = interaction.options.getUser("user") || interaction.user!;
        // @ts-expect-error Image is not nullable or undefined
        const { image } = await fetch("http://api.nekos.fun:8080/api/laugh").then((res) => res.json());

        const i18nLaughKey = user === interaction.user ? "commands:laugh.random" : "commands:laugh.laughing";

        const embed = new MessageEmbed()
            .setAuthor(i18next.t(i18nLaughKey, { user1: interaction.user.username, user2: user.username }))
            .setImage(image)
            .setColor("BLURPLE")
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
}
