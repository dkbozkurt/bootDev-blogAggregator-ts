import os from "os";
import path from "path";
import fs from "fs";

const configPath = path.join(os.homedir(),".gatorconfig.json");

export type Config = {
    dbUrl: string;
    currentUserName: string;
}

export function setUser(userName: string): void {
    const cfg = readConfig();
    cfg.currentUserName = userName;
    writeConfig(cfg);
}

export function readConfig(): Config {
    const configData = fs.readFileSync(getConfigFilePath(), "utf-8");
    return validateConfig(JSON.parse(configData));
}

export function writeConfig(cfg: Config): void {
    fs.writeFileSync(
        getConfigFilePath(),
        JSON.stringify(
            { db_url: cfg.dbUrl, current_user_name: cfg.currentUserName }, null, 2
        ));
}

export function getConfigFilePath(): string {
    return configPath;
}

export function validateConfig(rawConfig: any): Config {
    return {
        dbUrl: rawConfig.db_url,
        currentUserName: rawConfig.current_user_name ?? "",
    };
}