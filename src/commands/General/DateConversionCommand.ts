import { Client, CommandInteraction, MessageEmbed } from "discord.js";
import { inject, injectable } from "tsyringe";
import fetch from "node-fetch";

import BaseCommand from "#base/BaseCommand";
import { kClient } from "#utils/tokens";
import { Emojis } from "#utils/constants";

interface APIResponse {
    ad: string;
    bs: string;
    ns_year: string;
}

@injectable()
export default class extends BaseCommand {
    constructor(@inject(kClient) public readonly client: Client<true>) {
        super({
            name: "convert",
            category: "General"
        });
    }

    async execute(interaction: CommandInteraction) {
        const date = interaction.options.getString("date")!;
        const basedOn = interaction.options.getString("based");

        const body = {
            date: date,
            based_on: basedOn
        };

        const response = await fetch("https://api.nepalipatro.com.np/calendars/dateConvert", {
            headers: {
                accept: "application/json, text/plain, */*",
                "content-type": "application/json;charset=UTF-8"
            },
            body: JSON.stringify(body),
            method: "POST"
        });
        if (response.status !== 200) {
            return await interaction.reply({ content: `${Emojis.ERROR_DEFAULT} Cannot convert date, make sure date is in \`YYYY-MM-DD\` format`, ephemeral: true });
        }
        const data = (await response.json()) as APIResponse;
        const embed = new MessageEmbed()
            .setAuthor("Date Conversion", this.client.user.displayAvatarURL())
            .setColor("BLURPLE")
            .setFooter("Powered by NepaliPatro")
            .addFields(
                {
                    name: "AD",
                    value: `${Emojis.OFFLINE} ${data.ad.toString()}`,
                    inline: false
                },
                {
                    name: "BS",
                    value: `${Emojis.OFFLINE} ${data.bs.toString()}`,
                    inline: false
                }
            );

        await interaction.reply({ embeds: [embed] });
    }
}
