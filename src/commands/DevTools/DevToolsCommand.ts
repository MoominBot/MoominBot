/* eslint-disable @typescript-eslint/no-unused-vars */
import Discord, { Collection } from "discord.js";
// @ts-expect-error no unused vars
import { container, inject, injectable } from "tsyringe";

import BaseCommand from "#base/BaseCommand";
import { kClient, kCommands } from "#utils/tokens";
import { DevToolsCommand } from "#interactions/slash/DevTools/DevCommands";
import MoominUtils from "#utils/MoominUtils";
import { TOKEN_PLACEHOLDER } from "#utils/constants";
import { stripIndents } from "common-tags";
import { __dirname, __filename } from "#utils/dirname";
import { exec } from "node:child_process";

@injectable()
export default class extends BaseCommand {
    constructor(@inject(kClient) public readonly client: Discord.Client<true>, @inject(kCommands) public readonly commands: Collection<string, BaseCommand>) {
        super({
            name: "devtools",
            category: "Developer Tools"
        });
    }

    async execute(interaction: Discord.CommandInteraction<"cached">) {
        const commandName = interaction.options.getSubcommand(true) as DevToolsCommand;
        const hiddenResponse = interaction.options.getBoolean("hidden", false) || false;

        switch (commandName) {
            case DevToolsCommand.EVAL:
                {
                    const verified = await this.verifyPermissions(interaction.user.id);
                    if (!verified) return await interaction.reply({ ephemeral: true, content: "❌ | You are not authorized to use this command!" });
                    await interaction.deferReply({ ephemeral: hiddenResponse });
                    const rawCode = interaction.options.getString("code", true);
                    const res = await this.evaluate(rawCode, { client: this.client, interaction });
                    await interaction.followUp({
                        content: `⏱️ | **Evaluation time:** \`${((Date.now() - interaction.createdTimestamp) / 1000).toFixed(2)} seconds\``,
                        embeds: [
                            {
                                description: `\`\`\`js\n${res.output}\n\`\`\``,
                                color: res.error ? "RED" : "GREEN",
                                title: `Evaluation Result - ${res.error ? "Error" : "Success"}`,
                                footer: {
                                    text: `Requested by ${interaction.user.tag}`,
                                    iconURL: interaction.user.displayAvatarURL()
                                }
                            }
                        ]
                    });
                }
                break;
            case DevToolsCommand.EXEC:
                {
                    const verified = await this.verifyPermissions(interaction.user.id);
                    if (!verified) return await interaction.reply({ ephemeral: true, content: "❌ | You are not authorized to use this command!" });
                    await interaction.deferReply({ ephemeral: hiddenResponse });
                    const rawCommand = interaction.options.getString("command", true);
                    const response = await this.execUnsafe(rawCommand);
                    await interaction.followUp({
                        content: `⏱️ | **Evaluation time:** \`${((Date.now() - interaction.createdTimestamp) / 1000).toFixed(2)} seconds\``,
                        embeds: [
                            {
                                description: `\`\`\`shell\n${response.output}\n\`\`\``,
                                color: response.error ? "RED" : "GREEN",
                                title: `Evaluation Result - ${response.error ? "Error" : "Success"}`,
                                footer: {
                                    text: `Requested by ${interaction.user.tag}`,
                                    iconURL: interaction.user.displayAvatarURL()
                                }
                            }
                        ]
                    });
                }
                break;
            default:
                return await interaction.reply({ ephemeral: true, content: "❌ | Invalid or unimplemented command!" });
        }
    }

    execUnsafe(command: string) {
        return new Promise<{ error: boolean; output: string }>((resolve) => {
            exec(
                command,
                {
                    encoding: "utf8",
                    windowsHide: true,
                    timeout: 60_000
                },
                (error, stdout, stderr) => {
                    if (error)
                        return resolve({
                            error: true,
                            output: this.createOutput(error.message || `${error}`)
                        });
                    if (stderr)
                        return resolve({
                            error: true,
                            output: this.createOutput(stderr || "Evaluation Error")
                        });
                    return resolve({
                        error: false,
                        output: this.createOutput(stdout || "<{STDOUT}>")
                    });
                }
            );
        });
    }

    /* eslint-disable @typescript-eslint/no-this-alias */
    async evaluate(code: string, args?: unknown) {
        try {
            const _moomin_X_output__Eval = await eval(stripIndents`
            (async (__dirname, __filename) => {
                ${code}
            })("${__dirname(import.meta.url)}", "${__filename(import.meta.url)}")`);
            return { error: false, output: this.createOutput(_moomin_X_output__Eval) };
        } catch (e) {
            return { error: true, output: this.createOutput(`${(e as Error).message || e}`) };
        }
    }
    /* eslint-enable @typescript-eslint/no-this-alias */

    createOutput(txt: string) {
        const res = MoominUtils.cleanOutput(txt, [
            {
                from: this.client.token,
                to: TOKEN_PLACEHOLDER
            }
        ]);

        if (res.length > 2000) {
            return `${res.slice(0, 2000)}\n...${(res.length - 2000).toLocaleString()} more characters`;
        }

        return res;
    }

    async verifyPermissions(user: Discord.Snowflake) {
        const app = !this.client.application?.owner ? await this.client.application.fetch().then((x) => x.owner!) : this.client.application.owner!;
        if (app instanceof Discord.User) {
            return app.id === user;
        } else if (app instanceof Discord.Team) {
            return app.members.some((x) => x.membershipState === "ACCEPTED" && x.id === user);
        } else {
            return false;
        }
    }
}
