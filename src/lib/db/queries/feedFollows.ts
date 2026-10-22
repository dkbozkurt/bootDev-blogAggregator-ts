import { db } from "..";
import { feedFollows, feeds, users } from "../../../schema";
import { eq } from "drizzle-orm";

export async function createFeedFollow(userId: string, feedId: string) {
    const [newFeedFollow] = await db
        .insert(feedFollows)
        .values({ userId: userId, feedId: feedId })
        .returning();

    const [result] = await db
        .select({
            id: feedFollows.id,
            createdAt: feedFollows.createdAt,
            feedName: feeds.name,
            userName: users.name,
        })
        .from(feedFollows)
        .innerJoin(feeds, eq(feeds.id, feedFollows.feedId))
        .innerJoin(users, eq(users.id, feedFollows.userId))
        .where(eq(feedFollows.id, newFeedFollow.id));

    return result;
}

export async function getFeedFollowsForUser(userId: string) {
    return await db
        .select({
            feedName: feeds.name,
            feedUrl: feeds.url,
            userName: users.name,
        })
        .from(feedFollows)
        .innerJoin(feeds, eq(feeds.id, feedFollows.feedId))
        .innerJoin(users, eq(users.id, feedFollows.userId))
        .where(eq(feedFollows.userId, userId));
}
