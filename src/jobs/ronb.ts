import { kRedis, kClient, kPrisma } from "#utils/tokens";
import { container } from "tsyringe";
import cron from "node-cron";
import type { Redis } from "ioredis";
import parseJSON from "#utils/safeJSON";
import logger from "#utils/logger";
import { RONBAnnouncementChannel } from "#utils/constants";
import { Client, GuildTextBasedChannel, MessageEmbed } from "discord.js";
import { getLatestPost } from "#utils/ronb";
import { RONBPost } from "src/typings/ronb";
import type { PrismaClient } from "@prisma/client";
import i18next from "i18next";

const redis = container.resolve<Redis>(kRedis);
const client = container.resolve<Client<true>>(kClient);
const prisma = container.resolve<PrismaClient>(kPrisma);

logger.info("[CRON] Job ronbpost loaded!");

const RONBJob = async () => {
    logger.info("[CRON] running ronb job");
    try {
        const prev = parseJSON<RONBPost>((await redis.get("ronbpost")) as string);
        const post = await getLatestPost();
        if (!post || (prev !== null && prev.url === post.url)) return;
        await redis.set("ronbpost", JSON.stringify(post));

        const channel = client.channels.cache.get(RONBAnnouncementChannel as string);

        const embed = new MessageEmbed()
            .setTitle(i18next.t("commands:ronb.viewOnTwitter"))
            .setURL(post.url)
            .setAuthor("Routine of Nepal banda", "https://cdn.discordapp.com/emojis/914800551890407465.png?size=96", "https://twitter.com/RONBupdates")
            .setColor("RED")
            .setDescription(post.content)
            .setThumbnail("https://cdn.discordapp.com/emojis/914800551890407465.png?size=96")
            .setFooter("MoominBot", client.user.displayAvatarURL())
            .setTimestamp(post.createdAt || null);

        if (post.image) embed.setImage(post.image);

        // dispatch to private channel if exists
        if (channel && channel.isText()) {
            await channel
                .send({ embeds: [embed] })
                .then((m) => (m.crosspostable ? m.crosspost() : null))
                .catch(() => null);
        }

        // dispatch to all subscribers
        await dispatchFeed(embed);
    } catch {
        logger.error("Failed to run RONBPost");
    }
};

async function dispatchFeed(embed: MessageEmbed) {
    try {
        const subscribers = await prisma.guild.findMany({
            select: {
                ronb: true
            },
            where: {
                ronb: {
                    not: {
                        equals: null
                    }
                }
            }
        });

        await Promise.allSettled(
            subscribers.map((m) => {
                const channel = client.channels.cache.get(m.ronb!) as GuildTextBasedChannel;
                if (!channel || !channel.isText()) return null;
                return channel.send({ embeds: [embed] }).catch(() => null);
            })
        );
    } catch {
        /* do nothing */
    }
}

cron.schedule("*/5 * * * *", RONBJob);

await RONBJob();
