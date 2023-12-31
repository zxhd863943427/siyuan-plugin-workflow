import zh_Hans from "./i18n/zh_CN.json";
import en_US from "./i18n/en_US.json";
import { App, Plugin } from "siyuan";
import { WorkFlow } from "./types";

//@ts-ignore
export const lute = window.Lute!.New();
export type I18N = typeof zh_Hans;

export function checkI18n(): boolean {
    function checkKeys(obj1: any, obj2: any): boolean {
        if (typeof obj1 !== typeof obj2) return false;
        if (typeof obj1 === "object") {
            for (const key in obj1) {
                if (!checkKeys(obj1[key], obj2[key])) return false;
            }
        }
        return true;
    }
    return checkKeys(zh_Hans, en_US);
}

// if (!checkI18n()) {
//     showMessage('i18n check failed', 5000, 'error');
// }

export function info(...msg: any[]): void {
    console.log(`[Workflow][INFO] ${msg}`);
}

export function error(...msg: any[]): void {
    console.error(`[Workflow][ERROR] ${msg}`);
}

export function warn(...msg: any[]): void {
    console.warn(`[Workflow][WARN] ${msg}`);
}

export let i18n: I18N;
export function setI18n(i18n_: any) {
    i18n = i18n_;
}

export let isMobile: boolean;
export function setIsMobile(isMobile_: boolean) {
    isMobile = isMobile_;
}

export let app: App;
export function setApp(app_: App) {
    app = app_;
}

export let plugin: Plugin;
export function setPlugin(plugin_: Plugin) {
    plugin = plugin_;
}

export let workflow: WorkFlow;
export function setWorkFlow(workflow_: WorkFlow) {
    workflow = workflow_;
}