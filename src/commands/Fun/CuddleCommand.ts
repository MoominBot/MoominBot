import { Client, MessageEmbed, CommandInteraction } from "discord.js";
import { inject, injectable } from "tsyringe";
import BaseCommand from "#base/BaseCommand";
import { kClient } from "#utils/tokens";
import fetch from "node-fetch";

interface CuddleResponse {
    image: string;
}

@injectable()
export default class extends BaseCommand {
    constructor(@inject(kClient) public readonly client: Client<true>) {
        super({
            name: "cuddle",
            category: "Fun"
        });
    }

    async execute(interaction: CommandInteraction) {
        const user = interaction.options.getUser("user") || interaction.user!;
        if (user === interaction.user) {
            return await interaction.reply("Dude that's weird!");
        }

        const { image } = (await fetch("http://api.nekos.fun:8080/api/cuddle").then((res) => res.json())) as CuddleResponse;

        const embed = new MessageEmbed()
            .setAuthor(`${interaction.user.tag} is cuddling with ${user.tag}`, interaction.user.displayAvatarURL())
            .setImage(image)
            .setColor("BLURPLE")
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
}
