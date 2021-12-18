import { ApplicationCommandData } from "discord.js";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";

export enum DevToolsCommand {
    EVAL = "eval",
    EXEC = "exec"
}

const commandConfig = {
    name: "devtools",
    description: "Developer tools",
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
        },
        {
            name: DevToolsCommand.EXEC,
            description: "Execute arbitrary command",
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            options: [
                {
                    name: "command",
                    description: "The command to be executed",
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
} as ApplicationCommandData;

export default commandConfig;
