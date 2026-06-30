export class DataBaseConnectionException extends Error {
  constructor(message: string, error: Error) {
    super(message);
    this.name = 'DataBaseConnectionException';
    this.stack = error.stack;
    this.message = `${message}: ${error.message}`;
  }
}
