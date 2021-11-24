import { ApplicationCommandData } from "discord.js";

const commandConfig = {
    name: "rashifal",
    description: "Shows Rashifal",
    options: [
        {
            name: "rashi",
            description: "Name of the rashi",
            required: true,
            type: "STRING",
            // choices: []
        }
    ]
} as ApplicationCommandData;

export default commandConfig;
