import { ApplicationCommandData } from "discord.js";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";

export enum DevToolsCommand {
    // commands
    EVAL = "eval",
    RELOAD = "reload",
    // groups
    RUNTIME = "runtime"
}

const commandConfig = {
    name: "devtools",
    description: "Developer tools",
    options: [
        {
            name: DevToolsCommand.RUNTIME,
            description: "Do something during runtime phase",
            type: ApplicationCommandOptionTypes.SUB_COMMAND_GROUP,
            options: [
                {
                    name: DevToolsCommand.EVAL,
                    description: "Evaluate arbitrary JavaScript",
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    options: [
                        {
                            name: "code",
                            description: "The arbitrary JavaScript code to be evaluated",
                            type: ApplicationCommandOptionTypes.STRING,
                            required: true
                        },
                        {
                            name: "hidden",
                            description: "Return hidden response",
                            type: ApplicationCommandOptionTypes.BOOLEAN,
                            required: false
                        }
                    ]
                }
            ]
        },
        {
            name: DevToolsCommand.RELOAD,
            description: "Reload a cached command",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            options: [
                {
                    name: "command",
                    description: "The command to reload",
                    type: ApplicationCommandOptionTypes.STRING,
                    required: true
                }
            ]
        }
    ]
} as ApplicationCommandData;

export default commandConfig;
