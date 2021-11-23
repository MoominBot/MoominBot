import { ClientEvents } from "discord.js";

export default class BaseEvent {
    public constructor(public readonly name: keyof ClientEvents) {}

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    public execute(...args: any[]): Promise<any> | any {}
}
