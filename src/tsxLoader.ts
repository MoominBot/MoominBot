import * as https from "https";
import { DiscordComponents } from "discord.tsx";

https.globalAgent.options.rejectUnauthorized = false;

Object.defineProperty(globalThis, "DiscordComponents", {
    value: DiscordComponents
});
