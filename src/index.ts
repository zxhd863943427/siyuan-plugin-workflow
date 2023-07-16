import {
    Plugin,
    showMessage,
    confirm,
    Dialog,
    Menu,
    openTab,
    adaptHotkey,
    getFrontend,
    getBackend,
    IModel,
    Setting,
    fetchPost,
    Protyle
} from "siyuan";

import "@/index.scss";
import { info, setApp, setI18n, setIsMobile, setPlugin, setWorkFlow, workflow } from './utils';
import { workflowApi } from "./workflowApi";

import SettingPannel from "@/libs/setting-panel.svelte";
import { todoWorkFlow } from "./workflow/todo";
import { allWorkFlow, workFlowOption } from "./allWorkFlow";

import TaskPannel from "@/components/task-pannel.svelte";

const STORAGE_NAME = "menu-config";
const DOCK_TYPE = "dock_tab";

export default class PluginWorkflow extends Plugin {

    private customTab: () => IModel;
    private isMobile: boolean;

    async onload() {
        info('workflow Plugin load');
        setWorkFlow(todoWorkFlow)

        this.data[STORAGE_NAME] = {readonlyText: "Readonly"};

        console.log("loading plugin-sample", this.i18n);

        const frontEnd = getFrontend();


        this.isMobile = frontEnd === "mobile" || frontEnd === "browser-mobile";

        setIsMobile(this.isMobile);

        setI18n(this.i18n); //设置全局 i18n
        setApp(this.app); //设置全局 app
        setPlugin(this); //设置全局 plugin


        const topBarElement = this.addTopBar({
            icon: "iconFace",
            title: this.i18n.addTopBarIcon,
            position: "right",
            callback: () => {
                this.openDIYSetting()
            }
        });
        this.protyleSlash = workflow.switcherList
        // this.eventBus.on("ws-main",this.eventBusLog)
        this.eventBus.on("ws-main",this.mainEvent)
        console.log("start")


    }

    onLayoutReady() {
        this.loadData(STORAGE_NAME);
        console.log(`frontend: ${getFrontend()}; backend: ${getBackend()}`);
        workflow.initer(workflow.searcher,workflowApi)

        this.addDock({
            config: {
                position: "LeftBottom",
                size: {width: 200, height: 0},
                icon: "iconPlay",
                title: "workflow",
            },
            data: {
                text: "This is my custom dock"
            },
            type: DOCK_TYPE,
            async init() {
                // let blockList = await sql(workflow.searcher)
                // let grouped = workflow.grouper(blockList,workflowApi)
                // console.log(grouped)
                this.element.innerHTML = `<div id="TaskPanel"></div>`
                let panel = new TaskPannel({
                    target: this.element.querySelector("#TaskPanel"),
                    props:{workFlow:workflow}
                })
            },
            destroy() {
                console.log("destroy dock:", DOCK_TYPE);
            }
        });
    }

    onunload() {
        console.log(this.i18n.byePlugin);
        showMessage("Goodbye SiYuan Plugin");
        console.log("onunload");
    }

    /**
     * A custom setting pannel provided by svelte
     */
    openDIYSetting(): void {
        let dialog = new Dialog({
            title: "设置",
            content: `<div id="workFlowSettingPanel"></div>`,
            width: "600px",
            destroyCallback: (options) => {
                console.log("destroyCallback", options);
                //You'd better destroy the component when the dialog is closed
                pannel.$destroy();
            }
        });
        let pannel = new SettingPannel({
            target: dialog.element.querySelector("#workFlow"),
            props:{
                allWorkFlow:allWorkFlow,
                option:workFlowOption
            }
        });
    }

    private mainEvent({detail}: any) {
        if (detail.cmd === "transactions"){
            setTimeout(doWorkflow,1500)
        }

        function doWorkflow() {
            let operatorIndex = workflow.watcher(detail, workflowApi);
            let customOperator = workflow.operator[operatorIndex];
            customOperator(detail, workflowApi);
        }
    }
}
