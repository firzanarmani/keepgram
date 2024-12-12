export class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class TelegramError extends Error {
  constructor(message: string) {
    super(message);
  }
}
