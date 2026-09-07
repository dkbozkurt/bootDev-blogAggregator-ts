import { CommandsRegistry, registerCommand, runCommand, handlerLogin, handlerRegister, handlerReset, handlerUsers } from "./commands.js";
import { argv } from "process";

async function main() {
    // setUser("DogukanKaanBozkurt");
    // const conf: Config = readConfig();
    // console.log(conf);

    // how you get input arguments in TypeScript and slice the first two elements (node and script path)
    const args = process.argv.slice(2);

    if (args.length < 1) {
        console.log("No command provided.")
        process.exit(1);
    }

    const cmdName = args[0];
    const cmdArgs = args.slice(1);

    const commandsRegistry: CommandsRegistry = {};
    registerCommand(commandsRegistry, "login", handlerLogin);
    registerCommand(commandsRegistry, "register", handlerRegister);
    await registerCommand(commandsRegistry, "reset", handlerReset);
    await registerCommand(commandsRegistry, "users", handlerUsers);

    try {
        await runCommand(commandsRegistry, cmdName, ...cmdArgs);
        process.exit(0);
    } catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error(error);
        }
        process.exit(1);
    }
}

main();