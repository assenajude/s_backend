import winston from "winston";

const log = () => winston.createLogger({
    levels: winston.config.syslog.levels,
    format: winston.format.json(),
    transports: [
        new winston.transports.File({
            filename: 'combined.log',
            level: 'error',
            handleExceptions: true,
            handleRejections: true
        }),
        new winston.transports.Console({
            handleExceptions: true,
            handleRejections: true,
            level: 'info'
        })
    ],
    exitOnError: false
});


export default {log}