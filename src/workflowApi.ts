import { sql, getBlockAttrs,setBlockAttrs } from "./api";
import { Lute } from "siyuan";
export let workflowApi = { 
    sql:sql, 
    getBlockAttrs:getBlockAttrs,
    setBlockAttrs:setBlockAttrs,
    newNodeID:window.Lute.NewNodeID }