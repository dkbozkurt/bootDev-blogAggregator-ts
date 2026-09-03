import { Config, readConfig, setUser } from "./config.js";
export type CommandHandler = (cmdName: string, ...args: string[]) => void;
export type CommandsRegistry = { [key: string]: CommandHandler };
export function handlerLogin(cmdName: string, ...args: string[]): void {
    if(args.length === 0) {
        console.log("Username is required for login.");
        process.exit(1);
    }

    if(args.length > 1) {
        console.log("Too many arguments for login command.");
        process.exit(1);
    }

    const username = args[0];
    setUser(username);
    console.log("User set to:", username);
}

export function registerCommand(registry: CommandsRegistry, cmdName: string, handler: CommandHandler): void {
    if (registry[cmdName]) {
        throw new Error(`Command "${cmdName}" is already registered.`);
    }
    registry[cmdName] = handler;
}

export function runCommand(registry: CommandsRegistry, cmdName: string, ...args: string[]): void {
    const handler: CommandHandler = registry[cmdName];
    if (!handler) {
        throw new Error(`Command "${cmdName}" not found.`);
    }
    handler(cmdName, ...args);
}