import { ApplicationCommandData } from "discord.js";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums.js";

const commandConfig = {
    name: "kick",
    description: "Kick the member",
    options: [
        {
            name: "user",
            description: "The user whom you want to kick",
            type: ApplicationCommandOptionTypes.USER,
            required: true
        },
        {
            name: "reason",
            description: "Mention the reason",
            type: ApplicationCommandOptionTypes.STRING,
            required: false
        }
    ]
} as ApplicationCommandData;

export default commandConfig;
