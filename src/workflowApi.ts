import { sql, getBlockAttrs,setBlockAttrs } from "./api";
import { Lute } from "siyuan";
import { getProtyleCurrentElement } from "./workflow/utils";
export let workflowApi = { 
    sql:sql, 
    getBlockAttrs:getBlockAttrs,
    setBlockAttrs:setBlockAttrs,
    newNodeID:window.Lute.NewNodeID,
    getProtyleCurrentElement:getProtyleCurrentElement }