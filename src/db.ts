import { config } from 'dotenv';
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from './db/schema/schema';
config({override: true});

export const db = drizzle({
	connection: process.env.DATABASE_URL || "",
	casing: "snake_case",
    schema: schema
});
