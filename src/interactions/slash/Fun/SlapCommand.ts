import { ApplicationCommandData } from "discord.js";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums.js";

const commandConfig = {
    name: "slap",
    description: "Slap some rude person",
    options: [
        {
            name: "user",
            description: "The user to slap",
            type: ApplicationCommandOptionTypes.USER,
            autocomplete: false,
            required: false
        }
    ]
} as ApplicationCommandData;

export default commandConfig;
