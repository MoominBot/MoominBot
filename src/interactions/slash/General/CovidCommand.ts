import { ApplicationCommandData } from "discord.js";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";

const commandConfig = {
    name: "covid",
    description: "Shows COVID-19 data of a specific country.",
    options: [
        {
            name: "country",
            description: "Country whose data is needed",
            type: ApplicationCommandOptionTypes.STRING,
            autocomplete: false,
            required: false
        }
    ]
} as ApplicationCommandData;

export default commandConfig;
