import { Client, CommandInteraction, MessageEmbed } from "discord.js";
import { inject, injectable } from "tsyringe";
import BaseCommand from "#base/BaseCommand";
import { kClient } from "#utils/tokens";
import EmojiUtils from "@moominbot/emojiutils";

@injectable()
export default class extends BaseCommand {
    constructor(@inject(kClient) public readonly client: Client<true>) {
        super({
            name: "enlarge",
            category: "Fun"
        });
    }

    async execute(interaction: CommandInteraction) {
        const emoji = interaction.options.getString("emoji", true);
        const enlargedEmoji = EmojiUtils.enlarge(emoji);

        if (!enlargedEmoji) {
            return interaction.reply({ content: "Invalid Emoji provided.", ephemeral: true });
        }

        const embed = new MessageEmbed()
            .setAuthor("Enlarged Emoji", this.client.user.displayAvatarURL())
            .setImage(enlargedEmoji)
            .setColor("BLURPLE")
            .setFooter(`Requested by ${interaction.user.tag}`);

        await interaction.reply({ embeds: [embed] });
    }
}
