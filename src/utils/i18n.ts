import i18next from "i18next";
import Backend from "i18next-fs-backend";

import { join } from "path";
import { readdirSync, lstatSync } from "fs";
import { __dirname } from "#utils/dirname";

const preloadData = readdirSync(join(__dirname(import.meta.url), "../locales")).filter((fileName) => {
    const joinedPath = join(join(__dirname(import.meta.url), "../locales"), fileName);
    const isDirectory = lstatSync(joinedPath).isDirectory();
    return isDirectory;
});

i18next.use(Backend).init({
    initImmediate: false,
    fallbackLng: "en-US",
    lng: "en-US",
    preload: preloadData,
    ns: ["default", "commands"],
    defaultNS: "default",
    backend: {
        loadPath: join(__dirname(import.meta.url), "../locales/{{lng}}/{{ns}}.json")
    }
});
