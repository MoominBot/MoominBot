import { ApplicationCommandData } from "discord.js";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums.js";

const commandConfig = {
    name: "enlarge",
    description: "Enlarge a given emoji",
    options: [
        {
            name: "emoji",
            description: "The emoji to enlarge",
            type: ApplicationCommandOptionTypes.STRING,
            autocomplete: false,
            required: true
        }
    ]
} as ApplicationCommandData;

export default commandConfig;
