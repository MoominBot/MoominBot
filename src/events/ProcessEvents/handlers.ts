process.on("unhandledRejection", (reason) => {
    // TODO: use logger
    // eslint-disable-next-line no-console
    console.error(`Unhandled promise rejection:\n${reason}`);
});

process.on("uncaughtException", (error, origin) => {
    // TODO: use logger
    // eslint-disable-next-line no-console
    console.error(`Uncaught exception at origin ${origin}:\n${error.stack ?? error}`);
});
