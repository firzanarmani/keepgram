import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { input } from "@inquirer/prompts";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { DatabaseError, TelegramError } from "./utils/errors";
import { Database } from "bun:sqlite";
import "dotenv/config";

const apiId = process.env.API_ID;
const apiHash = process.env.API_HASH;
const stringSession = new StringSession(process.env.SESSION ?? "");
const dbFilename = process.env.DB_FILE_NAME;

const initClient = async () => {
  try {
    if (!apiId) {
      throw new TelegramError("Missing Telegram API ID");
    }

    if (!parseInt(apiId)) {
      throw new TelegramError("Telegram API ID should only contain numbers");
    }

    if (!apiHash) {
      throw new TelegramError("Missing Telegram API hash");
    }

    const client = new TelegramClient(stringSession, parseInt(apiId), apiHash, {
      connectionRetries: 5,
    });

    await client.start({
      phoneNumber: async () =>
        await input({ message: "Please enter your number:" }),
      password: async () =>
        await input({ message: "Please enter your password:" }),
      phoneCode: async () =>
        await input({ message: "Please enter the code you received:" }),
      onError: (err) => console.log(err),
    });

    const me = await client.getMe();

    console.log(
      `Welcome to Keepgram ${me.firstName}${
        me.lastName ? ` ${me.lastName}` : ""
      }`
    );

    return client;
  } catch (error) {
    throw new TelegramError(
      `Unable to start Telegram client${
        error ? ` - ${JSON.stringify(error)}` : ""
      } `
    );
  }
};

const initDatabase = () => {
  try {
    if (!dbFilename) {
      throw new DatabaseError("Missing database file path");
    }

    const sqlite = new Database(dbFilename);
    const db = drizzle({ client: sqlite });

    return db;
  } catch (error) {
    throw new DatabaseError(
      `Unable to start database client${
        error ? ` - ${JSON.stringify(error)}` : ""
      } `
    );
  }
};

const run = async () => {
  try {
    const client = await initClient();

    const db = initDatabase();
  } catch (error) {
    if (error instanceof TelegramError || error instanceof DatabaseError)
      console.log("Error ", error.message);
  }
};

run();
