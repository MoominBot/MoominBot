import { ApplicationCommandData } from "discord.js";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums.js";

const commandConfig = {
    name: "softban",
    description: "Soft ban the member",
    options: [
        {
            name: "user",
            description: "The user whom you want to ban",
            type: ApplicationCommandOptionTypes.USER,
            required: true
        },
        {
            name: "reason",
            description: "Mention the reason",
            type: ApplicationCommandOptionTypes.STRING,
            required: false
        },
        {
            name: "purge",
            description: "The number of days to purge",
            type: ApplicationCommandOptionTypes.NUMBER,
            required: false,
            choices: new Array(8).fill(null).map((_, idx) => ({
                name: `Purge ${idx} day${idx === 1 ? "" : "s"}`,
                value: idx
            }))
        }
    ]
} as ApplicationCommandData;

export default commandConfig;
