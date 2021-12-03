import fetch from "node-fetch";
import type { Redis } from "ioredis";
import { kRedis } from "./tokens.js";
import { container } from "tsyringe";
import parseJSON from "./safeJSON.js";
import cheerio from "cheerio";

const redis = container.resolve<Redis>(kRedis);

export default async function neb(dob: string, symbolNo: string) {
    const cached = parseJSON<NEBResult>((await redis.get(`neb::${dob}::${symbolNo}`)) as string);
    if (cached) return cached;

    const body = `symbol=${symbolNo}&dob=${dob}&submit=Submit`;
    const res = await fetch("https://neb.ntc.net.np/results.php", {
        headers: {
            accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
            "accept-language": "en-US,en;q=0.9",
            "cache-control": "max-age=0",
            "content-type": "application/x-www-form-urlencoded",
            "sec-ch-ua": '" Not A;Brand";v="99", "Chromium";v="96", "Google Chrome";v="96"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Linux"',
            "sec-fetch-dest": "document",
            "sec-fetch-mode": "navigate",
            "sec-fetch-site": "same-origin",
            "sec-fetch-user": "?1",
            "upgrade-insecure-requests": "1",
            cookie: "__utmc=255014551; __utma=255014551.990391173.1638377986.1638510000.1638514682.4; __utmz=255014551.1638514682.4.4.utmcsr=google|utmccn=(organic)|utmcmd=organic|utmctr=(not%20provided); __utmt=1; __utmb=255014551.1.10.1638514682",
            Referer: "https://neb.ntc.net.np/"
        },
        method: "POST",
        body
    })
        .then((res) => res.text())
        .then(scrape)
        .catch(() => null);

    if (!res) return null;
    await redis.set(`neb::${dob}::${symbolNo}`, JSON.stringify(res));
    return res;
}

function scrape(html: string) {
    if (!html.includes("slcframe")) return null;
    const $ = cheerio.load(html);

    const resultData = {
        subjects: [],
        gpa: 0,
        name: null,
        school: null,
        registration: null,
        symbol: null
    } as NEBResult;

    const ele = $(".slcframe>table");
    const personalInfo = ele.html();
    if (!personalInfo) return null;

    Object.assign(resultData, {
        name: personalInfo?.split("<b>Name</b> : ")[1]?.split("<br>")[0] || null,
        school: personalInfo?.split("<b>School Name</b> : ")[1]?.split("<br>")[0],
        symbol: personalInfo?.split("<b>Symbol</b> : ")[1]?.split(" ")[0] || null,
        registration: personalInfo?.split("<b>Registration No</b> : ")[1]?.split("<br>")[0] || null
    });

    const childs = ele.children().find("table").children("tbody").children();
    childs.each((ii, ele) => {
        if (ii < 1) return;
        const data = $(ele)
            .children()
            .map((i, v) => $(v).text());

        if (data[0].includes("GPA") && typeof data[1] === "string") {
            resultData.gpa = parseFloat(data[1]);
            return;
        }

        resultData.subjects.push({
            code: data[0],
            name: data[1],
            creditHours: data[2],
            grade: data[3]
        });
    });

    return resultData;
}

export interface NEBSubjects {
    code: string;
    name: string;
    creditHours: string;
    grade: string;
}

export interface NEBResult {
    subjects: NEBSubjects[];
    gpa: number;
    name: string | null;
    school: string | null;
    symbol: string | null;
    registration: string | null;
}
