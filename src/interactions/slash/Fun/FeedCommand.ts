import { ApplicationCommandData } from "discord.js";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums.js";

const commandConfig = {
    name: "feed",
    description: "Feed someone/Ask for food",
    options: [
        {
            name: "user",
            description: "The user to feed",
            type: ApplicationCommandOptionTypes.USER,
            autocomplete: false,
            required: false
        }
    ]
} as ApplicationCommandData;

export default commandConfig;
