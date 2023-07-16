import { sql, getBlockAttrs,setBlockAttrs } from "./api";
import { Lute } from "siyuan";
import { getProtyleCurrentElement,turnIntoTask,getProtyleElementById,updateDock } from "./workflow/utils";
export let workflowApi = { 
    sql:sql, 
    getBlockAttrs:getBlockAttrs,
    setBlockAttrs:(id: BlockId, attrs: {
        [key: string]: string;
    })=>{setBlockAttrs(id,attrs),updateDock()},
    newNodeID:window.Lute.NewNodeID,
    getProtyleCurrentElement:getProtyleCurrentElement,
    turnIntoTask:turnIntoTask,
    getProtyleElementById: getProtyleElementById,
    updateDock: updateDock
 }