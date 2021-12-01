import { kRedis, kClient } from "#utils/tokens";
import { container } from "tsyringe";
import cron from "node-cron";
import type { Redis } from "ioredis";
import parseJSON from "#utils/safeJSON";
import logger from "#utils/logger";
import { RONBAnnouncementChannel } from "#utils/constants";
import { Client, MessageEmbed } from "discord.js";
import { getLatestPost } from "#utils/ronb";
import { RONBPost } from "src/typings/ronb";

const redis = container.resolve<Redis>(kRedis);
const client = container.resolve<Client<true>>(kClient);

logger.info("[CRON] Job ronbpost loaded!");

const RONBJob = async () => {
    logger.info("[CRON] running ronb job");
    try {
        const prev = parseJSON<RONBPost>((await redis.get("ronbpost")) as string);
        const post = await getLatestPost();
        if (!post || (prev !== null && prev.url === post.url)) return;
        await redis.set("ronbpost", JSON.stringify(post));

        const channel = client.channels.cache.get(RONBAnnouncementChannel as string);

        if (channel?.isText()) {
            const embed = new MessageEmbed()
                .setTitle("View this post on Twitter")
                .setURL(post.url)
                .setAuthor("Routine of Nepal banda", "https://cdn.discordapp.com/emojis/914800551890407465.png?size=96", "https://twitter.com/RONBupdates")
                .setColor("RED")
                .setDescription(post.content)
                .setThumbnail("https://cdn.discordapp.com/emojis/914800551890407465.png?size=96")
                .setFooter("MoominBot", client.user.displayAvatarURL())
                .setTimestamp(post.createdAt || null);

            if (post.image) embed.setImage(post.image);

            await channel
                .send({ embeds: [embed] })
                .then((m) => (m.crosspostable ? m.crosspost() : null))
                .catch(() => null);
        }
    } catch {
        logger.error("Failed to run RONBPost");
    }
};

cron.schedule("*/5 * * * *", RONBJob);

await RONBJob();
