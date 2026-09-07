import { db } from "..";
import { users } from "../../../schema";
import { eq,sql } from "drizzle-orm";

export async function createUser(name: string) {
    const [result] = await db.insert(users).values({ name: name }).returning();
    return result;
}

export async function getUserByName(name: string) {
    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.name, name));
    return user;
}

export async function resetUsers() {
    await db.delete(users).execute();
}
