import {
    ApplicationCommand,
    AutocompleteInteraction,
    ButtonInteraction,
    Client,
    Collection,
    CommandInteraction,
    InteractionCollector,
    Message,
    MessageEmbed,
    Snowflake
} from "discord.js";
import { inject, injectable } from "tsyringe";
import chunkBy from "lodash/chunk.js";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { DiscordComponents, MessageActionRow, MessageButton } from "discord.tsx";

import BaseCommand from "#base/BaseCommand";
import { kClient } from "#utils/tokens";
import { HelpCommandSub } from "./subcommands/HelpCommand.js";

interface CommandCollectionInterface {
    name: string;
    description: string;
    type: string;
    autoEnabled: boolean;
}

interface StateInterface {
    currentPage: CommandCollectionInterface[];
}

@injectable()
export default class extends BaseCommand {
    public state: StateInterface = {
        currentPage: []
    };
    constructor(@inject(kClient) public readonly client: Client<true>) {
        super({
            name: "help"
        });
    }

    setState(data: StateInterface) {
        this.state = data;
    }

    async handleAutoComplete(interaction: AutocompleteInteraction, commands: Collection<string, ApplicationCommand>) {
        if (interaction.responded) return;
        const data = commands.map((m) => ({
            name: m.name,
            description: m.description || null
        }));

        const query = interaction.options.getString("command", false);
        if (!query) return await interaction.respond(data.map((m) => ({ name: m.name, value: m.name })));

        const results = data.filter((x) => x.name.includes(query) || !!x.description?.includes(query));
        return await interaction.respond(results.map((m) => ({ name: m.name, value: m.name })));
    }

    async execute(interaction: CommandInteraction | AutocompleteInteraction) {
        if (!interaction.isAutocomplete()) await interaction.deferReply();
        const commands = await this.fetchCommands(interaction);
        if (!commands) return;
        if (interaction.isAutocomplete()) return this.handleAutoComplete(interaction, commands.cache);
        const commandName = interaction.options.getString("command", false);
        if (commandName) {
            return HelpCommandSub(this.client, interaction, commandName, commands);
        }

        const commandsCollection = commands.cache.map((m) => ({
            name: m.name,
            description: m.description,
            type: {
                CHAT_INPUT: "Slash Command",
                USER: "User Context Menu",
                MESSAGE: "Message Context Menu"
            }[m.type],
            autoEnabled: m.defaultPermission
        })) as CommandCollectionInterface[];
        const pages = chunkBy(commandsCollection, 5);
        this.setState({ currentPage: pages[0] });

        const msg = (await interaction.followUp({
            embeds: [this.buildPage(this.state.currentPage, 1, pages.length)],
            components: this.prepareButtons(),
            fetchReply: true
        })) as Message<true>;

        const event = msg.createMessageComponentCollector({
            componentType: "BUTTON",
            filter: (x) => x.message.id === msg.id && ["back", "front"].includes(x.customId),
            time: 60_000
        });

        return this.handleInteraction(event, msg, interaction.user.id, pages);
    }

    async handleInteraction(collector: InteractionCollector<ButtonInteraction<"cached">>, message: Message<true>, target: Snowflake, pages: CommandCollectionInterface[][]) {
        collector.on("collect", async (interaction) => {
            if (interaction.user.id !== target) {
                if (interaction.replied) return;
                const ops = {
                    embeds: [this.prepareError(`❌ | Only <@${target}> can use this button.`)],
                    ephemeral: true
                };

                if (interaction.deferred) return void (await interaction.followUp(ops));
                return void (await interaction.reply(ops));
            }

            switch (interaction.customId) {
                case "back":
                    {
                        const newPage = this.paginate(pages, this.state.currentPage, true);
                        const nextPage = this.buildPage(newPage.page, newPage.id, newPage.total);
                        this.setState({ currentPage: newPage.page });
                        await interaction.deferUpdate();
                        await interaction.editReply({ embeds: [nextPage] });
                        collector.resetTimer();
                    }
                    break;
                case "front":
                    {
                        const newPage = this.paginate(pages, this.state.currentPage, false);
                        const nextPage = this.buildPage(newPage.page, newPage.id, newPage.total);
                        this.setState({ currentPage: newPage.page });
                        await interaction.deferUpdate();
                        await interaction.editReply({ embeds: [nextPage] });
                        collector.resetTimer();
                    }
                    break;
                default:
                    break;
            }
        });

        collector.on("end", async () => {
            if (!message.deleted && message.editable) {
                const components = this.prepareButtons(true);
                await message.edit({ components });
            }
        });
    }

    prepareButtons(disabled = false) {
        return (
            <>
                <MessageActionRow>
                    <MessageButton style="SUCCESS" label="Back" emoji="915183448606511145" customId="back" disabled={!!disabled} />
                    <MessageButton style="SUCCESS" label="Next" emoji="915183144464953364" customId="front" disabled={!!disabled} />
                </MessageActionRow>
            </>
        ).components;
    }

    paginate(pages: CommandCollectionInterface[][], currentPage: CommandCollectionInterface[] | null, back = false) {
        if (!currentPage)
            return {
                page: pages[0],
                id: 1,
                total: pages.length
            };
        const currentPageIndex = back ? pages.indexOf(currentPage) - 1 : pages.indexOf(currentPage) + 1;
        const newPage = pages[currentPageIndex] || pages[back ? pages.length - 1 : 0];

        return {
            page: newPage,
            id: pages.indexOf(newPage) + 1 || 1,
            total: pages.length
        };
    }

    buildPage(page: CommandCollectionInterface[], id: number, total: number) {
        return new MessageEmbed()
            .setTitle("MoominBot Commands")
            .setDescription(`There ${page.length === 1 ? "is" : "are"} total ${page.length} commands in this page.`)
            .setThumbnail(this.client.user.displayAvatarURL())
            .addFields(
                page.map((m) => ({
                    name: m.name,
                    value: `${m.description}\n**Auto Enabled**: ${m.autoEnabled ? "✅" : "❌"}\n**Command Type**: ${m.type}`,
                    inline: false
                }))
            )
            .setColor("RANDOM")
            .setFooter(`Page ${id} of ${total}`)
            .setTimestamp();
    }

    async fetchCommands(interaction: CommandInteraction | AutocompleteInteraction) {
        try {
            const guild = interaction.guild || (await this.client.guilds.fetch(interaction.guildId));
            // return if guild is still not available
            if (!guild) {
                if (!interaction.isAutocomplete()) await interaction.followUp({ embeds: [this.prepareError("❌ | Something went wrong.")] });
                return false;
            }
            // try fetching command
            const commands = !guild.commands.cache.size
                ? await guild.commands.fetch({
                      force: true,
                      cache: true
                  })
                : guild.commands.cache;
            if (!commands.size) {
                if (!interaction.isAutocomplete()) await interaction.followUp({ embeds: [this.prepareError("❌ | Something went wrong.")] });
                return false;
            }

            return { cache: commands, guild };
        } catch {
            if (!interaction.isAutocomplete()) await interaction.followUp({ embeds: [this.prepareError("❌ | Something went wrong.")] });
            return false;
        }
    }

    prepareError(message: string) {
        return new MessageEmbed({
            description: message,
            title: "Command Error",
            color: "RED",
            timestamp: Date.now()
        });
    }
}
