import { ApplicationCommandData } from "discord.js";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";

const commandConfig = {
    name: "help",
    description: "Shows bot commands",
    options: [
        {
            name: "command",
            description: "The command name to get info",
            type: ApplicationCommandOptionTypes.STRING,
            autocomplete: true,
            required: false
        }
    ]
} as ApplicationCommandData;

export default commandConfig;
