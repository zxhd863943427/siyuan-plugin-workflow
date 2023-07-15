import {
    WorkFlow,
    Switcher,
    Grouper,
    Initer,
    Watcher,
    WorkFlowApi,
    Block
} from "@/types/index"
import { getDataNodeId, getElementById, getParentElementById } from "./utils"
import { BlockList } from "net"

import {groupBy} from "ramda"



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


let re = /custom-workflow\s*=\s*"(\{.*\})"/
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
    switcherList:[]
}