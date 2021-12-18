import { Client, CommandInteraction, Permissions, TextChannel } from "discord.js";
import { inject, injectable } from "tsyringe";
import BaseCommand from "#base/BaseCommand";
import { kClient } from "#utils/tokens";

@injectable()
export default class extends BaseCommand {
    constructor(@inject(kClient) public readonly client: Client<true>) {
        super({
            name: "fakemessage",
            category: "Fun"
        });
    }

    async execute(interaction: CommandInteraction) {
        const user = interaction.options.getUser("user");
        const member = await interaction.guild?.members.fetch(user!.id);
        if (!interaction.memberPermissions?.has(Permissions.FLAGS.MANAGE_WEBHOOKS)) {
            return await interaction.reply({ content: "You don't have appropriate permissions to run this command." });
        }
        const message = interaction.options.getString("message");
        // @ts-expect-error TS is weird
        const channel: TextChannel = await interaction.guild?.channels.fetch(interaction.channelId);
        const webhook = await channel.createWebhook(member!.nickname ?? user!.username, {
            avatar: user?.displayAvatarURL(),
            reason: "Fake Message Command"
        });

        await webhook.send({ content: message });

        await interaction.reply({ content: "Done 👌", ephemeral: true });
        await webhook.delete();
    }
}
