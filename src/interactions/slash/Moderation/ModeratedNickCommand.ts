import { ApplicationCommandData } from "discord.js";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums.js";

const commandConfig = {
    name: "nick",
    description: "Moderate someone's nickname",
    options: [
        {
            name: "user",
            description: "The user whose nickname needs moderating",
            type: ApplicationCommandOptionTypes.USER,
            autocomplete: false,
            required: true
        }
    ]
} as ApplicationCommandData;

export default commandConfig;
