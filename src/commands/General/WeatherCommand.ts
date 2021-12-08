import { Client, CommandInteraction, MessageEmbed } from "discord.js";
import { inject, injectable } from "tsyringe";
import fetch from "node-fetch";

import BaseCommand from "#base/BaseCommand";
import { kClient } from "#utils/tokens";
import { Emojis } from "#utils/constants";

interface IWeather {
    coord: { lon: number; lat: number };
    weather: [{ id: number; main: string; description: string; icon: string }];
    base: string;
    main: {
        temp: number;
        feels_like: number;
        temp_min: number;
        temp_max: number;
        pressure: number;
        humidity: number;
        sea_level: number;
        grnd_level: number;
    };
    visibility: number;
    wind: { speed: number; deg: number; gust: number };
    clouds: { all: number };
    dt: number;
    sys: { country: string; sunrise: number; sunset: number };
    timezone: number;
    id: number;
    name: string;
    cod: number;
}

@injectable()
export default class extends BaseCommand {
    constructor(@inject(kClient) public readonly client: Client<true>) {
        super({
            name: "weather",
            category: "General"
        });
    }

    async execute(interaction: CommandInteraction) {
        const city = interaction.options.getString("city");
        const data = (await fetch(`http://api.openweathermap.org/data/2.5/weather?appid=${process.env.WEATHER_TOKEN}&q=${city}`).then((res) => res.json())) as IWeather;

        const embed = new MessageEmbed()
            .setAuthor(`Weather of ${data.name.toString()}`, this.client.user.displayAvatarURL())
            .setColor("BLURPLE")
            .setFooter(`Requested by ${interaction.user.tag}`)
            .addFields(
                {
                    name: "Temperature",
                    value: `${Emojis.OFFLINE} Avg: ${(data.main.temp - 273).toFixed(0)} °C\n${Emojis.OFFLINE} Max: ${(data.main.temp_max - 273).toFixed(0)} °C\n${
                        Emojis.OFFLINE
                    } Min: ${(data.main.temp_min - 273).toFixed(0)} °C`,
                    inline: true
                },
                {
                    name: "Wind",
                    value: `${Emojis.OFFLINE} Speed: ${data.wind.speed.toFixed(0)} km/h\n${Emojis.OFFLINE} Degree: ${data.wind.deg.toFixed(0)} °\n${
                        Emojis.OFFLINE
                    } Gust: ${data.wind.gust ?? 0} km/h`,
                    inline: true
                },
                {
                    name: "Sunrise",
                    value: `<t:${data.sys.sunrise.toString()}> • <t:${data.sys.sunrise.toString()}:R>`,
                    inline: false
                },
                {
                    name: "Sunset",
                    value: `<t:${data.sys.sunset.toString()}> • <t:${data.sys.sunset.toString()}:R>`,
                    inline: false
                }
            );

        await interaction.reply({ embeds: [embed] });
    }
}
