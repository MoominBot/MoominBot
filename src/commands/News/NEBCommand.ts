import { CommandInteraction, MessageEmbed } from "discord.js";
import { inject, injectable } from "tsyringe";
import type { Redis } from "ioredis";

import BaseCommand from "#base/BaseCommand";
import { kRedis } from "#utils/tokens";
import neb from "#utils/neb";

@injectable()
export default class extends BaseCommand {
    constructor(@inject(kRedis) public readonly redis: Redis) {
        super({
            name: "neb",
            category: "News"
        });
    }

    async execute(interaction: CommandInteraction) {
        await interaction.deferReply({ ephemeral: true });
        const entry = await neb(interaction.options.getString("dob", true), interaction.options.getString("symbol", true));
        if (!entry) return await interaction.followUp({ content: "❌ | Failed to fetch NEB result, maybe date of birth or symbol number is incorrect?!", ephemeral: true });

        const embed = new MessageEmbed()
            .setAuthor("NEB Result")
            .setTitle(`${this.titleCase(entry.name!)} (GPA ${entry.gpa})`)
            .setDescription(`🏫 School Name: **${this.titleCase(entry.school!)}**\n📌 Registration no: **${entry.registration}**\n🔎 Symbol no: **${entry.symbol}**`)
            .addFields(
                entry.subjects.map((m) => ({
                    name: `[${m.code}] ${this.titleCase(m.name)}`,
                    value: `**Grade Obtained:** ${m.grade}`,
                    inline: false
                }))
            )
            .setColor("BLURPLE")
            .setFooter(`NEB Result of ${this.titleCase(entry.name!)}`)
            .setTimestamp();

        return await interaction.followUp({ ephemeral: true, embeds: [embed] });
    }

    titleCase(str: string) {
        if (!str) return "";
        return str
            .split(" ")
            .map((m) => `${m.charAt(0).toUpperCase()}${m.slice(1).toLowerCase()}`)
            .join(" ");
    }
}
