import logger from "#utils/logger";

process.on("unhandledRejection", (reason) => {
    logger.error(`Unhandled promise rejection:\n${reason}`);
});

process.on("uncaughtException", (error, origin) => {
    logger.error(`Uncaught exception at origin ${origin}:\n${error.stack ?? error}`);
});
