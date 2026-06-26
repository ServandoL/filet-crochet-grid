import winston from 'winston';

export const log = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json({
      replacer: (_key, value) => {
        // Safely serialize objects that might contain buffers or circular references
        if (Buffer.isBuffer(value)) {
          return '[Buffer]';
        }
        if (value instanceof Set) {
          return Array.from(value);
        }
        if (value instanceof Map) {
          return Object.fromEntries(value);
        }
        return value;
      }
    })
  ),
  transports: [
    new winston.transports.Console()
  ]
});
