import { Config, readConfig, setUser } from "./config.js";
function main()
{
    setUser("DogukanKaanBozkurt");
    const conf: Config = readConfig();

    console.log(conf);
}
main();