import { ApplicationCommandData } from "discord.js";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums.js";

const commandConfig = {
    name: "fakemessage",
    description: "Send someone a fake message",
    options: [
        {
            name: "user",
            description: "The user to send the message",
            type: ApplicationCommandOptionTypes.USER,
            autocomplete: false,
            required: true
        },
        {
            name: "message",
            description: "The message to send",
            type: ApplicationCommandOptionTypes.STRING,
            autocomplete: false,
            required: true
        }
    ]
} as ApplicationCommandData;

export default commandConfig;
