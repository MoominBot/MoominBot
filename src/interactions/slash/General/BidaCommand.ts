import { ApplicationCommandData } from "discord.js";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";

export const monthMap = {
    वैशाख: 1,
    जेठ: 2,
    असार: 3,
    साउन: 4,
    भदौ: 5,
    असोज: 6,
    कार्तिक: 7,
    मंसिर: 8,
    पुस: 9,
    माघ: 10,
    फागुन: 11,
    चैत: 12
};

const commandConfig = {
    name: "bida",
    description: "Show all the bidas of the current month",
    options: [
        {
            name: "month",
            description: "Month whose bida you want",
            type: ApplicationCommandOptionTypes.INTEGER,
            autocomplete: false,
            required: true,
            choices: Object.entries(monthMap).map(([k, v]) => {
                return { name: k, value: v + 1 };
            })
        }
    ]
} as ApplicationCommandData;

export default commandConfig;
