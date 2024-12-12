import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const message = sqliteTable("message", {
  id: text().primaryKey(),
});
