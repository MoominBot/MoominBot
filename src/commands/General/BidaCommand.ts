import { Client, CommandInteraction, MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { inject, injectable } from "tsyringe";

import BaseCommand from "#base/BaseCommand";
import { kClient } from "#utils/tokens";
import Bidas from "#utils/bidas";
import { monthMap } from "#interactions/slash/General/BidaCommand";

@injectable()
export default class extends BaseCommand {
    constructor(@inject(kClient) public readonly client: Client<true>) {
        super({
            name: "bida",
            category: "General"
        });
    }

    async execute(interaction: CommandInteraction) {
        const actionRow = new MessageActionRow().addComponents([new MessageButton().setLabel("Powered by NepaliPatro").setURL("https://nepalipatro.com.np").setStyle("LINK")]);
        const month = interaction.options.getInteger("month")!;
        const data = await Bidas.get();
        const months = Object.entries(monthMap);
        const bidas = data!.filter((itm) => itm.bs_month === month - 1);
        const embed = new MessageEmbed().setTitle(`Bidas for ${months.find((itm) => itm[1] === month - 1)![0]}`).setColor("BLURPLE");
        embed.setThumbnail("https://i.ytimg.com/vi/jLJR26ha65g/hqdefault.jpg");
        bidas.forEach((element) => embed.addField(`${element.title}`, `${element.bs.split(".").reverse().join("-")}`, true));
        await interaction.reply({ embeds: [embed], components: [actionRow] });
    }
}
