import { ApplicationCommandData } from "discord.js";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";

const commandConfig = {
    name: "weather",
    description: "Get weather of a specific place.",
    options: [
        {
            name: "city",
            description: "City whose weather is needed",
            type: ApplicationCommandOptionTypes.STRING,
            autocomplete: false,
            required: true
        }
    ]
} as ApplicationCommandData;

export default commandConfig;
