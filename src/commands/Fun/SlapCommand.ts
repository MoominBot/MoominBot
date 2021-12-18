import { Client, MessageEmbed, CommandInteraction } from "discord.js";
import { inject, injectable } from "tsyringe";
import fetch from "node-fetch";

import BaseCommand from "#base/BaseCommand";
import { kClient } from "#utils/tokens";
import i18next from "i18next";

@injectable()
export default class extends BaseCommand {
    constructor(@inject(kClient) public readonly client: Client<true>) {
        super({
            name: "slap",
            category: "Fun"
        });
    }

    async execute(interaction: CommandInteraction) {
        const user = interaction.options.getUser("user") || interaction.user!;
        if (user === interaction.user) {
            return await interaction.reply(i18next.t("commands:slap.self"));
        }
        // @ts-expect-error Image is not nullable or undefined
        const { image } = await fetch("http://api.nekos.fun:8080/api/slap").then((res) => res.json());

        const embed = new MessageEmbed()
            .setAuthor(i18next.t("commands:slap.slapping", { user1: interaction.user.username, user2: user.username }), interaction.user.displayAvatarURL())
            .setImage(image)
            .setColor("BLURPLE")
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
}
