import { Logger } from 'tslog';

const LOG_LEVEL = process.env.LOG_LEVEL;
const LOG_FORMAT = process.env.LOG_FORMAT;

enum LogLevel {
  Debug = 0,
  Info = 1,
  Warn = 2,
  Error = 3
}

export default class logger {
  private readonly logger: Logger<any>;

  private lastTimestamp: number | null = null;

  private name: string;

  private readonly format: 'pretty' | 'json';

  private readonly level: LogLevel;

  constructor({
    name,
    format,
    level
  }: {
    name: string;
    format?: 'pretty' | 'json';
    level?: 'debug' | 'info' | 'warn' | 'error';
  }) {
    this.name = name;
    this.format = format
      ? format
      : LOG_FORMAT
      ? (LOG_FORMAT as 'pretty' | 'json')
      : 'json';

    this.level = this.getLogLevel(LOG_LEVEL ? LOG_LEVEL : level || 'info');

    this.logger = new Logger({
      name: this.name,
      type: this.format,
      overwrite: {
        transportJSON: (obj) => logger.transportJSON(obj, this.format)
      },
      argumentsArrayName: 'args'
    });
  }

  public setName(name: string): void {
    this.name = name;
    this.logger.settings.name = name;
  }

  public getSubLogger({ name }: { name: string }): logger {
    return new logger({
      name: `${this.name}_${name}`
    });
  }

  private shouldLog(selectedLevel: LogLevel, messageLevel: LogLevel): boolean {
    return messageLevel >= selectedLevel;
  }

  private getLogLevel(level: string): LogLevel {
    switch (level.toLowerCase()) {
      case 'debug':
        return LogLevel.Debug;
      case 'info':
        return LogLevel.Info;
      case 'warn':
        return LogLevel.Warn;
      case 'error':
        return LogLevel.Error;
      default:
        throw new Error(`Unknown log level: ${level}`);
    }
  }

  static transportJSON(logObj: any, type: 'pretty' | 'json') {
    const args: any[] = logObj.args;
    const metadata =
      typeof args[args.length - 1] === 'object' &&
      !Array.isArray(args[args.length - 1])
        ? args.pop()
        : {};
    const newLogObj = {
      message: args.join(' '),
      hostname: logObj._meta.hostname,
      name: logObj._meta.name,
      timestamp: logObj._meta.date,
      level: logObj._meta.logLevelName,
      pid: process.pid,
      metadata,
      environment: process.env.ENV_IDENTIFIER || 'unset'
    };

    if (type === 'json') {
      console.log(JSON.stringify(newLogObj));
    } else {
      console.log(newLogObj);
    }
  }

  info(message: any, ...optionalParams: any[]) {
    if (!this.shouldLog(this.level, LogLevel.Info)) return;

    this.logger.info(message, ...optionalParams);
  }

  error(message: any, ...optionalParams: any[]) {
    if (!this.shouldLog(this.level, LogLevel.Error)) return;

    this.logger.error(message, ...optionalParams);
  }

  warn(message: any, ...optionalParams: any[]) {
    if (!this.shouldLog(this.level, LogLevel.Warn)) return;

    this.logger.warn(message, ...optionalParams);
  }

  debug(message: any, ...optionalParams: any[]) {
    if (!this.shouldLog(this.level, LogLevel.Debug)) return;

    this.logger.debug(message, ...optionalParams);
  }

  profile(message: string) {
    if (!this.shouldLog(this.level, LogLevel.Debug)) {
      return;
    }

    const currentTimestamp = Date.now();
    if (this.lastTimestamp !== null) {
      const timeSinceLastCall = currentTimestamp - this.lastTimestamp;
      this.debug(
        `${message} - Time since last profile call: ${timeSinceLastCall} ms`
      );
    } else {
      this.debug(`${message} - Profile started`);
    }
    this.lastTimestamp = currentTimestamp;
  }
}
