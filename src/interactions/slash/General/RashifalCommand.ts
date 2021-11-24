import { ApplicationCommandData } from "discord.js";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";

export enum RashifalMap {
    "मेष" = "Aries",
    "वृष" = "Taurus",
    "मिथुन" = "Gemini",
    "कर्कट" = "Cancer",
    "सिंह" = "Leo",
    "कन्या" = "Virgo",
    "तुला" = "Libra",
    "वृश्चिक" = "Scorpio",
    "धनु" = "Sagittarius",
    "मकर" = "Capricorn",
    "कुम्भ" = "Aquarius",
    "मीन" = "Pisces"
}

const commandConfig = {
    name: "rashifal",
    description: "Shows Rashifal",
    options: [
        {
            name: "rashi",
            description: "Name of the Rashi",
            required: true,
            type: ApplicationCommandOptionTypes.STRING,
            choices: Object.entries(RashifalMap).map(([k, v]) => {
                return { name: `${k} (${v})`, value: v };
            })
        }
    ]
} as ApplicationCommandData;

export default commandConfig;
