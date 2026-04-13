import config from '../config';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

// i will add here in this file the logger roller

const { logDir, isDev } = config;
const logFileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json(),
  winston.format.splat(),
  winston.format.errors({ stack: true }),
);

const logconsoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),

  winston.format.printf(({ timestamp, level, message, stack }) => {
    return stack
      ? `[${timestamp}] [${level}]:  ${message}\n${stack}`
      : `[${timestamp}] [${level}]:  ${message}`;
  }),
);

const logger = winston.createLogger({
  level: 'info',
  transports: [
    new DailyRotateFile({
      filename: `error-%DATE%.log`,
      dirname: logDir,
      level: 'error',
      format: logFileFormat,
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      auditFile: `${logDir}/error-audit.json`,
    }),
    new DailyRotateFile({
      filename: `all-%DATE%.log`,
      dirname: logDir,
      format: logFileFormat,
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      auditFile: `${logDir}/all-audit.json`,
    }),
  ],
  exceptionHandlers: [
    new DailyRotateFile({
      filename: `exceptions-%DATE%.log`,
      dirname: logDir,
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      auditFile: `${logDir}/exceptions-audit.json`,
      format: logFileFormat,
    }),
  ],
});
if (isDev) {
  logger.add(
    new winston.transports.Console({
      format: logconsoleFormat,
    }),
  );
  logger.level = 'debug';
}
export default logger;
