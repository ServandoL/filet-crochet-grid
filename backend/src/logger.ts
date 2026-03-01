import winston from 'winston';

export const log = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: {date: new Date().toISOString()},
  transports: [
    new winston.transports.Console()
  ]
});
