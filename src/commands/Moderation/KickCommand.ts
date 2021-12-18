import BaseCommand from "#base/BaseCommand";
import { inject, injectable } from "tsyringe";
import { kClient } from "#utils/tokens";
import { Client, CommandInteraction, Permissions } from "discord.js";

@injectable()
export default class extends BaseCommand {
    constructor(@inject(kClient) public readonly client: Client<true>) {
        super({
            name: "kick",
            category: "Moderation"
        });
    }

    async execute(interaction: CommandInteraction) {
        const user = interaction.options.getUser("user");
        const member = await interaction.guild?.members.fetch(user!.id);

        if (!interaction.memberPermissions?.has(Permissions.FLAGS.KICK_MEMBERS)) {
            return await interaction.reply({ content: "You don't have the required permissions to run this command" });
        }
        const reason = interaction.options.getString("reason", true);
        await member?.kick(reason);
        await interaction.reply({ content: `${user?.tag} has been kicked` });
    }
}
