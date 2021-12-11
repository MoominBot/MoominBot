import { Client, CommandInteraction, MessageEmbed, version, MessageActionRow, MessageButton } from "discord.js";
import { inject, injectable } from "tsyringe";

import BaseCommand from "#base/BaseCommand";
import { kClient, kRedis } from "#utils/tokens";

import { Redis } from "ioredis";
import os from "node:os";
import { Emojis } from "#utils/constants";

import { exec as cpExec } from "node:child_process";
import ms, { format as formatMs } from "#utils/parse_ms";
import { stripIndents } from "common-tags";

@injectable()
export default class extends BaseCommand {
    constructor(@inject(kClient) public readonly client: Client<true>, @inject(kRedis) public redis: Redis) {
        super({
            name: "info",
            category: "General"
        });
    }

    getCommits() {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise<string>(async (resolve) => {
            const cached = await this.redis.get("moomin_bot::commits");
            if (cached) return resolve(cached.trim());

            cpExec("git log --oneline -3", {
                timeout: 30_000,
                windowsHide: true
            }, async (err, stdout) => {
                if (err || !stdout) return resolve("N/A");
                const res = stdout.split("\n").map((s) => {
                    const [commit, ...msgs] = s.split(" ");
                    return !commit ? "" : `[\`${commit}\`](https://github.com/MoominBot/MoominBot/commit/${commit}) ${msgs.join(" ")}`;
                }).join("\n").trim();

                await this.redis.setex("moomin_bot::commits", 300, res);

                resolve(res);
            });
        });
    }

    async execute(interaction: CommandInteraction) {
        const commits = await this.getCommits();
        const botInviteURL = this.client.generateInvite({
            scopes: ["applications.commands", "bot"],
            permissions: ["ADMINISTRATOR"]
        });
        const actionRow = new MessageActionRow().addComponents(
            [new MessageButton().setLabel("Learn more").setURL("https://discord.gg/KryMr3Jy68").setStyle("LINK")],
            [new MessageButton().setLabel("Source code").setURL("https://github.com/MoominBot/MoominBot").setStyle("LINK")],
            [
                new MessageButton()
                    .setLabel("Invite bot")
                    .setURL(botInviteURL)
                    .setStyle("LINK")
            ]
        );

        const embed = new MessageEmbed()
            .setThumbnail(this.client.user.displayAvatarURL())
            .setAuthor(`Information about ${this.client.user.username} Bot`, this.client.user.displayAvatarURL())
            .setDescription(`Last updates:\n${commits || "N/A"}`)
            .addFields(
                {
                    name: "ID",
                    value: this.client.user.id,
                    inline: false
                },
                {
                    name: "Created at",
                    value: `<t:${Math.floor(this.client.user.createdTimestamp / 1000)}:F> • <t:${Math.floor(this.client.user.createdTimestamp / 1000)}:R>`,
                    inline: false
                },
                {
                    name: "Uptime",
                    value: formatMs(ms(this.client.uptime), [
                        "months", "weeks",
                        "days", "hours",
                        "minutes", "seconds"
                    ]) || "N/A",
                    inline: false
                },
                {
                    name: "CPU",
                    inline: false,
                    value: `${os.cpus()[0].model} (x${os.cpus().length})`
                },
                {
                    name: "Memory Usage",
                    inline: true,
                    value: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB / ${Math.round(os.totalmem() / 1024 / 1024 / 1024)} GB`
                },
                {
                    name: "Language",
                    value: "TypeScript",
                    inline: true
                },
                {
                    name: "Library",
                    value: `Discord.js v${version}`,
                    inline: true
                },
                {
                    name: "Versions",
                    value: stripIndents`${Emojis.REPLY_BRANCH} Bot Version: 0.1.0a
                    ${Emojis.REPLY_BRANCH} Node Version: ${process.version}
                    ${Emojis.REPLY_BRANCH} V8: ${process.versions.v8}
                    ${Emojis.REPLY} libuv: ${process.versions.uv}`,
                    inline: true
                },
                {
                    name: "\u200b",
                    value: "\u200b",
                    inline: true
                },
                {
                    name: "Bot Tag",
                    value: this.client.user.tag,
                    inline: true
                },
                {
                    name: "Server Count",
                    value: this.client.guilds.cache.size.toString(),
                    inline: true
                },
                {
                    name: "Users",
                    value: this.client.users.cache.size.toString(),
                    inline: true
                },
                {
                    name: "Channels",
                    value: this.client.channels.cache.size.toString(),
                    inline: true
                }
            )
            .setColor("BLURPLE")
            .setFooter(`Requested by ${interaction.user.tag}`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed], components: [actionRow] });
    }
}
