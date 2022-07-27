import { Client, MessageEmbed, CommandInteraction } from "discord.js";
import { inject, injectable } from "tsyringe";
import BaseCommand from "#base/BaseCommand";
import { kClient } from "#utils/tokens";
import fetch from "node-fetch";

interface KissResponse {
    image: string;
}

@injectable()
export default class extends BaseCommand {
    constructor(@inject(kClient) public readonly client: Client<true>) {
        super({
            name: "kiss",
            category: "Fun"
        });
    }

    async execute(interaction: CommandInteraction) {
        const user = interaction.options.getUser("user") || interaction.user!;
        if (user === interaction.user) {
            return await interaction.reply("I am no one to judge, but kissing yourself is gay bro...");
        }
        const { image } = (await fetch("http://api.nekos.fun:8080/api/kiss").then((res) => res.json())) as KissResponse;

        const embed = new MessageEmbed()
            .setAuthor(`${interaction.user.tag} kisses ${user.tag}`, interaction.user.displayAvatarURL())
            .setImage(image)
            .setColor("BLURPLE")
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
}
