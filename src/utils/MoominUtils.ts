import { inspect as UtilInspect } from "node:util";

export default class MoominUtils extends null {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    private constructor() {}

    public static toProperCase(str: string) {
        return str.replace(/([^\W_]+[^\s-]*) */g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    }

    public static cleanOutput(text: string, replacers?: { from: string; to: string }[]) {
        if (typeof text !== "string") text = UtilInspect(text, { depth: 2 });

        text = text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/, "@" + String.fromCharCode(8203));

        if (replacers?.length) {
            for (const replacer of replacers) {
                text = text.replace(new RegExp(replacer.from, "g"), replacer.to || "");
            }
        }

        return text;
    }
}
