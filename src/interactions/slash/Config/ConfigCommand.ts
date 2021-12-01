import { ApplicationCommandData } from "discord.js";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";

export enum ConfigCommands {
    RONB = "ronb"
}

const commandConfig = {
    name: "config",
    description: "Server configuration",
    options: [
        {
            name: "name",
            description: "Config name",
            type: ApplicationCommandOptionTypes.SUB_COMMAND_GROUP,
            options: [
                {
                    name: ConfigCommands.RONB,
                    description: "Routine of Nepal banda config",
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    options: [
                        {
                            name: "channel",
                            description: "The channel where RONB feed should be posted",
                            type: ApplicationCommandOptionTypes.CHANNEL,
                            required: false
                        }
                    ]
                }
            ]
        }
    ]
} as ApplicationCommandData;

export default commandConfig;
