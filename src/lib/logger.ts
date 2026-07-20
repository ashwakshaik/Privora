export class Logger {
  private static formatMessage(level: string, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  }

  static info(message: string, ...args: any[]) {
    console.log(this.formatMessage("info", message), ...args);
  }

  static warn(message: string, ...args: any[]) {
    console.warn(this.formatMessage("warn", message), ...args);
  }

  static error(message: string, ...args: any[]) {
    console.error(this.formatMessage("error", message), ...args);
  }
}

export const logger = Logger;
