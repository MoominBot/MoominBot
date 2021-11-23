import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

export const __filename = (url = import.meta.url) => fileURLToPath(url);
export const __dirname = (url = import.meta.url) => dirname(__filename(url));
