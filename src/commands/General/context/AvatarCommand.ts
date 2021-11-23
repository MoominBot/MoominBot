import { MessageEmbed, ContextMenuInteraction, DynamicImageFormat } from "discord.js";
import BaseCommand from "../../../base/BaseCommand.js";

export default class extends BaseCommand {
    constructor() {
        super({
            name: "Avatar"
        });
    }

    async execute(interaction: ContextMenuInteraction) {
        const user = interaction.options.getUser("user")!;
        const avatars = (["gif", "jpeg", "png", "webp"] as DynamicImageFormat[]).map((m) => {
            return [m.toUpperCase(), user.displayAvatarURL({ format: m, size: 4096 })];
        });

        const embed = new MessageEmbed()
            .setTimestamp()
            .setAuthor(user.tag, user.displayAvatarURL())
            .setTitle("Avatar")
            .setColor("BLURPLE")
            .setImage(user.displayAvatarURL({ size: 4096, dynamic: true }))
            .setDescription(avatars.map(([m, n]) => `[${m}](${n})`).join(" | "));

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
}
