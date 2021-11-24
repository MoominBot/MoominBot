import { ApplicationCommandData } from "discord.js";

export enum RashifalMap {
    "मेष" = "ARIES",
    "वृष" = "TAURUS",
    "मिथुन" = "GEMINI",
    "कर्कट" = "CANCER",
    "सिंह" = "LEO",
    "कन्या" = "VIRGO",
    "तुला" = "LIBRA",
    "वृश्चिक" = "SCORPIO",
    "धनु" = "SAGITTARIUS",
    "मकर" = "CAPRICORN",
    "कुम्भ" = "AQUARIUS",
    "मीन" = "PISCES"
}

const commandConfig = {
    name: "rashifal",
    description: "Shows Rashifal",
    options: [
        {
            name: "rashi",
            description: "Name of the Rashi",
            required: true,
            type: "STRING",
            choices: Object.entries(RashifalMap).map(([k, v]) => {
                return { name: k, value: v };
            })
        }
    ]
} as ApplicationCommandData;

export default commandConfig;
