import cron from "node-cron";
import Rashifal from "#utils/Rashifal";
import logger from "#utils/logger";

logger.info("[CRON] Job rashifal loaded!");

cron.schedule("*/30 * * * *", async () => {
    logger.info("[CRON] running ronb job");
    await Rashifal.scrape().catch(() => null);
});
