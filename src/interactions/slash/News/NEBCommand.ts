import { ApplicationCommandData } from "discord.js";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";

const commandConfig = {
    name: "neb",
    description: "Get NEB result",
    options: [
        {
            name: "symbol",
            description: "Your symbol number",
            type: ApplicationCommandOptionTypes.STRING,
            required: true
        },
        {
            name: "dob",
            description: "Your date of birth (YYYY/MM/DD or YY/MM/DD)",
            type: ApplicationCommandOptionTypes.STRING,
            required: true
        }
    ]
} as ApplicationCommandData;

export default commandConfig;
