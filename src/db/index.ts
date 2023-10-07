import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { dbCredentials } from "../../drizzle.config";
import * as schema from "./schema";

const client = createClient(dbCredentials);
export const db = drizzle(client, { schema, logger: true });
