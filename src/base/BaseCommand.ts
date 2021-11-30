export interface CommandConfig {
    name: string;
    category?: string;
}

export default class BaseCommand {
    constructor(public readonly config: CommandConfig) {}
    get name() {
        return this.config.name;
    }
    get category() {
        return this.config.category || "Other";
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    public execute(...args: any[]): Promise<any> | any {}
}
