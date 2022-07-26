import cron from "node-cron";
import Bidas from "#utils/bidas";
import logger from "#utils/logger";

logger.info("[CRON] Job bidas loaded!");

cron.schedule("*/300 * * * *", async () => {
    logger.info("[CRON] running bidas job");
    await Bidas.fetch().catch(() => null);
});
