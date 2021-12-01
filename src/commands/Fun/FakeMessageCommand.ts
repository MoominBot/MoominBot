import { Client, CommandInteraction, TextChannel } from "discord.js";
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
        const message = interaction.options.getString("message");
        // @ts-expect-error TS is weird
        const channel: TextChannel = await interaction.guild?.channels.fetch(interaction.channelId);
        const webhook = await channel.createWebhook(user!.username, {
            avatar: user?.avatarURL(),
            reason: "Fake Message Command"
        });

        await webhook.send({ content: message });

        await interaction.reply({ content: "Done 👌", ephemeral: true });
        await webhook.delete();
    }
}
