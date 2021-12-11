// https://github.com/sindresorhus/parse-ms/blob/bb173b5bba0bbb3b059732f9fdd7ab692a4ebaf7/index.js

export default function ms(milliseconds: number): msPayload {
    if (typeof milliseconds !== "number") throw new TypeError("Invalid ms");

    return {
        months: Math.trunc(milliseconds / 2.628e+9),
        weeks: Math.trunc(milliseconds / 6.048e+8),
        days: Math.trunc(milliseconds / 86400000),
        hours: Math.trunc(milliseconds / 3600000) % 24,
        minutes: Math.trunc(milliseconds / 60000) % 60,
        seconds: Math.trunc(milliseconds / 1000) % 60,
        milliseconds: Math.trunc(milliseconds) % 1000,
        microseconds: Math.trunc(milliseconds * 1000) % 1000,
        nanoseconds: Math.trunc(milliseconds * 1e6) % 1000
    };
}

export function format(data: msPayload, fields: Array<keyof msPayload> = []) {
    return Object.entries(data).filter((p) => fields.includes(p[0] as keyof msPayload)).map(([K, V]) => {
        if (V < 1) return "";
        return `${V} ${K}`;
    }).filter(x => x.length > 0).join(", ");
}

export interface msPayload {
    months: number;
    weeks: number;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    milliseconds: number;
    microseconds: number;
    nanoseconds: number;
}