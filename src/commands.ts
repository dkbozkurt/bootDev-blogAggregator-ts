import { readConfig, setUser } from "./config.js";
import { createUser, getUserByName, getUsers, resetUsers } from "./lib/db/queries/users.js";
import { createFeed, getFeeds } from "./lib/db/queries/feeds.js";
import { fetchFeed } from "./lib/rss.js";
export type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;
export type CommandsRegistry = { [key: string]: CommandHandler };
export async function handlerLogin(cmdName: string, ...args: string[]): Promise<void> {
    if (args.length === 0) {
        throw new Error("Username is required for login.");
    }

    if (args.length > 1) {
        throw new Error("Too many arguments for login command.");
    }

    const username = args[0];
    const user = await getUserByName(username);
    if (!user) {
        throw new Error(`User "${username}" does not exist.`);
    }

    setUser(username);
    console.log("User set to:", username);
}

export async function handlerRegister(cmdName: string, ...args: string[]): Promise<void> {
    if (args.length === 0) {
        throw new Error("Username is required for register.");
    }

    if (args.length > 1) {
        throw new Error("Too many arguments for register command.");
    }

    const username = args[0];
    const existingUser = await getUserByName(username);
    if (existingUser) {
        throw new Error(`User "${username}" already exists.`);
    }

    const user = await createUser(username);
    setUser(username);
    console.log("User created successfully!");
    console.log(user);
}

export async function handlerReset(cmdName: string, ...args: string[]): Promise<void> {
    if (args.length !== 0) {
        throw new Error("Too many arguments for reset command.");
    }
    try {
        await resetUsers();
        console.log("Database reset successfully.");
    } catch (error) {
        console.error("Failed to reset the database.");
        throw error;
    }
}

export async function handlerUsers(cmdName: string, ...args: string[]): Promise<void> {
    if (args.length !== 0) {
        throw new Error("Too many arguments for users command.");
    }

    const allUsers = await getUsers();
    const currentUserName = readConfig().currentUserName;

    for (let i = allUsers.length - 1; i >= 0; i--) {
        const user = allUsers[i];
        if (user.name === currentUserName) {
            console.log(`* ${user.name} (current)`);
        } else {
            console.log(`* ${user.name}`);
        }
    }
}

export async function handlerAgg(cmdName: string, ...args: string[]): Promise<void> {
    if (args.length !== 0) {
        throw new Error("Too many arguments for agg command.");
    }

    const feed = await fetchFeed("https://www.wagslane.dev/index.xml");
    console.log(JSON.stringify(feed, null, 2));
}

export async function handlerAddFeed(cmdName: string, ...args: string[]): Promise<void> {
    if (args.length !== 2) {
        throw new Error("Usage: addfeed <name> <url>");
    }

    const [name, url] = args;

    const currentUserName = readConfig().currentUserName;
    const user = await getUserByName(currentUserName);
    if (!user) {
        throw new Error(`Current user "${currentUserName}" does not exist. Log in first.`);
    }

    const feed = await createFeed(name, url, user.id);
    console.log("Feed created successfully!");
    printFeed(feed);
}

function printFeed(feed: { id: string; name: string; url: string; userId: string }): void {
    console.log(`* ID:      ${feed.id}`);
    console.log(`* Name:    ${feed.name}`);
    console.log(`* URL:     ${feed.url}`);
    console.log(`* User ID: ${feed.userId}`);
}

export async function handlerFeeds(cmdName: string, ...args: string[]): Promise<void> {
    if (args.length !== 0) {
        throw new Error("Too many arguments for feeds command.");
    }

    const allFeeds = await getFeeds();
    if (allFeeds.length === 0) {
        console.log("No feeds found.");
        return;
    }

    for (const feed of allFeeds) {
        console.log(`* ${feed.name}`);
        console.log(`  URL:      ${feed.url}`);
        console.log(`  Added by: ${feed.userName}`);
    }
}

export async function registerCommand(registry: CommandsRegistry, cmdName: string, handler: CommandHandler): Promise<void> {
    if (registry[cmdName]) {
        throw new Error(`Command "${cmdName}" is already registered.`);
    }
    registry[cmdName] = handler;
}

export async function runCommand(registry: CommandsRegistry, cmdName: string, ...args: string[]): Promise<void> {
    const handler: CommandHandler = registry[cmdName];
    if (!handler) {
        throw new Error(`Command "${cmdName}" not found.`);
    }
    await handler(cmdName, ...args);
}