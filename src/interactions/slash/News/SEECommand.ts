import { ApplicationCommandData } from "discord.js";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";

const commandConfig = {
    name: "see",
    description: "Get SEE result",
    options: [
        {
            name: "symbol",
            description: "Your symbol number",
            type: ApplicationCommandOptionTypes.STRING,
            required: true
        }
    ]
} as ApplicationCommandData;

export default commandConfig;
