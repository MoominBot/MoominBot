import winston from "winston";

const logger = winston.createLogger({
    level: "info",
    format: winston.format.json(),
    defaultMeta: { service: "user-service" },
    transports: [
        new winston.transports.File({ filename: "./logs/error.log", level: "error" }),
        new winston.transports.File({ filename: "./logs/warning.log", level: "warning" }),
        new winston.transports.File({ filename: "./logs/debug.log", level: "debug" }),
        new winston.transports.File({ filename: "./logs/audit.log" })
    ]
});

if (process.env.NODE_ENV !== "production") {
    logger.add(
        new winston.transports.Console({
            format: winston.format.prettyPrint()
        })
    );
}

export default logger;
