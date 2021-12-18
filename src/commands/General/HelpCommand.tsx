import {
    ApplicationCommand,
    AutocompleteInteraction,
    ButtonInteraction,
    Client,
    Collection,
    CommandInteraction,
    Guild,
    InteractionCollector,
    Message,
    MessageEmbed,
    Snowflake,
    MessageActionRow as DiscordMessageActionRow,
    MessageSelectMenu,
    SelectMenuInteraction
} from "discord.js";
import { inject, injectable } from "tsyringe";
import chunkBy from "lodash/chunk.js";
import { MessageActionRow, MessageButton } from "discord.tsx";

import BaseCommand from "#base/BaseCommand";
import { kClient, kCommands } from "#utils/tokens";
import { HelpCommandSub } from "./subcommands/HelpCommand.js";
import { stripIndents } from "common-tags";
import { Emojis } from "#utils/constants";

interface CommandCollectionInterface {
    name: string;
    description: string;
    type: string;
    category: string;
}

interface MenuInterface {
    category: string[];
    disabled: boolean;
}

interface StateInterface {
    currentPage: CommandCollectionInterface[];
}

@injectable()
export default class extends BaseCommand {
    public state: StateInterface = {
        currentPage: []
    };
    constructor(@inject(kClient) public readonly client: Client<true>, @inject(kCommands) public readonly commands: Collection<string, BaseCommand>) {
        super({
            name: "help",
            category: "General"
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
            return HelpCommandSub(this.client, interaction, commandName, commands, this.commands);
        }

        const commandsCollection = commands.cache.map((m) => ({
            name: m.name,
            description: m.description,
            type: {
                CHAT_INPUT: "Slash Command",
                USER: "User Context Menu",
                MESSAGE: "Message Context Menu"
            }[m.type],
            category: this.commands.find((x) => x.name.toLowerCase() === m.name.toLowerCase())?.category || "Other"
        })) as CommandCollectionInterface[];
        const pages = chunkBy(commandsCollection, 5);
        this.setState({ currentPage: pages[0] });

        const msg = (await interaction.followUp({
            embeds: [this.buildPage(this.state.currentPage, 1, pages.length)],
            components: [
                ...this.prepareButtons(),
                this.prepareMenu({
                    category: [...new Set(commandsCollection.map((m) => m.category))],
                    disabled: false
                })
            ],
            fetchReply: true
        })) as Message<true>;

        const event = msg.createMessageComponentCollector({
            componentType: "BUTTON",
            filter: (x) => x.message.id === msg.id && ["back", "front", "close", "first", "last"].includes(x.customId),
            time: 60_000
        });

        const categoryEvent = msg.createMessageComponentCollector({
            componentType: "SELECT_MENU",
            filter: (x) => x.message.id === msg.id && ["commandsCategory"].includes(x.customId),
            time: 60_000
        });

        this.handleSelectMenu(categoryEvent, msg, interaction.user.id, pages);
        return this.handleInteraction(event, categoryEvent, msg, interaction.user.id, pages);
    }

    async handleSelectMenu(collector: InteractionCollector<SelectMenuInteraction<"cached">>, message: Message<true>, target: Snowflake, pages: CommandCollectionInterface[][]) {
        collector.on("collect", async (interaction) => {
            if (interaction.replied) return;
            if (interaction.user.id !== target) {
                const ops = {
                    embeds: [this.prepareError(`❌ | Only <@${target}> can use this menu.`)],
                    ephemeral: true
                };

                if (interaction.deferred) return void (await interaction.followUp(ops));
                return void (await interaction.reply(ops));
            }

            switch (interaction.customId) {
                case "commandsCategory":
                    {
                        const newPage = pages.flat().filter((x) => interaction.values.includes(x.category));
                        const nextPage = this.buildPage(newPage, 1, 1);
                        this.setState({ currentPage: newPage });
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
                const components = [
                    ...this.prepareButtons(true),
                    this.prepareMenu({
                        disabled: true,
                        category: ["1"]
                    })
                ];
                await message.edit({ components });
            }
        });
    }

    async handleInteraction(
        collector: InteractionCollector<ButtonInteraction<"cached">>,
        c1: InteractionCollector<SelectMenuInteraction<"cached">>,
        message: Message<true>,
        target: Snowflake,
        pages: CommandCollectionInterface[][]
    ) {
        collector.on("collect", async (interaction) => {
            if (interaction.replied) return;
            if (interaction.user.id !== target) {
                const ops = {
                    embeds: [this.prepareError(`❌ | Only <@${target}> can use this button.`)],
                    ephemeral: true
                };

                if (interaction.deferred) return void (await interaction.followUp(ops));
                return void (await interaction.reply(ops));
            }

            switch (interaction.customId) {
                case "first":
                case "last":
                    {
                        const newPage = pages[interaction.customId === "first" ? 0 : pages.length - 1];
                        const nextPage = this.buildPage(newPage, interaction.customId === "first" ? 1 : pages.length, pages.length);
                        this.setState({ currentPage: newPage });
                        await interaction.deferUpdate();
                        await interaction.editReply({ embeds: [nextPage] });
                        collector.resetTimer();
                    }
                    break;
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
                case "close":
                    {
                        collector.stop();
                        await interaction.deferUpdate().catch(() => null);
                        if (interaction.message.deletable) await interaction.message.delete().catch(() => null);
                    }
                    break;
                default:
                    break;
            }
        });

        collector.on("end", async () => {
            if (!message.deleted && message.editable) {
                const components = [
                    ...this.prepareButtons(true),
                    this.prepareMenu({
                        disabled: true,
                        category: ["1"]
                    })
                ];
                await message.edit({ components });
            }
        });
    }

    prepareButtons(disabled = false) {
        return (
            <>
                <MessageActionRow>
                    <MessageButton style="PRIMARY" emoji="⏪" customId="first" disabled={!!disabled} />
                    <MessageButton style="PRIMARY" emoji="915183448606511145" customId="back" disabled={!!disabled} />
                    <MessageButton style="DANGER" emoji="✖️" customId="close" disabled={!!disabled} />
                    <MessageButton style="PRIMARY" emoji="915183144464953364" customId="front" disabled={!!disabled} />
                    <MessageButton style="PRIMARY" emoji="⏩" customId="last" disabled={!!disabled} />
                </MessageActionRow>
            </>
        ).components;
    }

    prepareMenu(ops: MenuInterface) {
        return new DiscordMessageActionRow().addComponents(
            new MessageSelectMenu()
                .setDisabled(!!ops.disabled)
                .addOptions(
                    ops.category.map((m) => ({
                        label: m,
                        value: m,
                        description: `Commands under ${m} category`
                    }))
                )
                .setCustomId("commandsCategory")
                .setPlaceholder("Select a category...")
        );
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
                    value: stripIndents`${m.description}
                    ${Emojis.REPLY_BRANCH} Type: **${m.type}**
                    ${Emojis.REPLY} Category: **${m.category}**`,
                    inline: false
                }))
            )
            .setColor("BLURPLE")
            .setFooter(`Page ${id} of ${total}`)
            .setTimestamp();
    }

    async getCommands(guild?: Guild) {
        const guildCommands = guild
            ? !guild.commands.cache.size
                ? await guild.commands.fetch({
                      force: true,
                      cache: true
                  })
                : guild.commands.cache
            : null;
        if (!this.client.application.commands.cache.size) {
            const fetched = await this.client.application.commands.fetch({
                force: true,
                cache: true
            });
            return guildCommands ? fetched.concat(guildCommands) : fetched;
        } else {
            return guildCommands ? this.client.application.commands.cache.concat(guildCommands) : this.client.application.commands.cache;
        }
    }

    async fetchCommands(interaction: CommandInteraction | AutocompleteInteraction) {
        try {
            const guild = interaction.guild || (await this.client.guilds.fetch(interaction.guildId));
            // return if guild is still not available
            if (!guild) {
                if (!interaction.isAutocomplete()) await interaction.followUp({ embeds: [this.prepareError("❌ | Something went wrong: `could not find guild`")] });
                return false;
            }
            // try fetching command
            const commands = await this.getCommands(guild);
            if (!commands.size) {
                if (!interaction.isAutocomplete()) await interaction.followUp({ embeds: [this.prepareError("❌ | Something went wrong: `could not find commands`")] });
                return false;
            }

            return { cache: commands, guild };
        } catch {
            if (!interaction.isAutocomplete()) await interaction.followUp({ embeds: [this.prepareError("❌ | Something went wrong: `could not fetch commands`")] });
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
