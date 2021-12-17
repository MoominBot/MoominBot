import { ApplicationCommandData } from "discord.js";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";

export enum ConfigCommands {
    RONB = "ronb",
    MODLOG = "modlog",
    PANEL = "panel"
}

const commandConfig = {
    name: "config",
    description: "Server configuration",
    options: [
        {
            name: ConfigCommands.PANEL,
            description: "The config panel",
            type: ApplicationCommandOptionTypes.SUB_COMMAND
        },
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
        },
        {
            name: ConfigCommands.MODLOG,
            description: "Set moderation log channel",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            options: [
                {
                    name: "channel",
                    description: "The channel where moderation log should be posted",
                    type: ApplicationCommandOptionTypes.CHANNEL,
                    required: false
                }
            ]
        }
    ]
} as ApplicationCommandData;

export default commandConfig;
