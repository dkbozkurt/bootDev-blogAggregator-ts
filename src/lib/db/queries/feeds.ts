import { db } from "..";
import { feeds, users } from "../../../schema";
import { eq } from "drizzle-orm";

export async function createFeed(name: string, url: string, userId: string) {
    const [result] = await db
        .insert(feeds)
        .values({ name: name, url: url, userId: userId })
        .returning();
    return result;
}

export async function getFeeds() {
    return await db
        .select({
            name: feeds.name,
            url: feeds.url,
            userName: users.name,
        })
        .from(feeds)
        .innerJoin(users, eq(users.id, feeds.userId));
}

export async function getFeedByUrl(url: string) {
    const [feed] = await db.select().from(feeds).where(eq(feeds.url, url));
    return feed;
}
