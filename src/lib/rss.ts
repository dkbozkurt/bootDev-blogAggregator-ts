import { XMLParser } from "fast-xml-parser";

export type RSSItem = {
    title: string;
    link: string;
    description: string;
    pubDate: string;
};

export type RSSFeed = {
    channel: {
        title: string;
        link: string;
        description: string;
        item: RSSItem[];
    };
};

function isNonEmptyString(value: unknown): value is string {
    return typeof value === "string" && value.length > 0;
}

export async function fetchFeed(feedURL: string): Promise<RSSFeed> {
    const response = await fetch(feedURL, {
        headers: {
            "User-Agent": "gator",
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch feed: ${response.status} ${response.statusText}`);
    }

    const xml = await response.text();

    const parser = new XMLParser({ processEntities: false });
    const parsed = parser.parse(xml);

    const channel = parsed?.rss?.channel;
    if (!channel) {
        throw new Error("Invalid RSS feed: missing channel");
    }

    if (
        !isNonEmptyString(channel.title) ||
        !isNonEmptyString(channel.link) ||
        !isNonEmptyString(channel.description)
    ) {
        throw new Error("Invalid RSS feed: missing title, link, or description");
    }

    let rawItems: unknown[] = [];
    if (channel.item) {
        rawItems = Array.isArray(channel.item) ? channel.item : [channel.item];
    }

    const items: RSSItem[] = [];
    for (const item of rawItems) {
        if (
            !item ||
            typeof item !== "object" ||
            !isNonEmptyString((item as RSSItem).title) ||
            !isNonEmptyString((item as RSSItem).link) ||
            !isNonEmptyString((item as RSSItem).description) ||
            !isNonEmptyString((item as RSSItem).pubDate)
        ) {
            continue;
        }

        items.push({
            title: (item as RSSItem).title,
            link: (item as RSSItem).link,
            description: (item as RSSItem).description,
            pubDate: (item as RSSItem).pubDate,
        });
    }

    return {
        channel: {
            title: channel.title,
            link: channel.link,
            description: channel.description,
            item: items,
        },
    };
}
