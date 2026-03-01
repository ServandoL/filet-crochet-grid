import winston from 'winston';

export const log = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: {service: 'filet-crochet-grid'},
  transports: [
    new winston.transports.Console()
  ]
});
