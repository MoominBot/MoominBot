import Discord, { Collection } from "discord.js";
import { container, inject, injectable } from "tsyringe";

import BaseCommand from "#base/BaseCommand";
import { kClient, kCommands } from "#utils/tokens";
import { DevToolsCommand } from "#interactions/slash/DevTools/DevCommands";
import MoominUtils from "#utils/MoominUtils";
import { TOKEN_PLACEHOLDER } from "#utils/constants";
import { stripIndents } from "common-tags";
import { __dirname, __filename } from "#utils/dirname";
import importFresh from "#utils/importFresh";

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
                        content: `⏱️ | **Evaluation time:** \`${Date.now() - interaction.createdTimestamp}ms\``,
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
            case DevToolsCommand.RELOAD:
                {
                    const verified = await this.verifyPermissions(interaction.user.id);
                    if (!verified) return await interaction.reply({ ephemeral: true, content: "❌ | You are not authorized to use this command!" });
                    await interaction.deferReply({ ephemeral: true });
                    const name = interaction.options.getString("command", true);
                    const commandMeta = this.commands.get(name);
                    if (!commandMeta || !commandMeta.path) return await interaction.followUp({ content: "❌ | Invalid or uncached command!" });
                    // TODO: fix importFresh to import latest module
                    const newCommand = container.resolve<BaseCommand>(await importFresh(`file://${commandMeta.path}`).then((x) => x.default));
                    newCommand.setPath(commandMeta.path);
                    this.commands.set(commandMeta.name, newCommand);
                    await interaction.followUp({ content: `✅ | Command **${commandMeta.name}** was reloaded successfully!` });
                }
                break;
            default:
                return await interaction.reply({ ephemeral: true, content: "❌ | Invalid or unimplemented command!" });
        }
    }

    /* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-this-alias */
    async evaluate(code: string, args?: unknown) {
        try {
            const _moomin_X_output__Eval = await eval(stripIndents`
            (async (__dirname, __filename) => {
                return (
                    ${code}
                );
            })("${__dirname(import.meta.url)}", "${__filename(import.meta.url)}")`);
            return { error: false, output: this.createOutput(_moomin_X_output__Eval) };
        } catch (e) {
            return { error: true, output: this.createOutput(`${(e as Error).message || e}`) };
        }
    }
    /* eslint-enable @typescript-eslint/no-unused-vars, @typescript-eslint/no-this-alias */

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
