import { db } from "..";
import { posts } from "../../../schema";

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
