import { sql, getBlockAttrs,setBlockAttrs } from "./api";
import { Lute } from "siyuan";
import { getProtyleCurrentElement,turnIntoTask,getProtyleElementById } from "./workflow/utils";
export let workflowApi = { 
    sql:sql, 
    getBlockAttrs:getBlockAttrs,
    setBlockAttrs:(id: string, attrs: { [key: string]: string })=>{setTimeout(()=>{setBlockAttrs(id,attrs)},500)},
    newNodeID:window.Lute.NewNodeID,
    getProtyleCurrentElement:getProtyleCurrentElement,
    turnIntoTask:turnIntoTask,
    getProtyleElementById: getProtyleElementById }