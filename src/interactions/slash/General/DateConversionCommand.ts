import { ApplicationCommandData } from "discord.js";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";

export enum DateMap {
    "विक्रम संवत" = "BS",
    "ईश्वी संवत" = "AD"
}

const commandConfig = {
    name: "convert",
    description: "Convert AD to BS and vice versa.",
    options: [
        {
            name: "date",
            description: "Date to convert(YYYY-MM-DD)",
            type: ApplicationCommandOptionTypes.STRING,
            autocomplete: false,
            required: true
        },
        {
            name: "based",
            description: "Convert given date based on",
            required: true,
            type: ApplicationCommandOptionTypes.STRING,
            choices: Object.entries(DateMap).map(([k, v]) => {
                return { name: `${k} (${v})`, value: v };
            })
        }
    ]
} as ApplicationCommandData;

export default commandConfig;
