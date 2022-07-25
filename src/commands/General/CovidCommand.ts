import { Client, CommandInteraction, MessageEmbed, MessageActionRow, MessageButton } from "discord.js";
import { inject, injectable } from "tsyringe";
import fetch from "node-fetch";

import BaseCommand from "#base/BaseCommand";
import { kClient } from "#utils/tokens";

interface APIResponse {
    country: string;
    cases: number;
    todayCases: number;
    deaths: number;
    todayDeaths: number;
    recovered: number;
    active: number;
    critical: number;
    totalTests: number;
}

@injectable()
export default class extends BaseCommand {
    constructor(@inject(kClient) public readonly client: Client<true>) {
        super({
            name: "covid",
            category: "General"
        });
    }

    async execute(interaction: CommandInteraction) {
        const country = interaction.options.getString("country") ?? "Nepal";
        const data = (await fetch(`https://coronavirus-19-api.herokuapp.com/countries/${country}`).then((res) => res.json())) as APIResponse;
        const actionRow = new MessageActionRow().addComponents(
            new MessageButton().setLabel("Stay Safe!").setURL("https://www.who.int/emergencies/diseases/novel-coronavirus-2019").setStyle("LINK")
        );
        const embed = new MessageEmbed()
            .setAuthor(`COVID-19 Data of ${data.country}`, this.client.user.displayAvatarURL())
            .setColor("BLURPLE")
            .setThumbnail("https://nlihc.org/sites/default/files/pictures/coronavirus.png")
            .addFields(
                {
                    name: "Total Cases",
                    value: data.cases.toString(),
                    inline: true
                },
                {
                    name: "Total Deaths",
                    value: data.deaths.toString(),
                    inline: true
                },
                {
                    name: "Recovered",
                    value: data.recovered.toString(),
                    inline: true
                },
                {
                    name: "Cases Today",
                    value: data.todayCases.toString(),
                    inline: true
                },
                {
                    name: "Deaths Today",
                    value: data.todayDeaths.toString(),
                    inline: true
                },
                {
                    name: "Active Cases",
                    value: data.active.toString(),
                    inline: true
                },
                {
                    name: "Critical Cases",
                    value: data.critical.toString(),
                    inline: true
                },
                {
                    name: "Total Tests",
                    value: data.totalTests.toString(),
                    inline: true
                }
            );

        await interaction.reply({ embeds: [embed], components: [actionRow] });
    }
}
