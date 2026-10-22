import { db } from "..";
import { posts, feeds, feedFollows } from "../../../schema";
import { eq, sql } from "drizzle-orm";

export async function createPost(
    title: string,
    url: string,
    description: string | null,
    publishedAt: Date | null,
    feedId: string,
) {
    const [result] = await db
        .insert(posts)
        .values({
            title: title,
            url: url,
            description: description,
            publishedAt: publishedAt,
            feedId: feedId,
        })
        .onConflictDoNothing()
        .returning();

    // undefined when this url was already stored
    return result;
}

export async function getPostsForUser(userId: string, limit: number) {
    return await db
        .select({
            title: posts.title,
            url: posts.url,
            description: posts.description,
            publishedAt: posts.publishedAt,
            feedName: feeds.name,
        })
        .from(posts)
        .innerJoin(feeds, eq(feeds.id, posts.feedId))
        .innerJoin(feedFollows, eq(feedFollows.feedId, feeds.id))
        .where(eq(feedFollows.userId, userId))
        .orderBy(sql`${posts.publishedAt} desc nulls last`)
        .limit(limit);
}
