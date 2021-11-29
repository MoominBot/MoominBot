import ronbpost, { RONBPost } from "ronbpost";
import { kRedis, kClient } from "#utils/tokens";
import { container } from "tsyringe";
import cron from "node-cron";
import type { Redis } from "ioredis";
import parseJSON from "#utils/safeJSON";
import logger from "#utils/logger";
import { RONBAnnouncementChannel } from "#utils/constants";
import { Client, MessageEmbed } from "discord.js";

const redis = container.resolve<Redis>(kRedis);
const client = container.resolve<Client<true>>(kClient);

logger.info("[CRON] Job ronbpost loaded!");

cron.schedule("*/10 * * * *", async () => {
    logger.info("[CRON] running ronb job");
    try {
        const prev = parseJSON<RONBPost>((await redis.get("ronbpost")) as string);
        const post = await ronbpost();
        if (!post || (prev !== null && prev.url === post.url)) return;
        await redis.setex("ronbpost", 600, JSON.stringify(post));

        const channel = client.channels.cache.get(RONBAnnouncementChannel);

        if (channel?.isText()) {
            const embed = new MessageEmbed()
                .setTitle("View this post on Facebook")
                .setURL(post.url)
                .setAuthor(post.author.name, post.author.icon, post.author.url)
                .setColor("RED")
                .setDescription(post.content)
                .setFooter("MoominBot", client.user.displayAvatarURL())
                .setTimestamp(post.createdAt || null);

            if (post.image?.url) embed.setImage(post.image.url);
            if (post.author.icon) embed.setThumbnail(post.author.icon);

            await channel
                .send({ embeds: [embed] })
                .then((m) => (m.crosspostable ? m.crosspost() : null))
                .catch(() => null);
        }
    } catch {
        logger.error("Failed to run RONBPost");
    }
});
