import { Client, Snowflake, ColorResolvable, MessageEmbed } from "discord.js";
import { ModLogCaseType } from "./constants.js";
import type { ModLogCase as ModLogCaseData } from "@prisma/client";
import { kClient } from "./tokens.js";
import { container } from "tsyringe";

const client = container.resolve<Client<true>>(kClient);

export interface ModLogData {
    reason: string;
    moderator: Snowflake;
    timestamp: number;
    type: ModLogCaseType;
    guild: Snowflake;
    target: Snowflake;
}

export type ModLogDataJSON = Omit<ModLogData, "timestamp"> & { timestamp: string };

export class ModLogCase {
    // @ts-expect-error default entry
    public data: ModLogData = {};

    constructor(entryData?: ModLogData) {
        if (entryData) this.data = entryData;
    }

    setReason(reason?: string) {
        this.data.reason = reason || "N/A";
        return this;
    }

    setModerator(mod: Snowflake) {
        this.data.moderator = mod;
        return this;
    }

    setTimestamp(time: Date | number = Date.now()) {
        this.data.timestamp = time instanceof Date ? time.getTime() : time;
        return this;
    }

    setType(type: ModLogCaseType) {
        this.data.type = type;
        return this;
    }

    setGuild(id: Snowflake) {
        this.data.guild = id;
        return this;
    }

    setTarget(id: Snowflake) {
        this.data.target = id;
        return this;
    }

    get type() {
        switch (this.data.type) {
            case ModLogCaseType.HACKBAN:
                return "Hack Ban";
            case ModLogCaseType.BAN:
                return "Ban";
            case ModLogCaseType.KICK:
                return "Kick";
            case ModLogCaseType.MODERATED_NICK:
                return "Moderated Nickname";
            case ModLogCaseType.MUTE:
                return "Mute";
            case ModLogCaseType.SOFTBAN:
                return "Soft Ban";
            case ModLogCaseType.UNBAN:
                return "Unban";
            case ModLogCaseType.UNMUTE:
                return "Unmute";
            case ModLogCaseType.WARN:
                return "Warn";
            default:
                return null;
        }
    }

    get color(): ColorResolvable {
        switch (this.data.type) {
            case ModLogCaseType.BAN:
            case ModLogCaseType.HACKBAN:
                return "RED";
            case ModLogCaseType.KICK:
                return "ORANGE";
            case ModLogCaseType.MODERATED_NICK:
                return "BLURPLE";
            case ModLogCaseType.MUTE:
                return "YELLOW";
            case ModLogCaseType.UNMUTE:
            case ModLogCaseType.UNBAN:
                return "GREEN";
            case ModLogCaseType.SOFTBAN:
                return "DARK_RED";
            case ModLogCaseType.WARN:
                return "GOLD";
            default:
                return "YELLOW";
        }
    }

    get timestamp() {
        return this.data.timestamp ? new Date(this.data.timestamp) : null;
    }

    toJSON() {
        if (typeof this.data.type !== "number") throw new TypeError("case type must be a number");
        if (!Object.values(ModLogCaseType).includes(this.data.type)) throw new RangeError("case type out of range");
        if (!this.data.moderator) throw new Error("moderator is a required field");
        if (!this.data.guild) throw new Error("guild is a required field");
        if (!this.data.target) throw new Error("target is a required field");

        if (!this.data.timestamp) this.setTimestamp();
        if (!this.data.reason) this.setReason();

        return {
            ...this.data,
            timestamp: new Date(this.data.timestamp).toJSON()
        } as ModLogDataJSON;
    }

    build(formatted: false): ModLogDataJSON;
    build(formatted?: boolean): ModLogDataJSON;
    build(formatted: true): ModLogCase;
    build(formatted = false): ModLogCase | ModLogDataJSON {
        // needed for validation
        const raw = this.toJSON();
        return formatted ? this : raw;
    }

    async toEmbed(entry: ModLogCaseData) {
        const getUser = async (id: string) => await client.users.fetch(id, { force: false }).catch(() => null);

        const embed = new MessageEmbed()
            .setColor(this.color)
            .setTimestamp(this.timestamp)
            .setTitle(`${this.type} | Case #${entry.case_id}`)
            .addField("User", `${(await getUser(entry.target))?.tag || "Unknown#0000"} (<@${entry.target}>)`, true)
            .addField("Moderator", `${(await getUser(entry.moderator))?.tag || "Unknown#0000"} (<@${entry.moderator}>)`, true)
            .addField("Reason", !entry.reason || entry.reason === "N/A" ? `Moderator do \`/reason ${entry.case_id} <reason>\`` : entry.reason, false)
            .setFooter(`Entry id: ${entry.id}`);

        return embed;
    }

    static createEmbed(entry: ModLogCaseData) {
        const embed = new ModLogCase({
            guild: entry.guild,
            reason: entry.reason,
            moderator: entry.moderator,
            target: entry.target,
            timestamp: new Date(entry.timestamp).getTime(),
            type: entry.type
        })
            .build(true)
            .toEmbed(entry);

        return embed;
    }
}
