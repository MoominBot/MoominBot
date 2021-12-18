import { CommandInteraction, MessageEmbed } from "discord.js";
import { inject, injectable } from "tsyringe";
import type { Redis } from "ioredis";
import i18next from "i18next";

import BaseCommand from "#base/BaseCommand";
import { kRedis } from "#utils/tokens";
import parseJSON from "#utils/safeJSON";
import { getLatestPost } from "#utils/ronb";
import { RONBPost } from "src/typings/ronb";

@injectable()
export default class extends BaseCommand {
    constructor(@inject(kRedis) public readonly redis: Redis) {
        super({
            name: "ronb",
            category: "News"
        });
    }

    async execute(interaction: CommandInteraction) {
        await interaction.deferReply();
        const post = (await parseJSON<RONBPost>((await this.redis.get("ronbpost")) as string)) || (await getLatestPost());
        if (!post) return await interaction.followUp({ content: i18next.t("commands:ronb.failedToFetch") });

        const embed = new MessageEmbed()
            .setTitle(i18next.t("commands:ronb.viewOnTwitter"))
            .setURL(post.url)
            .setAuthor("Routine of Nepal banda", "https://cdn.discordapp.com/emojis/914800551890407465.png?size=96", "https://twitter.com/RONBupdates")
            .setColor("RED")
            .setDescription(post.content)
            .setThumbnail("https://cdn.discordapp.com/emojis/914800551890407465.png?size=96")
            .setFooter("MoominBot", interaction.client.user?.displayAvatarURL())
            .setTimestamp(new Date(post.createdAt) || null);

        if (post.image) embed.setImage(post.image);

        return await interaction.followUp({ embeds: [embed] });
    }
}
