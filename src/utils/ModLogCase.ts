import { Snowflake, ColorResolvable } from "discord.js";
import { ModLogCaseType } from "./constants.js";

export interface ModLogData {
    reason: string;
    moderator: Snowflake;
    timestamp: number;
    type: ModLogCaseType;
    guild: Snowflake;
    target: Snowflake;
}

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
                return "DARK_RED";
            case ModLogCaseType.KICK:
                return "RED";
            case ModLogCaseType.MODERATED_NICK:
                return "BLURPLE";
            case ModLogCaseType.MUTE:
                return "DARK_GOLD";
            case ModLogCaseType.UNMUTE:
                return "DARK_GREEN";
            case ModLogCaseType.UNBAN:
                return "GREEN";
            case ModLogCaseType.SOFTBAN:
                return "DARK_ORANGE";
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
        };
    }

    build() {
        return this.toJSON();
    }
}
