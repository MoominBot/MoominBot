import { ApplicationCommand, Client, Collection, CommandInteraction, Guild, MessageEmbed } from "discord.js";

interface CommandsInterface {
    // eslint-disable-next-line @typescript-eslint/ban-types
    cache: Collection<string, ApplicationCommand<{}>>;
    guild: Guild;
}

export async function HelpCommandSub(client: Client<true>, interaction: CommandInteraction, commandName: string, commands: CommandsInterface) {
    if (interaction.replied) return;
    if (!interaction.deferred) await interaction.deferReply();
    const command = commands.cache.find((x) => x.name === commandName);
    if (!command) return await interaction.followUp({ content: `❌ | Command "${commandName}" not found!`, ephemeral: true });

    const embed = new MessageEmbed()
        .setTitle("Command Information")
        .setThumbnail(client.user.displayAvatarURL())
        .addField("Name", command.name || commandName)
        .addField("Description", command.description || "N/A")
        .addField("Auto Enabled", command.defaultPermission ? "✅" : "❌")
        .addField("Options", command.options.map((m) => `\`${m.name}\``).join(", ") || "N/A")
        .setColor("BLURPLE")
        .setFooter("Command created:")
        .setTimestamp(command.createdTimestamp);

    return await interaction.followUp({ embeds: [embed] });
}
