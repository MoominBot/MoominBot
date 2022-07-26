import { ApplicationCommandData } from "discord.js";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";

const commandConfig = {
    name: "dictionary",
    description: "Convert English words to Nepali words",
    options: [
        {
            name: "word",
            description: "The word to get meaning of",
            type: ApplicationCommandOptionTypes.STRING,
            autocomplete: false,
            required: true
        }
    ]
} as ApplicationCommandData;

export default commandConfig;
