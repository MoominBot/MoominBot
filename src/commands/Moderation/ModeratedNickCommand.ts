import BaseCommand from "#base/BaseCommand";
import { inject, injectable } from "tsyringe";
import { kClient } from "#utils/tokens";
import { Client, CommandInteraction, Permissions } from "discord.js";

@injectable()
export default class extends BaseCommand {
    constructor(@inject(kClient) public readonly client: Client<true>) {
        super({
            name: "nick",
            category: "Moderation"
        });
    }

    async execute(interaction: CommandInteraction) {
        const nickname = (Math.random() + 1).toString(36).substring(5);
        const user = interaction.options.getUser("user");
        const member = await interaction.guild?.members.fetch(user!.id);

        if (!interaction.memberPermissions?.has(Permissions.FLAGS.MANAGE_NICKNAMES)) {
            return await interaction.reply({ content: "You don't have the required permissions to run this command" });
        }

        await member!.setNickname(`Moderated Nickname ${nickname}`);

        await interaction.reply({ content: `Sucessfully Moderated ${user!.tag}'s nickname.` });
    }
}
