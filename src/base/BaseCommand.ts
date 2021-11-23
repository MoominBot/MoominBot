export interface CommandConfig {
    name: string;
}

export default class BaseCommand {
    constructor(public readonly config: CommandConfig) {}
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    public execute(...args: any[]): Promise<any> | any {}
}
