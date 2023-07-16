import {
    WorkFlow,
    Switcher,
    Grouper,
    Initer,
    Watcher,
    WorkFlowApi,
    Block
} from "@/types/index"
import { getDataNodeId, getElementById, getParentElementById, reSolveSwitcherFunction, switchToFinish, switchToUnFinish } from "./utils"
import { saveViaTransaction } from "./transaction"
import { BlockList } from "net"

import {groupBy} from "ramda"
import { Protyle } from "siyuan"
import { workflowApi } from "@/workflowApi"



type workflowAttr = {
    date:string,
    status:"todo"|"doing"|"done"|"delete",
}



let countain = document.createElement("div")
function escape(str:string){
    countain.innerHTML = str
    return countain.innerText
} 

let watcher:Watcher = function (wsDetail,api):number{
    if(wsDetail?.data[0]?.doOperations[0]?.action != "update"){
        return 0
    }
    console.log(wsDetail)
    let dataId = getDataNodeId(wsDetail.data[0].doOperations[0])
    if (!dataId){
        return 0
    }
    let element = getElementById(dataId)
    if (!element){
        return 0
    }
    let attr = element.getAttribute("custom-workflow")
    if (!attr){
        return 0
    }
    attr = escape(attr)
    let status:workflowAttr = JSON.parse(attr)
    let isFinish = element.getAttribute("class").includes("protyle-task--done")
    if((status.status === "todo" || status.status === "doing") && isFinish){
        return 1
    }
    if(status.status === "done" && !isFinish){
        return 2
    }
    else{
        return 0
    }
}

let operator = [
    ()=>{},
    (wsDetail:any,api:WorkFlowApi)=>{
        let dataId = getDataNodeId(wsDetail.data[0].doOperations[0])
        let updateWorkFlowAttr:workflowAttr = {
            date:api.newNodeID().slice(0,8),
            status:"done"
        }
        api.setBlockAttrs(dataId,{
            "custom-workflow":JSON.stringify(updateWorkFlowAttr)
        })
    },
    (wsDetail:any,api:WorkFlowApi)=>{
        let dataId = getDataNodeId(wsDetail.data[0].doOperations[0])
        let updateWorkFlowAttr:workflowAttr = {
            date:api.newNodeID().slice(0,8),
            status:"todo"
        }
        api.setBlockAttrs(dataId,{
            "custom-workflow":JSON.stringify(updateWorkFlowAttr)
        })
    }
]


let re = /custom-workflow\s*=\s*"((&#123;|\{).*(&#125;|\}))"/
let groupFunc = groupBy((block:Block)=>{
    let match = re.exec(block.ial)
    if (!match){
        return "undefined"
    }
    countain.innerHTML = match[1]
    let attr:workflowAttr = JSON.parse(countain.innerText)
    return attr.status
})

let grouper:Grouper = function(BlockList:Array<Block>,api):Partial<Record<"undefined" | "done" | "todo" | "doing" | "delete", Block[]>>{
    
    let grouped = groupFunc(BlockList)
    return grouped
}

function setWorkElementAttr(workElement: Element, api: WorkFlowApi, type: workflowAttr["status"]) {
    let taskElementId = workElement.getAttribute("data-node-id")
    let updateWorkFlowAttr: workflowAttr = {
        date: api.newNodeID().slice(0, 8),
        status: type
    }
    {setTimeout(()=>{api.setBlockAttrs(taskElementId, {
        "custom-workflow": JSON.stringify(updateWorkFlowAttr)
    })},2000)}
}

function getWorkElement(currentElement: Element, protyle: Protyle, api: WorkFlowApi) {
    let id = currentElement.getAttribute("data-node-id")
    let parentElement = currentElement.parentElement
    let workElement: Element
    if (!parentElement || parentElement.getAttribute("data-subtype") != "t") {
        workflowApi.turnIntoTask(protyle, currentElement as HTMLElement)
        workElement = api.getProtyleElementById(protyle, id).parentElement
    }
    else {
        workElement = parentElement
    }
    return workElement
}


function ToDo(protyle:Protyle,api:WorkFlowApi){
    let currentElement = workflowApi.getProtyleCurrentElement(protyle)
    if (!currentElement){
        return
    }
    // protyle.insert(`◇${type}`)
    protyle.insert(`<span></span>`)
    let workElement: Element = getWorkElement(currentElement, protyle, api)
    switchToUnFinish(workElement as HTMLElement)
    setWorkElementAttr(workElement, api, "todo")
}
function Doing(protyle:Protyle,api:WorkFlowApi){
    let currentElement = workflowApi.getProtyleCurrentElement(protyle)
    if (!currentElement){
        return
    }
    // protyle.insert(`◇${type}`)
    protyle.insert(`<span></span>`)
    let workElement: Element = getWorkElement(currentElement, protyle, api)
    switchToUnFinish(workElement as HTMLElement)
    setWorkElementAttr(workElement, api, "doing")
}

function Done(protyle:Protyle,api:WorkFlowApi){
    let currentElement = workflowApi.getProtyleCurrentElement(protyle)
    if (!currentElement){
        return
    }
    // protyle.insert(`◇${type}`)
    protyle.insert(`<span></span>`)
    let workElement: Element = getWorkElement(currentElement, protyle, api);
    switchToFinish(workElement as HTMLElement)
    setWorkElementAttr(workElement, api, "done")
}
function Delete(protyle:Protyle,api:WorkFlowApi){
    let currentElement = workflowApi.getProtyleCurrentElement(protyle)
    if (!currentElement){
        return
    }
    // protyle.insert(`◇${type}`)
    protyle.insert(`<span></span>`)
    let workElement: Element = getWorkElement(currentElement, protyle, api);
    switchToFinish(workElement as HTMLElement)
    setWorkElementAttr(workElement, api, "delete")
}

export let todoWorkFlow:WorkFlow ={
    watcher:watcher,
    operator:operator,
    searcher:`SELECT *
    FROM blocks
    WHERE id IN (
        SELECT block_id
        FROM attributes AS a
        WHERE (a.name = 'custom-workflow' AND (
    a.value like '%todo%' OR 
    a.value like '%doing%' OR
    a.value like '%done%'))
    );`,
    grouper:grouper,
    initer:()=>{},
    switcherList:[
        reSolveSwitcherFunction(ToDo,workflowApi),
        reSolveSwitcherFunction(Doing,workflowApi),
        reSolveSwitcherFunction(Done,workflowApi),
        reSolveSwitcherFunction(Delete,workflowApi)]
}