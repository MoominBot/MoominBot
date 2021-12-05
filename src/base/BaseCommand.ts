import { __dirname } from "#utils/dirname";

export interface CommandConfig {
    name: string;
    category?: string;
    path?: string;
}

export default class BaseCommand {
    constructor(public readonly config: CommandConfig) {}
    get name() {
        return this.config.name;
    }
    get category() {
        return this.config.category || "Other";
    }
    get path() {
        const commandPath = this.config.path || __dirname(import.meta.url);
        return commandPath;
    }
    setPath(p: string) {
        this.config.path = p;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    public execute(...args: any[]): Promise<any> | any {}

    public toString() {
        return `Command<${this.name}<{${this.category}}>>`;
    }

    public toJSON() {
        return {
            name: this.name,
            category: this.category
        };
    }

    public valueOf() {
        return this.name;
    }
}
