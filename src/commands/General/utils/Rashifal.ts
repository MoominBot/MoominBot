import { container, inject, injectable } from "tsyringe";
import type { Redis } from "ioredis";
import fetch from "node-fetch";
import cheerio from "cheerio";

import { RashifalMap } from "../../../interactions/slash/General/RashifalCommand.js";

import { kRedis } from "#utils/constants";
import logger from "#utils/logger";

export interface RashifalData {
    name: string;
    alias: string;
    description: string;
    icon: string;
}

@injectable()
class Rashifal {
    public BASE_URL = "https://www.hamropatro.com";
    public TIMEOUT = 3600 * 3;
    constructor(@inject(kRedis) public readonly redis: Redis) {
        this.scrape();
        setInterval(this.scrape, this.TIMEOUT * 1000).unref();
    }

    public async get(rashi: string) {
        // @ts-expect-error rashi name
        const resolved = RashifalMap[rashi] || Object.values(RashifalMap).some((x) => x === rashi) ? rashi : null;
        if (!resolved) return;
        const data = await this.getRashifalData();
        const rashifal = data.find((x) => x.name === resolved || x.alias === resolved);
        return rashifal;
    }

    public async getRashifalData() {
        const existing = (await this.getFromCache()) || (await this.scrape());
        if (!existing) throw new Error("Could not fetch rashifal data!");
        return existing;
    }

    async getFromCache() {
        try {
            const cache = await this.redis.get("rashifal");
            if (!cache) return void 0;
            return JSON.parse(cache) as RashifalData[];
        } catch {
            return void 0;
        }
    }

    async scrape() {
        const rawHTML = await fetch(`${this.BASE_URL}/rashifal`)
            .then((res) => {
                if (!res.ok) return null;
                return res.text();
            })
            .catch(() => null);
        if (!rawHTML) return void logger.warn("[Rashifal] Failed to scrape HamroPatro");
        const $ = cheerio.load(rawHTML);
        const data: RashifalData[] = [];

        $("#rashifal>a>div").each((i, el) => {
            const node = $(el);
            data.push({
                name: node.children("h3").text(),
                // @ts-expect-error rashifal alias
                alias: RashifalMap[node.children("h3").text()],
                description: node.children("div").text().trim(),
                icon: `${this.BASE_URL}/${node.children("img").attr("src")}`
            });
        });

        if (!data.length) return void logger.warn("[Rashifal] Failed to scrape HamroPatro");
        logger.info("[Rashifal] Successfully scraped HamroPatro");

        // expire after 3h
        await this.redis.setex("rashifal", this.TIMEOUT, JSON.stringify(data));

        return data;
    }
}

export default container.resolve(Rashifal);
