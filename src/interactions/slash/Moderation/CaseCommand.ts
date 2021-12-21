import { ApplicationCommandData } from "discord.js";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums.js";

const commandConfig = {
    name: "case",
    description: "Get specific mod log case",
    options: [
        {
            name: "case",
            description: "The case id",
            type: ApplicationCommandOptionTypes.NUMBER,
            required: true
        }
    ]
} as ApplicationCommandData;

export default commandConfig;
