import { CommandInteraction, MessageEmbed } from "discord.js";
import { inject, injectable } from "tsyringe";
import type { Redis } from "ioredis";

import BaseCommand from "#base/BaseCommand";
import { kRedis } from "#utils/tokens";
import parseJSON from "#utils/safeJSON";
import ronbpost, { RONBPost } from "ronbpost";

@injectable()
export default class extends BaseCommand {
    constructor(@inject(kRedis) public readonly redis: Redis) {
        super({
            name: "ronb"
        });
    }

    async execute(interaction: CommandInteraction) {
        await interaction.deferReply();
        const post = (await parseJSON<RONBPost>((await this.redis.get("ronbpost")) as string)) || (await ronbpost());
        if (!post) return await interaction.followUp({ content: "❌ | Failed to fetch **Routine of Nepal banda**" });

        const embed = new MessageEmbed()
            .setTitle("View this post on Facebook")
            .setURL(post.url)
            .setAuthor(post.author.name, post.author.icon || "https://cdn.discordapp.com/emojis/914800551890407465.png?size=96", post.author.url)
            .setColor("RED")
            .setDescription(post.content)
            .setThumbnail(post.author.icon || "https://cdn.discordapp.com/emojis/914800551890407465.png?size=96")
            .setFooter("MoominBot", interaction.client.user?.displayAvatarURL())
            .setTimestamp(new Date(post.createdAt) || null);

        if (post.image?.url) embed.setImage(post.image.url);

        return await interaction.followUp({ embeds: [embed] });
    }
}
