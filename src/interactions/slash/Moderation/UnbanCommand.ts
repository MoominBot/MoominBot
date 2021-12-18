import { ApplicationCommandData } from "discord.js";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums.js";

const commandConfig = {
    name: "unban",
    description: "Unbans a user from the server",
    options: [
        {
            name: "user",
            description: "The user id whom you want to unban",
            type: ApplicationCommandOptionTypes.STRING,
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
