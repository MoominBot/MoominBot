import { ApplicationCommandData } from "discord.js";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums.js";

const commandConfig = {
    name: "kiss",
    description: "Give someone a kiss",
    options: [
        {
            name: "user",
            description: "The user to kiss",
            type: ApplicationCommandOptionTypes.USER,
            autocomplete: false,
            required: false
        }
    ]
} as ApplicationCommandData;

export default commandConfig;
