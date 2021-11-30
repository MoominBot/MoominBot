import { ApplicationCommandData } from "discord.js";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums.js";

const commandConfig = {
    name: "laugh",
    description: "Laugh randomly / laugh at someone",
    options: [
        {
            name: "user",
            description: "The user to laugh at",
            type: ApplicationCommandOptionTypes.USER,
            autocomplete: false,
            required: false
        }
    ]
} as ApplicationCommandData;

export default commandConfig;
