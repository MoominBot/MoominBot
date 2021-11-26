import { ApplicationCommandData } from "discord.js";
import { ApplicationCommandTypes } from "discord.js/typings/enums.js";

const commandConfig = {
    name: "Userinfo",
    type: ApplicationCommandTypes.USER
} as ApplicationCommandData;

export default commandConfig;
