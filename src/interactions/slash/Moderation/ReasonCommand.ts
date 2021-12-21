import { ApplicationCommandData } from "discord.js";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums.js";

const commandConfig = {
    name: "reason",
    description: "Update the reason for mod log case",
    options: [
        {
            name: "case",
            description: "The case id",
            type: ApplicationCommandOptionTypes.NUMBER,
            required: true
        },
        {
            name: "reason",
            description: "Mention the reason",
            type: ApplicationCommandOptionTypes.STRING,
            required: true
        }
    ]
} as ApplicationCommandData;

export default commandConfig;
