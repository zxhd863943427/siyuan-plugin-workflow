import { Switcher, WorkFlow } from "@/types";
import { plugin } from "@/utils";
type item = {
    filter:string[]
    id:string
    callback:string
}
export function reSolveWorkflow(workflowData:any){
    let {
        watcher,
        operator,
        searcher,
        grouper,
        initer,
        switcherList} = workflowData
    let workflow:WorkFlow = {
        watcher:eval(watcher),
        operator:(operator as Array<string>).map((f)=>eval(f)),
        searcher:searcher,
        grouper:eval(grouper),
        initer:eval(initer),
        switcherList:reSolveSwitcherList(switcherList)
    }
    return workflow
}

function reSolveSwitcherList(switcherList:Array<item>):Switcher{
    return switcherList.map((data)=>{
        let html = `<div class="b3-list-item__first"><span class="b3-list-item__text">${data.id}</span></div>`
        let callback = (eval(data.callback))(plugin)
        let switcher={
            filter:data.filter,
            id:data.id,
            html:html,
            callback:callback
        }
        return switcher
    })
}